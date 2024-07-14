const db = require('../data/database');
const mongodb = require('mongodb');

class Product {
    constructor(productData) {
        this.title = productData.title;
        this.summary = productData.summary;
        this.price = +productData.price;//plus sign indicates that the price will be in number format rather than string
        this.description = productData.description; 
        this.image = productData.image;//the name of the image file
       
        this.updateImageData();

        if (productData._id){
            this.id = productData._id.toString();//this means if the product has some id i.e if the product is already exist
        }//this id will help us while viewing or deleting or updating the product information uniquely by the admin 
    }



    //below method is called in cart.model.js file 
    //here ids is an array of id's
    static async findMultiple(ids) {
        const productIds = ids.map(function(id) {
          return new mongodb.ObjectId(id);
        })
        
        //here we are finding all the products where the product id is one of the id's specified in the given array 
        const products = await db
          .getDb()
          .collection('products')
          .find({ _id: { $in: productIds } })
          .toArray();
    

          //at the end we convert product array into product object document
        return products.map(function (productDocument) {
          return new Product(productDocument);
        });
      }


    //to find the individual product for viewwing and updating purpose and also for deleting 
    static async findById(productId){
        let prodId;
        try{
            prodId = new mongodb.ObjectId(productId);
        } catch(error){
            error.code = 404;//this will while creating a custome middleware 
            throw error;
        }//creating a such a objectId might fell so put it in try catch block
        
       const product = await db.getDb().collection('products').findOne({ _id: prodId });
       
       if (!product){//this is when the requested product via the productid by user doesn't exist
          const error = new Error('Could not find product with provided id.');
          error.code = 404;//default http could not find status code
          throw error; 
       }

       return new Product(product);//we return  an instance because because in the database we haven't stored the imagepath or imageUrl in the database but have to show it on the webpage in html code
    }

    //to get the products created by admin previously if they exist
   static async findAll() {
     const products = await db.getDb().collection('products').find().toArray();

     return products.map(function(productDocument){//we are using map functionality because we have got the data from database in array format
            return new Product(productDocument);//we return the data in object format ie. in key-value pair because we didn't store imagepath  and imageurl in database and to fetch that info we  have
                                               //create such instance using new operator
     });
    }


    //replace the images i.e updated and old one
    async replaceImage(newImage){
        this.image = newImage;
        this.updateImageData();
    }


    //updating the image information on the webpage ie. imageUrl and also on the local machine
    updateImageData() {
        this.imagePath = `product-data/images/${this.image}`;//path indicates where we have stored the images on our local machine
        this.imageUrl = `/products/assets/images/${this.image}`;//this will serve the images on the browser side code on html
                                          //here /products/assets is just a path not the actual folder names go througth app.js file for that purpose 
                                          //but here 'images' is a folder which is inside product-data folder , we don't show the actual path where we have stored the image instead we show wrong path and still image can be seen by the user
    }

    //saving the product data it can be when creating a new product or updating a existing product
   async save(){
        const productData = {
            title: this.title,
            summary: this.summary,
            price: this.price,
            description: this.description,
            image: this.image//the name of the image file which is combination of uuid and actual name of the image file
            //we don't store the image url or it's path into the database for flexibility we just store it's name
        };

        //if the id already exist that means we are saving updated product by admin
      if (this.id) {
         const productId = new mongodb.ObjectId(this.id);
 
         if(!this.image){
            delete productData.image;
         }//this ensures that if the admin doesn't update the image during the product updation form then that means this.image will be undefined and the image which was uploaded when the product has beeen created 
         //will not be override by this undefined keyword
         //so updating object we have passed below i.e. productData will not have image field key then mongodb won't even try to update the existing image field 

         await db.getDb().collection('products').updateOne(
            { _id: productId }, 
            { $set: productData }
            );
      }
       else {//creating a new product and then saving it
        await db.getDb().collection('products').insertOne(productData);
      }
 
    }

   
    //deleting the product as you can see we didn't pass the id(as a parameter) of the product which is to be deleted 
    //because this deletion is handled by AJAX request
   async remove() {
       const productId = new mongodb.ObjectId(this.id);
       await db.getDb().collection('products').deleteOne({ _id: productId });
    }//you can also use async await that will also return the promise 
    //we are no deleting the image from our local machine
}

module.exports = Product;