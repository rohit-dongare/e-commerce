
const Product = require('../models/product.model');

function getCart(req, res){
  res.render('customer/cart/cart');
}//no need to pass any data because we are accesing that data using 'local.cart'

async function addCartItem(req, res, next){

 let product;
  try {
   product = await Product.findById(req.body.productId);//go through cart.management.js file where we have passed this productid to access it here
  } catch(error){
    next(error);
    return;
  }
   
  let cart = res.locals.cart;//go through cart.js file then come here
    cart.addItem(product);//go through the cart.js file
                             //here res.locals.cart acts as an object based on the class Cart we have created in cart.models.js file, addItem() is one of it's method
                             //and as you can see we haven't export that file still we can access it's methods because res.locals can be used globally
    req.session.cart = cart; //the cart will be added into the session collection of databas         
    
    res.status(201).json({//as we are going to handle the post request of adding products into the cart using AJAX 
        message: 'Cart Updated!',
        newTotalItems: cart.totalQuantity//this will for notification that show number of products has been added into the cart on the navigation bar of cart
    });//we have used this newTotalItem in cart.js file for showing this notification
    //also go through the model.js file to know about this totalQuantity
}


//updating the cart product
//go through cart-item and cart.ejs file and also through cart-item-management.js, cart-model.js file
function updateCartItem(req, res){
      const cart = res.locals.cart;

      //this will return an object with some data to update on webpage 
     const updatedItemData = cart.updateItem(
      req.body.productId, 
      +req.body.quantity
      );

      req.session.cart = cart;

      res.json({
         message: 'Item updated!',
         updatedCartData: {
             newTotalQuantity: cart.totalQuantity,
             newTotalPrice: cart.totalPrice,
             updatedItemPrice: updatedItemData.updatedItemPrice
         }
      });
}

module.exports = {
    addCartItem: addCartItem,
    getCart: getCart,
    updateCartItem: updateCartItem
};