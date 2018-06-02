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
        ]
    },
    "snapshot": {
        "id": "snapshot",
        "snapshot": {}
    }
};

module.exports = config;