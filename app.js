var restify = require('restify');
var builder = require('botbuilder');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Create database adapter
var dbAdapter = require('./db');
var config = require("./config");

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond accordingly
var bot = new builder.UniversalBot(connector, function (session) {
    var command = session.message.text.toLowerCase();
    if (command.startsWith("add")) {
        return dbAdapter.addItem(session.message.text.split(' ')[1])
            .then(() => {
                return session.say("Item Added", "Item Added", { inputHint: builder.InputHint.ignoringInput });
            }).catch(e => session.say(e, e, { inputHint: builder.InputHint.ignoringInput }));
    } else if (command.startsWith("remove")) {
        return dbAdapter.removeItem(session.message.text.split(' ')[1])
            .then(() => {
                return session.say("Item Removed", "Item Removed", { inputHint: builder.InputHint.ignoringInput });
            }).catch(e => session.say(e, e, { inputHint: builder.InputHint.ignoringInput }));
    } else {
        switch (command) {
            case "set up database":
                return dbAdapter.getDatabase()
                    .then(() => dbAdapter.getCollection())
                    .then(() => dbAdapter.getItemsDocument())
                    .then(() => {
                        return session.say("Database initialized", "Database initialized", { inputHint: builder.InputHint.ignoringInput });
                    });
                break;
            case "get database":
                return dbAdapter.queryCollection()
                    .then((results) => {
                        var result = results[0].items;
                        var str = result.slice(0, -1).join(', ') + ' and ' + result.slice(-1);
                        return session.say("Database queried, the results are: " + str, "Database queried, the results are: " + str, { inputHint: builder.InputHint.ignoringInput });
                    });
                break;
            case "clean database":
                return dbAdapter.cleanup()
                    .then(() => {
                        return session.say("Database cleaned", "Database cleaned", { inputHint: builder.InputHint.ignoringInput });
                    });
                break;
            case "check":
                return dbAdapter.getSnapshotDocument().then(result => {
                    var tags = result.snapshot.description.tags;
                    var str = tags.slice(0, -1).join(', ') + ' and ' + tags.slice(-1);
                    return session.say("Here are some words that can describe what I see: " + str);
                });
                break;
            default:
                return session.say(`Unkonwn activity. You said "${session.message.text}"`, `Unkonwn activity. You said "${session.message.text}"`, { inputHint: builder.InputHint.ignoringInput });
                break;
        }
    }
});