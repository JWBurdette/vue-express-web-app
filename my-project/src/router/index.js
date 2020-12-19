import Vue from 'vue'
import VueRouter from 'vue-router'
//import Home from '../views/Home.vue'
import HomePage from '../views/HomePage.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
//import Account from '../views/Account.vue'
import Update from '../views/Update.vue'
import PurchaseHistory from '../views/PurchaseHistory.vue'
import Cart from '../views/Cart.vue'
import Manager from '../views/Manager.vue'

Vue.use(VueRouter)

const routes = [
  /*
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
	// change '// below to mult-line comment
    component: () => import(// webpackChunkName: "about" // '../views/About.vue')
  },
  {
	path: '/account',
	name: 'Account',
	component: Account
  },
  */
  {
	path: '/login',
	name: 'Login',
	component: Login
  },
  {
	path: '/register',
	name: 'Register',
	component: Register
  },
  {
	path: '/update',
	name: 'Update',
	component: Update
  },
  {
	path: '/HomePage',
	name: 'HomePage',
	component: HomePage,
	alias: '/'
  },
  {
  path: '/PurchaseHistory',
	name: 'PurchaseHistory',
	component: PurchaseHistory
  },
  {
  path: '/Cart',
	name: 'Cart',
	component: Cart
  },
  {
  path: '/Manager',
	name: 'Manager',
	component: Manager
 }
  /*
  {
	path: '/test',
	name: 'Test',
	component: () => import ('../views/Test.vue')
  },
  {
	path: '/test/:upc',
	name: 'Test2',
	component: () => import ('../views/Test2.vue')
  },
  */
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
