<template>


<tr>
   <td scope="col">
      <figure class="media">
         <div class="img-wrap"><img :src = "itemData.image" class="img-thumbnail" length="150" width="150"></div>
         <figcaption class="media-body">
            <h5 class="title text-truncate">{{itemData.name}} </h5>
            <dl class="param param-inline small">
               <dt>Description: </dt>
               <dd>{{itemData.description}}</dd>
            </dl>
         </figcaption>
      </figure>
   </td>
   <td scope="col" width="20">
   <div>
      <input type="number" value="1" min="1" :max="itemData.stock" @change="onChange($event)">
    </div>

   </td>
   <td scope="col" width="120">
      <div class="price-wrap"> 
         <var class="price">${{itemData.price * this.selectedQuantity}}</var> 
         <small class="text-muted">${{itemData.price}} each</small> 
      </div>
   </td>
   <td scope="col" width="120" class="text-right"> 
      <button title="" href="" class="btn btn-outline-success" data-toggle="tooltip" v-on:click="addToCart">Add To Cart
      </button> 
   </td>
</tr>


</template>




<script>
  
import axios from 'axios';
export default {
  props: ["itemData"],
  data() {
    return {
      selectedQuantity: 1
    }
  },
  methods: {
    onChange() {
      this.selectedQuantity = event.target.value;
    },

    async getUser() {
      var userData = await axios.get("http://wpgroup3.engr.ship.edu:3000/user", {withCredentials: true})
        .then((response) => {
          return response.data;
        })
        .catch((errors) => {
          console.log(errors);
          return null;
        });

      return userData;     
    },

    async addToCart() {
      var userResponse = await this.getUser();

      
      if (userResponse === null) {
        alert("Please log in to add to cart.");
      } else {
        // var user = userResponse;
        // var userID = user.user_id;

        var values = [this.$props.itemData.product_id, this.$props.itemData.price, this.selectedQuantity];
        this.$emit('clicked', values);
      } 

    }


  }
  
};

</script>











<style> 
.param {
    margin-bottom: 7px;
    line-height: 1.4;
}
.param-inline dt {
    display: inline-block;
}
.param dt {
    margin: 0;
    margin-right: 7px;
    font-weight: 600;
}
.param-inline dd {
    vertical-align: baseline;
    display: inline-block;
}

.param dd {
    margin: 0;
    vertical-align: baseline;
} 

.shopping-cart-wrap .price {
    color: #007bff;
    font-size: 18px;
    font-weight: bold;
    margin-right: 5px;
    display: block;
}
var {
    font-style: normal;
}

.media img {
    margin-right: 1rem;
}
.img-sm {
    width: 90px;
    max-height: 75px;
    object-fit: cover;
}
  </style>