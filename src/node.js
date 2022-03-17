const { MongoClient, ObjectID } = require("mongodb");
const Express = require("express");
const Cors = require("cors");
const BodyParser = require("body-parser");
const { request } = require("express");

const client = new MongoClient("mongodb+srv://fyp1:RacH3nBu9ER2NW2o@clusterfyp.dwacg.mongodb.net/test");
const server = Express();

server.use(BodyParser.json());
server.use(BodyParser.urlencoded({ extended: true }));
server.use(Cors());

var collection;

//Getting Persona from User DB
server.get("/get", async (request, response) => {
    try {
        let result = await collection.find({email: "jessie.ng.2019@smu.edu.sg"});
        response.send(result);
    } catch (e) {
        response.status(500).send({ message: e.message });
    }
});

server.listen("3000", async () => {
    try {
        await client.connect();
        collection = client.db("Game1").collection("user");
        //collection.createIndex({ "location": "2dsphere" });
        //console.log(collection)
        await  listDatabases(client);
    } catch (e) {
        console.error(e);
    }
});

// async function listDatabases(client){
//     databasesList = await client.db().admin().listDatabases();
 
//     console.log("Databases:");
//     databasesList.databases.forEach(db => console.log(` - ${db.name}`));
// };