const express = require('express')
//creating an express instance
const app = express()
const cookieSession = require('cookie-session')
const bodyParser = require('body-parser')
const passport = require('passport')

//getting the local authentication type
const LocalStrategy = require('passport-local').Strategy

const mysql = require('mysql')
const cors = require('cors')

const bcrypt = require('bcrypt');
const saltRounds = 10;

const port = 3000


var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'final_project'
  })

app.use(cors({ 
				origin: ["http://wpgroup3.engr.ship.edu:8082", "http://wpgroup3.engr.ship.edu:8083"],
				credentials: true 
		}));

app.use(bodyParser.json());

app.use(cookieSession({
	name: 'mysession',
	keys: ['vueauthrandomkey'],
	maxAge: 1 * 60 * 60 * 1000 //hour * minute * second * millisecond
}))
app.use(passport.initialize());
app.use(passport.session());


app.get('/allProducts', (req, res) => {
	connection.query('SELECT * FROM products', function(err, results) 
	{
		if (err) throw err
		res.send(results);
	})
	console.log('You are now connected...')
});


app.get('/HomePage/:string', (req, res) => {
	res.header("Access-Control-Allow-Origin", "http://wpgroup3.engr.ship.edu:8082");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	
	var string = addTildasToString(req.params.string); //put ~ before each special
	string = string.substring(1);

	const statement = `
		SELECT * FROM products WHERE (
			name LIKE '%${string}%' ESCAPE '~' OR 
			description LIKE '%${string}%' ESCAPE '~');
    `;
  
	connection.query(statement, function(err, results) 
	{
		if (err) throw err
		res.send(results);
	})
	console.log(statement)
})


function addTildasToString(stringToFix) {
	var newString = stringToFix.replace("%", "~%");
	newString = newString.replace("_", "~_");
	newString = newString.replace("[", "~[");
	newString = newString.replace("]", "~]");
	newString = newString.replace("^", "~^");
	// console.log(newString);
	return newString;
}


const authMiddleware = (req, res, next) => {
	if(!req.isAuthenticated()) {
		res.status(401).send('Authentication failure')
	}else {
		return next()
	}
}

app.get('/HomePage/addToCart/:data', authMiddleware, (req, res) => {

	res.header("Access-Control-Allow-Origin", "http://wpgroup3.engr.ship.edu:8082");
 	res.header('Access-Control-Allow-Credentials', true);
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	
	var data = req.params.data;
	data = data.substring(1);
	dataArray = data.split('~')

	const statement = `
		INSERT INTO cart VALUES (${req.session.passport.user}, ${dataArray[0]}, ${dataArray[1]});
    `;
    
    console.log('stmt: '+ statement);
  
	connection.query(statement, function(err, results) 
	{
		console.log('cart changed: ' + results.length + ' rows affected.');
		if (err) throw err;
	})
})

app.get('/getCartSize', authMiddleware, (req, res) => {
	res.header('Access-Control-Allow-Origin', 'http://wpgroup3.engr.ship.edu:8082');
	res.header('Access-Control-Allow-Credentials', true);
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

	connection.query("SELECT SUM(quantity) AS total FROM cart WHERE user_id = '"+req.session.passport.user+"'", function(err, result)
	{
		if (err) {
			console.log(err)
			res.send("Failed to retrieve data")
		}else
		{
   console.log(result);
			res.send(result);
		}
	})
})

app.get('/getCartCost', authMiddleware, (req, res) => {
	res.header('Access-Control-Allow-Origin', 'http://wpgroup3.engr.ship.edu:8082');
	res.header('Access-Control-Allow-Credentials', true);
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

console.log("stufff");
	connection.query("SELECT SUM(products.price*cart.quantity) AS total FROM cart INNER JOIN products on cart.product_id = products.product_id WHERE cart.user_id = '"+req.session.passport.user+"'", function(err, result)
	{
		if (err) {
			console.log(err)
			res.send("Failed to retrieve data")
		}else
		{
   console.log("stuff");
   console.log(result);
   console.log(result.total);
   //console.log(result.data.total);
			res.send(result);
		}
	})
})



passport.use(
	new LocalStrategy(
		{
			//override default to "email"
			usernameField: "email",
			passwordField: "password"
		},
 
		(email, password, done) => {
			
			connection.query("SELECT * FROM users WHERE email = '"+email+"'", function(err, rows)
			{
				if(err){
					console.log(err)
					return done(err)
				}
				
				if(!rows.length){
					return done(null, false, { message: 'Incorrect username or password' })
				}

				bcrypt.compare(password, rows[0].password, function(err, result){
					if(err)
					{
						console.log(err) 
					}
					if(result == false)
					{
						console.log(result)
						return done(null, false, { message: 'Incorrect username or password' })
					}
					if(result == true)
					{
						console.log(result)
						return done(null, rows[0].user_id);
					}
				})

				/*
				//unhashed version
				if(!(rows[0].password == password)){
					return done(null, false, { message: 'Incorrect username or password' }) 
				}
				
				return done(null, rows[0].user_id);
				*/
			})
		}

	)
)	


app.get('/cartData', authMiddleware, (req, res) => {
	res.header('Access-Control-Allow-Origin', 'http://wpgroup3.engr.ship.edu:8082');
	res.header('Access-Control-Allow-Credentials', true);
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	
	connection.query("SELECT products.product_id, products.name, products.price, cart.quantity FROM cart INNER JOIN products on cart.product_id = products.product_id WHERE cart.user_id = '"+req.session.passport.user+"'", function(err, results) 
	{
		if (err)
		{
			console.log(err)
		}else
		{
			res.send(results);
		}
	})
});


app.listen(port, () => {

  console.log(`App listening at http://localhost:${port}`)
})
