var _a = require("mongodb"), MongoClient = _a.MongoClient, ServerApiVersion = _a.ServerApiVersion;
var uri = "mongodb://127.0.0.1:27017";
var client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
var place = client.db("place");
var pixels = place.collection();
//# sourceMappingURL=api.js.map