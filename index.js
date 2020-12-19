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

/*
//local "database" array for testing
let users = [
  {
    id: 1,
    name: "Jude",
    email: "user@email.com",
    password: "password"
  },
  {
    id: 2,
    name: "Emma",
    email: "emma@email.com",
    password: "password2"
  }
]
*/
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


app.post('/login', (req, res, next) => {
	res.header('Access-Control-Allow-Origin', 'http://wpgroup3.engr.ship.edu:8082');
	res.header('Access-Control-Allow-Credentials', true);
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  
	passport.authenticate('local', (err, user, info) => {
		if (err) {
			return next(err);
		}
		if (!user) {
			return res.status(400).send([user, "Login failure", info]);
		}
		req.login(user, err => {
			console.log("Login successful")
			res.send("Login successful")
		})
	})(req, res, next);
});

app.get('/logout', function(req, res) {
	res.header('Access-Control-Allow-Origin', 'http://wpgroup3.engr.ship.edu:8082');
	res.header('Access-Control-Allow-Credentials', true);
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	
	req.logout();
	
	console.log("Logout successful")
	
	return res.send();
});

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

/*
app.get('/getCartSizee/:user', (req, res) => {
	//res.header("Access-Control-Allow-Origin", "http://wpgroup3.engr.ship.edu:8082");
	//res.header("Access-Control-Allow-Headers", "X-Requested-With");

	var data = req.params.data;
	data = data.substring(1);
	connection.query("SELECT SUM(quantity) AS total FROM cart WHERE user_id = '"+data+"'", function(err, result)
	{
		if (err) {
			console.log(err)
			res.send("Failed to retrieve data")
		}else
		{
    console.log(result);
			//res.send(result.rows.item(0).total);
      res.send(result.data);
		}
	})
})


app.get('/getCartCost/:user', (req, res) => {
	res.header("Access-Control-Allow-Origin", "http://wpgroup3.engr.ship.edu:8082");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");

	connection.query("SELECT SUM(products.price*cart.quantity) FROM cart INNER JOIN products on cart.product_id = products.product_id WHERE cart.user_id = '"+req.params.user+"'", function(err, result)
	{
		if (err) {
			console.log(err)
			res.send("Failed to retrieve data")
		}else
		{
   //console.log(result);
			res.send(result);
		}
	})
})
*/

app.get('/user', authMiddleware, (req, res) => {
	res.header('Access-Control-Allow-Origin', 'http://wpgroup3.engr.ship.edu:8082');
	res.header('Access-Control-Allow-Credentials', true);
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

	/*
	//local array version
	let user = users.find(user => {
		return user.id === req.session.passport.user
	})

	//console.log([user, req.session])
	
	res.send({ user: user })
	*/
	connection.query("SELECT * FROM users WHERE user_id = '"+req.session.passport.user+"'", function(err, rows)
	{
		if (err) {
			console.log(err)
			res.send("Failed to retrieve user")
		}else
		{
			console.log(rows)
			res.send(rows[0]);
		}
	})
})

app.post('/update', authMiddleware, (req, res) => {
	res.header('Access-Control-Allow-Origin', 'http://wpgroup3.engr.ship.edu:8082');
	res.header('Access-Control-Allow-Credentials', true);
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	
	bcrypt
		.hash(req.body.password, saltRounds)
		.then(hash => 
		{
			//only store hashed password if the password is new
			connection.query("SELECT password FROM users WHERE user_id='"+req.session.passport.user+"'", function(err, rows)
			{
				if(err)
				{
					console.log(err)
				}else
				{
					if(rows[0].password === req.body.password)
					{
						console.log("stored password: %s", rows[0].password)
						var pwd = req.body.password; 
						console.log("repeat password: %s", pwd)
						
						connection.query("UPDATE users SET email='"+req.body.email+"', password='"+pwd+"', full_name='"+req.body.full_name+"', city='"+req.body.city+"', state='"+req.body.state+"', postal_code='"+req.body.postal_code+"', phone='"+req.body.phone+"' WHERE user_id = '"+req.session.passport.user+"'" , function(err, rows)
						{
							if(err){
								console.log(err)
								res.send("Update failure")
							}else
							{
								console.log(rows)
								res.send("Update successful")
							}
						})
					}else
					{
						console.log("new password: %s", hash)
						
						connection.query("UPDATE users SET email='"+req.body.email+"', password='"+hash+"', full_name='"+req.body.full_name+"', city='"+req.body.city+"', state='"+req.body.state+"', postal_code='"+req.body.postal_code+"', phone='"+req.body.phone+"' WHERE user_id = '"+req.session.passport.user+"'" , function(err, rows)
						{
							if(err){
								console.log(err)
								res.send("Update failure")
							}else
							{
								console.log(rows)
								res.send("Update successful")
							}
						})
					}
				}
			})
			
			/*
			console.log(hash)
			connection.query("UPDATE users SET email='"+req.body.email+"', password='"+hash+"', full_name='"+req.body.full_name+"', city='"+req.body.city+"', state='"+req.body.state+"', postal_code='"+req.body.postal_code+"', phone='"+req.body.phone+"' WHERE user_id = '"+req.session.passport.user+"'" , function(err, rows)
			{
				if(err){
					console.log(err)
					res.send("Update failure")
				}else
				{
					console.log(rows)
					res.send("Update successful")
				}
			})
			*/
		})
		.catch(err => console.error(err.message));
	
	/*
	//unhashed version
	connection.query("UPDATE users SET email='"+req.body.email+"', password='"+req.body.password+"', full_name='"+req.body.full_name+"', city='"+req.body.city+"', state='"+req.body.state+"', postal_code='"+req.body.postal_code+"', phone='"+req.body.phone+"' WHERE user_id = '"+req.session.passport.user+"'" , function(err, rows)
	{
		if(err){
			console.log(err)
			res.send("Update failure")
		}else
		{
			console.log(rows)
			res.send("Update successful")
		}
	})
	*/
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
		
		/*
		//local array version
		(username, password, done) => {
			console.log("beginning of local strategy")
			let user = users.find((user) => {
				return user.email === username && user.password === password
			})

			if (user) {
				return done(null, user)
			}else{
				return done(null, false, { message: 'Incorrect username or password'})
			}
		}
		*/
	)
)	

