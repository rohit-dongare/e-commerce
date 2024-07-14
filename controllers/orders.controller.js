
const stripe = require('stripe')('sk_test_51P69pRSEGGdpdixWa78KIgNdQvSx6ZFOAnliWjXQyWPrkKWFd7tLCPGoqjIMF7PwuPAzP9WQQExcXnaEV1OrHUrZ00AgOKhE0a');

const Order = require('../models/order.model');
const User = require('../models/user.model');

async function getOrders (req, res){
  try {
    const orders = await Order.findAllForUser(res.locals.uid);//go through check-auth middleware
    res.render('customer/orders/all-orders', {
      orders: orders,
    });
  } catch (error) {
    next(error);
  }
}

//go through the sessions database , user.model.js file, and also session cart middleware
async function addOrder(req, res, next){
      const cart = res.locals.cart;// this returns an object that contains different products data and also total quantity i.e no of products
   
      let userDocument;
      try {
        userDocument = await User.findById(res.locals.uid);//res.locals.uid is possible due to sessions , sessions created when somone log in and that time we have stored the id of the user into sessions and also in 'local' variable
      } catch (error) {
        next(error);
        return;
      }
      
      
      const order = new Order(cart, userDocument);

    try {
        await order.save();
    } catch(error){
       next(error);
       return;
    }

    req.session.cart = null;//once we place the order i.e buy products then we will clear the cart i.e that means also the cart data inside it so there will be no  products inside the cart in database and also on the webpage cart-navigation
                       //this ensures that for everyone when they buy the products their cart will be empty and if they want to add products into their cart they can do it 


    //adding payment using stripe which is third party package                   
   const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: cart.items.map(function(item) {
       return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.product.title
          },
          unit_amount: +item.product.price.toFixed(2) * 100
        },
        quantity: item.quantity,
      } 
    }),
    mode: 'payment',
    success_url: `http://localhost:3000/orders/success`,
    cancel_url: `http://localhost:3000/orders/failure`,
  });


  res.redirect(303, session.url);
   
}


//success of money transaction
function getSuccess(req, res){
    res.render('customer/orders/success');
}


//failure of money transaction
function getFailure(req, res){
  res.render('customer/orders/failure');
}


module.exports = {
    addOrder: addOrder,
    getOrders: getOrders,
    getSuccess: getSuccess,
    getFailure: getFailure
}