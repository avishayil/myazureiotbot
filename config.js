var config = {}

config.endpoint = process.env.DocumentDB_Endpoint;
config.primaryKey = process.env.DocumentDB_PrimaryKey;

config.database = {
    "id": "myiotdb"
};

config.collection = {
    "id": "myiotcollection"
};

config.documents = {
    "items": {
        "id": "items",
        "items": [
            "apple",
            "peach",
            "watermelon",
            "milk"
        ],
        "_rid": "2iQqALu8GQABAAAAAAAAAA==",
        "_self": "dbs/2iQqAA==/colls/2iQqALu8GQA=/docs/2iQqALu8GQABAAAAAAAAAA==/",
        "_etag": "\"e5000dff-0000-0000-0000-5afe9bc60000\"",
        "_attachments": "attachments/",
        "_ts": 1526635462
    }
};

module.exports = config;