passport.serializeUser((user, done) => {
	done(null, user);
})

passport.deserializeUser((id, done) => {
	/*
	//local array version
	let user = users.find((user) => {
		return user.id === id
	})
	done(null, user)
	*/
	connection.query("SELECT * FROM users WHERE user_id = '"+id+"'", function(err, rows){
		if(err){
			console.log(err)
			return done(null, err);
		}
		done(err, rows[0]);
	})
	
})

app.get('/orderHistory', authMiddleware, (req, res) => {
	res.header('Access-Control-Allow-Origin', 'http://wpgroup3.engr.ship.edu:8082');
	res.header('Access-Control-Allow-Credentials', true);
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	
	connection.query("SELECT orders.order_id, product_in_order.product_id, products.name, products.price, product_in_order.number_in_order FROM orders, products INNER JOIN product_in_order ON products.product_id = product_in_order.product_id WHERE orders.user_id = '"+req.session.passport.user+"' AND orders.order_id = product_in_order.order_id", function(err, results) 
	{
		if (err)
		{
			console.log(err)
		}else
		{
      var products = new Array();
      
      for(var i = 0; i < results.length; i++) {
        var order = {order_id: "", items: []}
        order.order_id = results[i].order_id;
        order.items.push({ product_id: results[i].product_id,
                          name: results[i].name,
                          price: results[i].price,
                          number_in_order: results[i].number_in_order
                        });
        while(((i+1) < results.length) && (results[i].order_id == results[i + 1].order_id)) {     
         order.items.push({ product_id: results[i+1].product_id,
                          name: results[i+1].name,
                          price: results[i+1].price,
                          number_in_order: results[i+1].number_in_order
                        });
            i = i+1;
        }
        
        products.push(order);
        
      }
			res.send(products);
		}
	})
});

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

