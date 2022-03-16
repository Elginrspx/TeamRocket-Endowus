const { MongoClient, ObjectID } = require("mongodb");
const Express = require("express");
const Cors = require("cors");
const BodyParser = require("body-parser");
const { request } = require("express");

const client = new MongoClient(process.env["mongodb+srv://fyp1:RacH3nBu9ER2NW2o@clusterfyp.dwacg.mongodb.net/test"]);
const server = Express();

server.use(BodyParser.json());
server.use(BodyParser.urlencoded({ extended: true }));
server.use(Cors());

var collection;

// server.post("/create", async (request, response) => {});
server.get("/get", async (request, response) => {});

server.listen("3000", async () => {
    try {
        await client.connect();
        collection = client.db("Game1").collection("user");
        //collection.createIndex({ "location": "2dsphere" });
    } catch (e) {
        console.error(e);
    }
});


server.get("/get", async (request, response) => {
    try {
        let result = await collection.find({}).sort({ score: -1 }).limit(3).toArray();
        response.send(result);
    } catch (e) {
        response.status(500).send({ message: e.message });
    }
});