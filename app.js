const path = require('path');

const express = require('express');
const csrf = require('csurf');
const expressSession = require('express-session');

const createSessionConfig = require('./config/session');//session configuration
const db = require('./data/database');
const addCsrfTokenMiddleware = require('./middlewares/csrf-token');
const errorHandlingMiddleware = require('./middlewares/error-handler');
const checkAuthStatusMiddleware = require('./middlewares/check-auth');
const protectRoutesMiddleware = require('./middlewares/protect-routes');
const cartMiddleware = require('./middlewares/cart');
const updateCartPricesMiddleware = require('./middlewares/update-cart-prices');
const notFoundMiddleware = require('./middlewares/not-found');

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/products.routes');
const baseRoutes = require('./routes/base.routes');
const adminRoutes = require('./routes/admin.routes');
const cartRoutes =require('./routes/cart.routes');
const ordersRoutes =require('./routes/orders.routes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));//__dirname is the path of this project folder and the second parameter is 'views' folder for which we want to create a absolute path

app.use(express.static('public'));
app.use('/products/assets', express.static('product-data'));//go through product-model.js file and also it's comments i have given
app.use(express.urlencoded({ extended: false }));//this works for post request 
app.use(express.json());//this works for ajax request for e.g go through cart.js file where we have send the post request with json body ie. json data

const sessionConfig = createSessionConfig();//session configuration

app.use(expressSession(sessionConfig));//we create sessions before csrf tokens as the tokens needs these sessions to log in
app.use(csrf());//using csurf package as a middleware so we can use it everywhere
                //this makes sures that the request which are not get request needs to carry csrf tokens and those request who are not get request and have no csrf tokens attached are denied
app.use(cartMiddleware);
app.use(updateCartPricesMiddleware);

app.use(addCsrfTokenMiddleware);//first we install csrf package then use it as a middleware then use it in the csrf-token.js file to create a global variable of token that can be used in every file globally
                                 //and then import that file and use it as a middleware here
//that means we have two middlewares that deal with csrf tokens: the third party middlewaer ('csurf') helps us generate token and checks incoming tokens for validity - 
//and the our own middleware which we imported from middlewares folder is just distributes generated tokens all our other middleware/ route handler functions and views                                 
app.use(checkAuthStatusMiddleware);//authentication and authorization status

app.use(baseRoutes);
app.use(authRoutes);
app.use(productRoutes);
app.use('/cart', cartRoutes);//we add this route before protectRoutesMiddleware because anyone can add products in their cart even if they didn't logged in
//above baseRoutes, authRoutes, productRoutes  are accessible by anyone even he/she is not logged in

//but below , the route that starts with /admin e.g if someone puts path on the search engine on browser as /admin/products or /admin/products/new-product then the page that having this url  will be only accessible when he/she is authourized e.g if he/she is admin
//so in order to achieve that we use middleware i.e protect-routes.js file 
//so first user has to go through this middleware and if he succeed then can use routes that starts with /admin
app.use('/orders', protectRoutesMiddleware, ordersRoutes);//we have added this route after protectRoutesMiddleware that means these routes will only be accessed if user has an account i.e after log in
app.use('/admin', protectRoutesMiddleware, adminRoutes);//so routes starting with /admin will make it to adminRoutes configuration
                             //go through admin.routes.js  file

app.use(notFoundMiddleware);//if the request the user is requesting for doesn't start with /orders or /admin then this middleware will be active

app.use(errorHandlingMiddleware);//this has written at the bottom 

db.connectToDatabase()
.then(function (){
    app.listen(3000);
})
.catch(function (error){
  console.log('Failed to connect to the database!');
  console.log(error);
});

