<template style = "background-color:#d9d9d9;">
<div style = "background-color:#d9d9d9 !important;"><!--style = "padding-top: 3.5rem;"-->
<!--
	<nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">

      <div class="collapse navbar-collapse" id="navbarsExampleDefault">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item">
            <a class="nav-link" href="#">Link</a>
          </li>
        </ul>
		
        <form class="form-inline my-2 my-lg-0">
          <input class="form-control mr-sm-2" type="text" placeholder="Search" aria-label="Search">
          <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
        </form>
	
      </div>
    </nav>
-->

<main role="main">
	<div class="jumbotron" style="background-color:#7dcfa7 !important; text-align: left;">
	<!--#a1dec1-->
	<div class="container">
		<h1 class="display-3">School Supplies Galore</h1>
		<p>Getting ready to go back to school and need supplies? Whatever your needs, we've got you covered!</p>
		<!--<p><a class="btn btn-primary btn-lg" href="#" role="button">Learn more &raquo;</a></p>-->
	</div>
	</div>


	<div class="container">
	<div class="row justify-content-center">
		<div class="col-12 col-md-10 col-lg-8">
			<div class="card card-sm">
				<div class="card-body row no-gutters align-items-center">
				<div class="col-auto">
					<i class="fas fa-search h4 text-body"></i>
				</div>
				<div class="col">
					<input v-model = "search" class="form-control form-control-lg form-control-borderless" placeholder="Search names or descriptions">
				</div>
				<div class="col-auto">
					<button v-on:click="updateOnSearch" class="btn btn-lg btn-success">Search</button>
				</div>
				<div class="col-auto">
					<button v-on:click="goToCart" type="button" style="background-color:#7dcfa7; border-radius:20px; padding: 10;!important;" class="btn btn-lg btn-block"> Cost of {{this.amountOfItemsInCart}} items in cart: <span style="color: #007bff; font-weight: bold; !important;">${{this.cartCost}}</span></button>

				</div>
				</div>
			</div>
			<br>
		</div>
	</div>
	</div>


	<div class="card">
	<table class="table table-hover shopping-cart-wrap">
		<thead class="text-muted">
			<tr>
				<th scope="col">Product</th>
				<th scope="col" width="120">Quantity</th>
				<th scope="col" width="120">Price</th>
				<th scope="col" width="200" class="text-right">Action</th>
			</tr>
		</thead>
		<tbody v-for="item in products" :key = "item.product_id">
			<StoreItem :itemData = "item" @clicked = "addedToCart"/>
		</tbody>
	</table>
	</div>

</main>


  <!--
  https://mertjf.github.io/tailblocks/
  https://bootsnipp.com/snippets/O5mM8
  https://getbootstrap.com/docs/4.1/examples/jumbotron/#
  -->
  </div>
</template>




<script>
    import axios from 'axios';
    import StoreItem from '../components/StoreItem';
	export default {
        name: 'products',
        components: {
            StoreItem
        },
		data() {
			return {
				products: [],
				search: "Search names or descriptions",
				cartCost: 0,
				amountOfItemsInCart: 0,
				loggedInUser: "not logged in"
			}
		},
		created() {
			this.setProducts();
			this.setUser();
		},

		ready() {
			this.setUser();
		},
		
		methods: {

			async getLoggedInUser() {
				var userData = await axios.get("http://wpgroup3.engr.ship.edu:3000/user", {withCredentials: true})
				.then(
					(response) => {
						return response.data;
					}).catch(
						(errors) => {
							console.log(errors);
							return null;
						}
					);
					
				return userData;     
			},

			async setUser() {
				var user = await this.getLoggedInUser();
				if (user != null) {
					this.loggedInUser = user
					this.getInitialCartItems();//get what is in their cart

				}
			},

			goToLoginPage() {
				this.$router.push({ name: "Login"});
			},

			goToAccountPage() {
				this.$router.push({ name: "Account"});
			},

			goToCart() {
				this.$router.push({ name: "Cart"});
			},

			async addedToCart(data) {
				this.cartCost += (data[1] * data[2]); 
				this.amountOfItemsInCart += Number(data[2]);
				var s = "http://wpgroup3.engr.ship.edu:3000/HomePage/addToCart/:"; //+data[0] + "~" + data[2];
				var s2 = data[0] + "~" + data[2];

				await axios.get((s + s2),{withCredentials: true});
			},

			async getInitialCartItems() {

				var cartSizeData = await axios.get("http://wpgroup3.engr.ship.edu:3000/getCartSize", {withCredentials: true})
				.then(
					(response) => {
						return response.data[0].total;
					});
				this.amountOfItemsInCart = cartSizeData;

				var cartCostData = await axios.get("http://wpgroup3.engr.ship.edu:3000/getCartCost", {withCredentials: true})
				.then(
					(response) => {
						return response.data[0].total;
					});
				this.cartCost = cartCostData;				
			},

            async getAllProductsFromServer() {
                var res = await axios.get("http://wpgroup3.engr.ship.edu:3000/allProducts");
                return res.data;
            }, 

			async setProducts() {
				this.getAllProductsFromServer()
				.then(
					(products => {
						this.$set(this, "products", products);
					}).bind(this)
				);
			},

			async setProductsAfterSearch(criteria) {
				this.getSearchedProducts(criteria)
				.then(
					(products => {
						this.$set(this, "products", products);
					}).bind(this)
				);
			},

			async getSearchedProducts(criteria) {
				const query = "http://wpgroup3.engr.ship.edu:3000/HomePage/:" + criteria;
				var res = await axios.get(query);
                return res.data;
			},

			async updateOnSearch() {
				this.setProductsAfterSearch(this.search);				
			}
			
		}
	}
</script>