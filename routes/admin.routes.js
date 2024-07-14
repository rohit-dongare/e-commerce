const express = require('express');

const adminController = require('../controllers/admin.controller');
const imageUploadMiddleware = require('../middlewares/image-upload');

const router = express.Router();

router.get('/products', adminController.getProducts);// /admin/products to know about this go through app.js file

router.get('/products/new', adminController.getNewProduct);//  /admin/products/new

router.post('/products', imageUploadMiddleware, adminController.createNewProduct);

router.get('/products/:id', adminController.getUpdateProduct);

router.post('/products/:id', imageUploadMiddleware, adminController.updateProduct);

router.delete('/products/:id', adminController.deleteProduct);//we delete the product using AJAX request instead of post request like we usually do

router.get('/orders', adminController.getOrders);

router.patch('/orders/:id', adminController.updateOrder);

module.exports = router;