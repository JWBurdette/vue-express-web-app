<template>
	<div id="app">
			<div id="nav">
				<router-link to="/">
					<img border="0" align=left src="https://www.clipartsfree.net/vector/medium/68844-blue-pencil-images.png" width="100" height="100">
				</router-link>
				
				<div id="account" align=right v-if="!['Login', 'Register'].includes($route.name)">
					<div class="dropdown">
						<button class="dropbtn">Account</button>
						<div class="dropdown-content">
							
							<a v-if="userData.user_id == ''" href="http://wpgroup3.engr.ship.edu:8082/login">Login</a>
							
							<div id="user-options" v-if="userData.user_id != ''">
								<a href="http://wpgroup3.engr.ship.edu:8082/update">View/Edit Account</a>
								<a href="http://wpgroup3.engr.ship.edu:8082/PurchaseHistory">Order History</a>
								<a href="#" v-on:click="logout">Logout</a>
							</div>
							
						</div>
					</div>
					<router-link to="/Cart"> 
					<img border="0" align=right src="https://icons.iconarchive.com/icons/iconsmind/outline/256/Shopping-Cart-icon.png" width="50" height="50">
					</router-link>
				</div>
				
				<div id="error" v-if="!['Login', 'Register', 'Update', 'HomePage', 'PurchaseHistory', 'Cart', 'Manager'].includes($route.name)">
					<h1>Error: 404</h1>
					<h2>Page not found</h2>
					<a href="http://wpgroup3.engr.ship.edu:8082/">Return to Homepage</a>
				</div>
			
				<!--
				
				<router-link to="/Account">Account</router-link>
				<router-link to="/PurchaseHistory">Purchase History</router-link>
				<router-link to="/about">About</router-link> |
				<router-link to="/HomePage">HomePage</router-link> |
				<router-link to="/Manager">Manager</router-link> |
				
				-->
				
			</div>
		<router-view/>
	</div>
</template>

<script>
	import axios from 'axios'
	import router from './router'
	//import $ from 'jquery'
	//import Vue from 'vue'
	
	export default {
		name: 'App',
		data() {
			return {
				userData: {
					user_id: ""
				}
			}
		},
		methods: 
		{
			logout: (e) => 
			{
				e.preventDefault()
				
				axios.get("http://wpgroup3.engr.ship.edu:3000/logout", {withCredentials : true})
					.then(() => 
					{
						router.push("/HomePage")
						location.reload()
					})
			},
			
			async getUserData() 
			{
				var res = await axios.get("http://wpgroup3.engr.ship.edu:3000/user", {withCredentials: true});
				//console.log(res.data);
				return res.data;
			},
			
			async setUserData() 
			{
				this.getUserData()
				.then(
					(userData => {
						this.$set(this, "userData", userData);
						//console.log(userData.user_id);
					}).bind(this)
				)
				.catch(
					(errors) => {
						console.log(errors)
					})
			},
			/*
			updateDiv()
			{
				//console.log("hi")
				console.log(this.$data)
				this.$forceUpdate()
				
			}
			*/
		},
		created() {
			this.setUserData()
		}
	}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

#error {
	box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0);
	max-width: 300px;
	padding:10px 10px;
	margin: auto;
	text-align: left;
}

.dropbtn {
  background-color: #28a745;
  border-radius: .3rem;
  color: white;
  padding: 16px;
  font-size: 16px;
  border: none;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: #f1f1f1;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}

.dropdown-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

.dropdown-content a:hover {background-color: #ddd;}

.dropdown:hover .dropdown-content {display: block;}

.dropdown:hover .dropbtn {background-color: #218838;}

</style>