app.get('/cartData/:checkout', authMiddleware, (req, res) => {
	res.header('Access-Control-Allow-Origin', 'http://wpgroup3.engr.ship.edu:8082');
	res.header('Access-Control-Allow-Credentials', true);
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
 var orderTotal = 0.0;
 var orderContent = new Array();
  connection.query("SELECT products.product_id, products.name, products.price, cart.quantity FROM cart INNER JOIN products on cart.product_id = products.product_id WHERE cart.user_id = '"+req.session.passport.user+"'", function(err, cartContent) {
     	if (err)
  		{
  			console.log(err + "cartContent")
  		} else {
         
         for(let i = 0; i < cartContent.length; i++) {
           orderTotal = orderTotal + (cartContent[i].quantity * cartContent[i].price)
         }
          orderContent = cartContent;
         connection.query("SELECT user_id, email, street_address, city, state, postal_code FROM users WHERE user_id = '"+req.session.passport.user+"'", function(err, userData)
         {
             if (err) {
          			console.log(err + "userData")
         		 } else {
                 var shipping = userData[0].street_address + " " + userData[0].city +" "+ userData[0].state +" "+ userData[0].postal_code;
                 var date = new Date();
                 connection.query("INSERT INTO orders(user_id, order_total, shipping_address, order_email) VALUES("+userData[0].user_id+","+orderTotal+",'"+shipping+"','"+userData[0].email+"')", function(err, orderInsert)
                 {
                    if (err) {
                			console.log(err + " orderInsert")
                		} else {
                        connection.query("SELECT LAST_INSERT_ID() AS last", function(err, orderID) {
                            if(err) {
                                console.log(err + "orderID")
                            } else {
                                
                                //begin for loop
                                for(let i = 0; i < cartContent.length; i++) {
                                    //begin
                            var stmt = "INSERT INTO product_in_order(order_id, product_id, number_in_order) VALUES("+orderID[0].last+","+cartContent[i].product_id+","+cartContent[i].quantity+")";
                          connection.query(stmt, function(err, results)
                                   {
                                  	    if (err)
                                    		{
                                    			console.log(err + "inser into order")
                                    		}else
                                    		{
                                    			console.log("SUCCESS, added order info" + orderID)
                                    		}
                               	   }) //end
                                   
                                   //begin
                                   connection.query("SELECT stock FROM products WHERE product_id =" + cartContent[i].product_id, function(err, currentStock) 
                                   {
                                       if (err) 
                                       {
                                    			console.log(err + "inser into products")
                                 		   } else
                                       {
  
                                          var delta = 0;
                                          delta = cartContent[i].quantity;
                              		        var newStock = currentStock[0].stock - delta;
                                        var stmt1 = "UPDATE products SET stock = "+ newStock +" WHERE product_id =" + cartContent[i].product_id;
                                          connection.query(stmt1, function(err, results1)
                                          {
                                              if (err)
                                          		{
                                          			console.log(err + "update stock")
                                          		}else
                                          		{
                                                  console.log("SUCCESS, added order info" + orderID)
                                                  connection.query("DELETE FROM cart WHERE product_id =" + cartContent[i].product_id, function(err, results2) 
                                                  {
                                                  	if (err)
                                                		{
                                                			console.log(err + "empty cart")
                                                		}else
                                                		{
                                                			console.log("SUCCESS, deleted item from cart " + cartContent[i].product_id)
                                                		}
                                                  })
                                              }
                                          })
                                       }
                       	           }) //end
                                }//end for loop            
          
                            }
                        })

                        
                    }
                 })
             }
         })
         res.send(cartContent);
      }
  })
});

app.post('/register', (req, res) => {

	var required = req.body;
	const email = required.email;
	const password = required.password;
	const full_name = required.full_name;
	const street_address = required.street_address;
	const city = required.city;
	const state = required.state;
	const postal_code = required.postal_code;
	const phone = required.phone;
	console.log(email)
	bcrypt
		.hash(password, saltRounds)
		.then(hash => {
			console.log("Hash creation: success")

			const qString = 'INSERT INTO users (email, password, full_name, street_address, city, state, postal_code, phone, admin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, false)';
			connection.query(qString, [email, hash, full_name, street_address, city, state, postal_code, phone], function(err, results)
			{
				if (err)
				{
					console.log(err)
				}else
				{
					console.log("Account created")
					res.send(results);
				}
			})
		})
		.catch(err => console.error(err.message));
});

app.post('/adjust', authMiddleware, (req, res) => {
	var required = req.body;
	const Item_ID = required.Item_ID;
	const stock = required.stock;

	const qString = 'UPDATE products SET stock = ? WHERE product_id = ?';
	connection.query(qString, [stock, Item_ID], function(err, results)
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

app.post('/add', authMiddleware, (req, res) => {
	var required = req.body;
	const name = required.name;
	const price = required.price;
	const description = required.description;
	const quantity = required.quantity;
	const image = required.image;
	const stock2 = required.stock2

	const qString = 'INSERT INTO products (name, price, description, quantity, image, stock) VALUES (?, ?, ?, ?, ?, ?)';
	connection.query(qString, [name, price, description, quantity, image, stock2], function(err, results)
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

app.post('/remove',authMiddleware, (req, res) => {
	var required = req.body;
	const Item_ID2 = required.Item_ID2;
	
	const qString = 'DELETE FROM products WHERE product_id = ?';
	connection.query(qString, [Item_ID2], function(err, results)
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
/*
//test code to retrieve db values
app.get('/test', (req, res) => {
	res.header("Access-Control-Allow-Origin", "http://wpgroup3.engr.ship.edu:8082");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	connection.query('SELECT * FROM mask', function(err, results) 
	{
		if (err) throw err
		res.send(results);
	})
	console.log('You are now connected...')
})

app.get('/test/:id', (req, res) => {
	res.header("Access-Control-Allow-Origin", "http://wpgroup3.engr.ship.edu:8082");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	
	const id = req.params.id;
	connection.query("SELECT * FROM mask WHERE upc='"+id+"'", function(err, results) 
	{
		if (err) throw err
		res.send(results);
	})
	console.log('You are now connected...')
})
*/

app.listen(port, () => {

  console.log(`App listening at http://localhost:${port}`)
})
