const bcrypt = require('bcryptjs');
const mongodb = require('mongodb');

const db = require('../data/database');

class User {
    constructor(email, password, fullname, street, postal, city) {
         this.email = email;
         this.password = password;
         this.name = fullname;
         this.address = {
            street: street,
            postalCode: postal,
            city: city
         };
    }
    

    //this method is used in orders.controller.js file where we want to store the data about the user who has ordered the product
    static findById(userId) {
      const uid = new mongodb.ObjectId(userId);

     return db.getDb().collection('users').findOne({ _id: uid }, { projection: { password: 0 } } );//this indicates that we need userData other than his/her password
    }


    //for login purpose
    getUserWithSameEmail() {
       return db.getDb().collection('users').findOne({ email: this.email });
    }//as this function has no other async operations than the given one so we don't have to write async and await as we are actully return the promise explictly



    //for signup e.g. when the user wants  to signup with same email address which already exists in database
   async existsAlready() {
     const existingUser = await this.getUserWithSameEmail();
      if (existingUser) {
         return true;
      }
      return false;
    }



   async signup() {
       const hashedPassword = await bcrypt.hash(this.password, 12);

       await db.getDb().collection('users').insertOne({
         email: this.email,
         password: hashedPassword,
         name: this.name,
         address: this.address
       });
    }


    hasMatchingPassword(hashedPassword){
       return bcrypt.compare(this.password, hashedPassword);
    }
}


module.exports = User;