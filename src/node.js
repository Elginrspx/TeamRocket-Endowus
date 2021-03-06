const { MongoClient, ObjectID } = require("mongodb");
const Express = require("express");
const Cors = require("cors");
const BodyParser = require("body-parser");
const { request } = require("express");

const PORT = process.env.PORT || 8080;

const client = new MongoClient("mongodb+srv://fyp1:RacH3nBu9ER2NW2o@clusterfyp.dwacg.mongodb.net/test");
const server = Express();

server.use(BodyParser.json());
server.use(BodyParser.urlencoded({ extended: true }));
server.use(Cors());

var collection = client.db("Game1").collection("user");

//GET fucntions: Getting Persona from User DB
server.get("/get", async (request, response) => {
    try {
        let result = await collection.find({}).toArray();
        response.send("Status OK");
    } catch (e) {
        response.status(500).send({ message: e.message });
    }
});

//Listen Function
server.listen(PORT, async () => {
    try {
        await client.connect();
        collection = client.db("Game1").collection("user");
        console.log("Server Started at", process.env.PORT || 3000);
    } catch (e) {
        console.error(e);
    }
});

