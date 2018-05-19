var documentClient = require("documentdb").DocumentClient;
var config = require("./config");
var url = require('url');

var client = new documentClient(config.endpoint, { "masterKey": config.primaryKey });

var HttpStatusCodes = { NOTFOUND: 404 };
var databaseUrl = `dbs/${config.database.id}`;
var collectionUrl = `${databaseUrl}/colls/${config.collection.id}`;

/**
 * Get the database by ID, or create if it doesn't exist.
 * @param {string} database - The database to get or create
 */

exports.getDatabase = function () {
    console.log(`Getting database:\n${config.database.id}\n`);

    return new Promise((resolve, reject) => {
        client.readDatabase(databaseUrl, (err, result) => {
            if (err) {
                if (err.code == HttpStatusCodes.NOTFOUND) {
                    client.createDatabase(config.database, (err, created) => {
                        if (err) reject(err)
                        else resolve(created);
                    });
                } else {
                    reject(err);
                }
            } else {
                resolve(result);
            }
        });
    });
}

/**
 * Get the collection by ID, or create if it doesn't exist.
 */
exports.getCollection = function () {
    console.log(`Getting collection:\n${config.collection.id}\n`);

    return new Promise((resolve, reject) => {
        client.readCollection(collectionUrl, (err, result) => {
            if (err) {
                if (err.code == HttpStatusCodes.NOTFOUND) {
                    client.createCollection(databaseUrl, config.collection, { offerThroughput: 400 }, (err, created) => {
                        if (err) reject(err)
                        else resolve(created);
                    });
                } else {
                    reject(err);
                }
            } else {
                resolve(result);
            }
        });
    });
}

/**
 * Get the document by ID, or create if it doesn't exist.
 * @param {function} callback - The callback function on completion
 */
exports.getItemsDocument = function () {
    let document = config.documents['items'];
    let documentUrl = `${collectionUrl}/docs/${document.id}`;
    console.log(`Getting document:\n${document.id}\n`);

    return new Promise((resolve, reject) => {
        client.readDocument(documentUrl, (err, result) => {
            if (err) {
                if (err.code == HttpStatusCodes.NOTFOUND) {
                    client.createDocument(collectionUrl, document, (err, created) => {
                        if (err) reject(err)
                        else resolve(created);
                    });
                } else {
                    reject(err);
                }
            } else {
                resolve(result);
            }
        });
    });
};

/**
 * Query the collection using SQL
 */
exports.queryCollection = function () {
    console.log(`Querying collection through index:\n${config.collection.id}`);

    return new Promise((resolve, reject) => {
        client.queryDocuments(
            collectionUrl,
            'SELECT * FROM c'
        ).toArray((err, results) => {
            if (err) reject(err)
            else {
                for (var queryResult of results) {
                    let resultString = JSON.stringify(queryResult);
                    console.log(`\tQuery returned ${resultString}`);
                }
                resolve(results);
            }
        });
    });
};

/**
 * Add an item to the list
 */
exports.addItem = function (item) {
    let document;
    return exports.queryCollection()
        .then((results) => {
            document = results[0];
            let documentUrl = `${collectionUrl}/docs/${document.id}`;
            console.log(`Adding item to document:\n${document.id}\n`);

            if (document.items.indexOf(item) === -1) {
                document.items.push(item);
                return new Promise((resolve, reject) => {
                    client.replaceDocument(documentUrl, document, (err, result) => {
                        if (err) reject(err);
                        else {
                            resolve(result);
                        }
                    });
                });
            } else {
                console.log("This item already exists");
                return new Promise((resolve, reject) => {
                    reject("This item already exists");
                });
            }
        });
};

/**
 * Remove an item to the list
 */
exports.removeItem = function (item) {
    let document;
    return exports.queryCollection()
        .then((results) => {
            document = results[0];
            let documentUrl = `${collectionUrl}/docs/${document.id}`;
            console.log(`Removing item from document:\n${document.id}\n`);

            if (document.items.indexOf(item) > -1) {
                document.items = document.items.filter(i => i !== item)
                return new Promise((resolve, reject) => {
                    client.replaceDocument(documentUrl, document, (err, result) => {
                        if (err) reject(err);
                        else {
                            resolve(result);
                        }
                    });
                });
            } else {
                console.log("This item does not exists");
                return new Promise((resolve, reject) => {
                    reject("This item does not exists");
                });
            }
        });
};

/**
 * Delete the document by ID.
 */
exports.deleteItemsDocument = function () {
    let document = config.documents['items'];
    let documentUrl = `${collectionUrl}/docs/${document.id}`;
    console.log(`Deleting document:\n${document.id}\n`);

    return new Promise((resolve, reject) => {
        client.deleteDocument(documentUrl, (err, result) => {
            if (err) reject(err);
            else {
                resolve(result);
            }
        });
    });
};



/**
 * Cleanup the database and collection on completion
 */
exports.cleanup = function () {
    console.log(`Cleaning up by deleting database ${config.database.id}`);

    return new Promise((resolve, reject) => {
        client.deleteDatabase(databaseUrl, (err) => {
            if (err) reject(err)
            else resolve(null);
        });
    });
}

/**
 * Exit the app with a prompt
 * @param {message} message - The message to display
 */
exports.exit = function (message) {
    console.log(message);
    console.log('Press any key to exit');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
}