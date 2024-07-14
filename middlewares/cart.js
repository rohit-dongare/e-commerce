//this middleware checks whether the user has a cart or doesn't have a cart yet
//and either way cart should be initalize properly
//we are using this middleware in app.js file first
//then also in cart.controller.js file

const Cart = require('../models/cart.model');

function initializeCart(req, res, next){
   let cart;

   if (!req.session.cart){// if the user visits the page for the first time
      cart = new Cart();//that means we create empty cart for the visitor coming for first time
   } else {//this means we did create the cart for that user previously
     const sessionCart = req.session.cart;
      cart = new Cart(
        sessionCart.items, 
        sessionCart.totalQuantity,
        sessionCart.totalPrice   
     );//you have to pass this totalQuantity value as a parameter otherwise when you refresh the page the count will again initialize to zero
   }

   //below locals.cart is used in nav-item.js file for showing notification badge
   res.locals.cart = cart;//so this can be new cart or it gets reinitialized based on old cart object that was stored in a session
                           //this res.locals.cart now acts as an object so we can access methods from cart.models.js file in the cart.controller.js file
                        //also used in cart.ejs file to show products that are added into the cart navigation section 
   next();
}

module.exports = initializeCart;