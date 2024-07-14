const mongodb = require('mongodb');

const mongoClient = mongodb.MongoClient;

let database;

async function connectToDatabase() {
    const mongoConnectionString = process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017';

    // Remove the deprecated options
    const client = await mongoClient.connect(mongoConnectionString);
    database = client.db('online-shop');
}

function getDb() {
    if (!database) {
        throw new Error('You must connect the database first!');
    }

    return database;
}

module.exports = {
    connectToDatabase: connectToDatabase,
    getDb: getDb,
};
