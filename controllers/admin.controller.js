const Product = require('../models/product.model');
const Order = require('../models/order.model');

async function getProducts(req, res, next) {
    try {
        //to find all the existing products created by admin 
       const products = await Product.findAll();//findAll() is a static method we have created so that's why we don't have to create an object for this
       res.render('admin/products/all-products', { products:products });
    } catch (error) {
        next(error);
        return;
    }
    
}


function getNewProduct(req, res) {
   res.render('admin/products/new-product');
}


async function createNewProduct(req, res, next) {
    // console.log(req.body);
    // console.log(req.file);
    const product = new Product({
        ...req.body,
        image: req.file.filename
    });

    try{
        await product.save();
    } catch(error){
       next(error);
       return;
    }

    res.redirect('/admin/products');//while redirecting we use /xyz and when we render we write xyz (path)
}


//for viewwing or updating the individual product and also the image file if it also get's updated
async function getUpdateProduct(req, res, next){
    try{
        const product = await Product.findById(req.params.id);
        res.render('admin/products/update-product', { product: product });
    } catch(error) {
        next(error);
        return;
    }
   
}



//updating the product and also the image file if it also get's updated
async function updateProduct(req, res, next){
   const product = new Product({
     ...req.body,
     _id: req.params.id
   });//here we don't send the image file even if it is being replaced we check it below

   //below we check if with all other content if admin has also updated a new image in the form
   if (req.file){
     //replace the old image with new one 
    await product.replaceImage(req.file.filename);
   }

   try {
    await product.save()
   } catch(error){
     next(error);
     return;
   }
  
   res.redirect('/admin/products');
}


async function deleteProduct(req, res, next){
   
   let product;
    try {
         product = await Product.findById(req.params.id);
         await product.remove();
    } catch(error) {
        next(error);
        return;
    }
    
   // res.redirect('/admin/products'); //this will reload the page which we don't want because here we delete the product using AJAX code instead of somekind of post request
   res.json({ message:'Deleted Product!' });//because we are deleting the element using AJAX request we send the request in json format 
   //this response has been send once you click on the delete button and the product gets deleted
}


async function getOrders(req, res, next) {
    try {
       const orders = await Order.findAll();
       res.render('admin/orders/admin-orders', {
          orders: orders
       });
    } catch(error) {
        next(error);
    }
}


async function updateOrder(req, res, next){
    const orderId = req.params.id;
    const newStatus = req.body.newStatus;

    try {
        const order = await Order.findById(orderId);

        order.status = newStatus;

        await order.save();

        res.json({
            message: 'Order updated',
            newStatus: newStatus
        });
    } catch (error) {
        next(error);
    }
}


module.exports = {
    getProducts: getProducts,
    getNewProduct: getNewProduct,
    createNewProduct: createNewProduct,
    getUpdateProduct: getUpdateProduct,
    updateProduct: updateProduct,
    deleteProduct: deleteProduct,
    getOrders: getOrders,
    updateOrder: updateOrder
};