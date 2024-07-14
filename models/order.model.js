const db = require('../data/database');

const mongodb = require('mongodb');

class Order {
    //status => pending, fulfilled ,cancelled
    //this cart contains product data including total amount and total quantity
    //userdata can contain name, email, id, address for shipping purpose as a shop owner
    //initially there won't be any orderId ,but if we want to update the order i.e the order is already exist in database and has orderId
    //initially there won't be any date , but if it is then we will format this data in below manner
     constructor (cart, userData, status = 'pending', date, orderId){
            this.productData = cart;
            this.userData = userData;
            this.status = status;
            this.date = new Date(date);
            if (this.date) {
                this.date = this.date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                })
            }
            this.id = orderId;
     }


     static transformOrderDocument(orderDoc) {
        return new Order(
          orderDoc.productData,
          orderDoc.userData,
          orderDoc.status,
          orderDoc.date,
          orderDoc._id
        );
      }


      static transformOrderDocuments(orderDocs) {
        return orderDocs.map(this.transformOrderDocument);
      }
    

      static async findAll() {
        const orders = await db
          .getDb()
          .collection('orders')
          .find()
          .sort({ _id: -1 })
          .toArray();
    
        return this.transformOrderDocuments(orders);
      }


      static async findAllForUser(userId) {
        const uid = new mongodb.ObjectId(userId);
    
        const orders = await db
          .getDb()
          .collection('orders')
          .find({ 'userData._id': uid })
          .sort({ _id: -1 })
          .toArray();
    
        return this.transformOrderDocuments(orders);
      }


      static async findById(orderId) {
        const order = await db
          .getDb()
          .collection('orders')
          .findOne({ _id: new mongodb.ObjectId(orderId) });
    
        return this.transformOrderDocument(order);
      }


     //saving orders in database
     //here we will differentiate between updating the exisiting order or we are storing a new order
     save() {
        //updating the order
        if (this.id){
            const orderId = new mongodb.ObjectId(this.id);
            return db
              .getDb()
              .collection('orders')
              .updateOne({ _id: orderId }, { $set: { status: this.status } });
              
        } else {//it means we don't have orderId i.e we are creating a new order which will then have a orderId once we store it in database
            const orderDocument = {
                userData: this.userData,
                productData: this.productData,
                date: new Date(),
                status: this.status
            };

           return db.getDb().collection('orders').insertOne(orderDocument);
        }//when we create a new order then date will be current date using new Date(), but it is different if we are updating the order
     }
}

module.exports = Order;