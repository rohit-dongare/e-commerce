const express = require('express');

const cartController = require('../controllers/cart.controller');

const router = express.Router();

router.get('/', cartController.getCart);// this will be /cart/ as we have omitted this /cart in app.js file

router.post('/items', cartController.addCartItem);// it is actually /cart/items we have omitted this /cart in app.js file

router.patch('/items', cartController.updateCartItem);//we are using patch request as we are updating parts of data i.e parts of item

module.exports = router;