const Product = require('../models/product.model');

class Cart {
    //initially cart can be empty 
    //items is an array of products, totalQuantity indicates how many products are there in that array and what's the totalPrice of those products
    //here items array is empty by default if we don't pass anything to the items
    //here the item is an array of objects i.e array of products(object)
    //totalQuantity is 0 initially , when we add products into the cart then count will increase on the website that will show count of products added into the cart like a notification on the cart navigation bar
    constructor(items = [], totalQuantity = 0, totalPrice = 0){
       this.items = items;
       this.totalQuantity = totalQuantity;
       this.totalPrice = totalPrice;

    }


    //this is for the cart items e.g if the user add products into the cart item with respetcted amout
    //but at the same time admin changes the price of that product then that means you are buying that product at wrong price that could be lower or higher than the previous price
    //so this will help with that i.e once the admin updates the price of the product or even delete that products then similar changes will be added to the cart item products of the user side
    async updatePrices() {
        //it will return an array of id's of product
        const productIds = this.items.map(function (item) {
          return item.product.id;
        });
    
        //this is the static method you will find in Product module.js file
        //here productIds is an array of id's
        //in return we get list of products
        const products = await Product.findMultiple(productIds);
    
        //if the product doesn't exist anymore then that product id will be added into this array
        //which will be eventually helpful while deleting that product from the cart list of the user
        const deletableCartItemProductIds = [];
    
        //here find() method is built-in method ,here we are finding updated product data for the cart item daata which i am currently looking in
        //it will return true or false
        for (const cartItem of this.items) {

          const product = products.find(function (prod) {
            return prod.id === cartItem.product.id;
          });
    
          //this means i was not able to find the product in the cart that means it was probably deleted from the cart by admin
          //so it should also be deleted from the cart list of the user where he/she added that product before deleting that product by the admin
          if (!product) {
            // product was deleted!
            // "schedule" for removal from cart
            deletableCartItemProductIds.push(cartItem.product.id);
            continue;
          }
    
          //this means product wasn't deleted instead it's price has been updated by the admin
          //so it should be updated on the cart list of the user who has added that product with old price
          // product was not deleted
          // set product data and total price to latest price from database
          cartItem.product = product;
          cartItem.totalPrice = cartItem.quantity * cartItem.product.price;
       }
    
       //here we will actually delete items from the cart for which the products were deleted from database
       //set the new array of items newly
        if (deletableCartItemProductIds.length > 0) {
          this.items = this.items.filter(function (item) {
            return deletableCartItemProductIds.indexOf(item.product.id) < 0;
          });
        }
    
        // re-calculate cart totals
        this.totalQuantity = 0;
        this.totalPrice = 0;
    
        for (const item of this.items) {
          this.totalQuantity = this.totalQuantity + item.quantity;
          this.totalPrice = this.totalPrice + item.totalPrice;
        }
      }
   

    //add new product to the cart
    //we don't store the cart into the database but into the session
    //visitors can add items/products into the cart without even logged in
    //single product can't be added multiple times into the cart instead we will store it's quantity i.e 
    //how many times that product has been added into the cart
    //so we below make sure if the product is already the part of item array then we just add it's quantity and not the actual product again and again
    addItem(product){
  
        //initally we consider that this is the first time when the given product is added into the items array
        //and hence quantity is 1, totalprice is product's price
        //but if it is not the first time when this product is been added into item's array
        //then we won't add this product instead we change some properties of that product in the for loop below
        //e.g quantity and totalprice
        const cartItem = {
            product: product,
            quantity: 1,
            totalPrice: product.price
        };

       for (let i=0; i < this.items.length; i++){
          const item = this.items[i];

          if (item.product.id === product.id){//this means the product is already the part of the cart
              cartItem.quantity = +item.quantity + 1;//force conversion to numbers using plus sign
              cartItem.totalPrice = item.totalPrice + product.price;
              this.items[i] = cartItem;//this means we replace that product with the updated product

              this.totalQuantity++;
              this.totalPrice = this.totalPrice + product.price;

              return;
          }
       }

        this.items.push(cartItem);//the product which is not the part(new product) of the items array will be added to it 
        this.totalQuantity++;
        this.totalPrice = this.totalPrice + product.price;
    }

    
    //updating the cart product
    //go through cart-item and cart.ejs file and also through cart-item-management.js file and cart-controller.js file
    updateItem(productId, newQuantity){

        for (let i=0; i < this.items.length; i++){
            const item = this.items[i];
  
            if (item.product.id === productId && newQuantity > 0){//this means the product is already the part of the cart
        
                const cartItem = { ...item };//copy item into cartItem
                const quantityChange = newQuantity - item.quantity;//it can be either negative or positive depends on newQunatity
                cartItem.quantity = newQuantity;
                cartItem.totalPrice = newQuantity * item.product.price;
                this.items[i] = cartItem;//this means we replace that product with the updated product
  
                this.totalQuantity = this.totalQuantity + quantityChange;
                this.totalPrice = this.totalPrice + quantityChange * item.product.price;
  
                return { updatedItemPrice: cartItem.totalPrice };//this will be used when the response is send back in json format in cart.controller.js file
            }

            else if (item.product.id === productId && newQuantity <= 0){
                this.items.splice(i, 1);//it will delete that array element i.e product from the item array
                this.totalQuantity = this.totalQuantity - item.quantity;
                this.totalPrice = this.totalPrice - item.totalPrice;
                return { updatedItemPrice: 0 };
            }//if the quantity is zero or less than that , then that means we will remove that product from the cart
         } 

    }


}


module.exports = Cart;