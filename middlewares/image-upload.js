//this image upload middleware is used in admin.controller.js file while creating a product or updating a product as it takes image in the form submission

const multer = require('multer');
const uuid = require('uuid').v4;

const upload = multer({
    storage: multer.diskStorage({
       destination: 'product-data/images',
       filename: function(req, file, cb) {
           cb(null, uuid() + '-' + file.originalname);
       }
    })
});

//null represents that there is no error while uploading , uuid() + '-' + file.originalname will give a unique name to the image file uploaded by the user and it will be stored in product-data/images folder

const configuredMulterMiddleware = upload.single('image');
//it allows us to extract a single file by field name e.g name = 'image' is the name of the input field

module.exports = configuredMulterMiddleware;
