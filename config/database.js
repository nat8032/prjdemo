/* create db enties. */
const {MongoClient} = require("mongodb");
const url = "mongodb+srv://erbbwd73:7ygvbhu8@cluster0.ax0u3.mongodb.net/"; // connect string to Atlas MongoDB
const dbName = "hobbiesClass";

let db, client;

const connectDB = async () => {

    client = new MongoClient(url);
    await client.connect();
    console.log("[info] Atlas MongoDB connect...");
    db = client.db(dbName);

    return db;
};

const closeDB = async () =>{
    if (client) {
        await client.close();
        console.log("[info] Atlas MongoDB disconnect...");
    }
};

module.exports = {connectDB, closeDB};