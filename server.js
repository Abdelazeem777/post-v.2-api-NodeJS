const signup = require('./Account/sign_up.js');
const login = require('./Account/login.js');
const alternateLogin = require('./Account/alternate_login.js');
const updateProfilePic = require('./Account/update_profile_pic.js');
const updateProfileData = require('./Account/update_profile_data.js');
const deleteAccount = require('./Account/delete_account.js');
const express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var path = require('path');
const socketConnection = require('./socket.js');
const searchForUser = require('./Users/searchForUser.js');
const follow = require('./Users/follow.js');
var publicDir = path.join(__dirname, 'usersProfilePictures');


var User;
var app = express();
var http = require('http').Server(app);
const io = require('socket.io')(http);
app.use('/usersProfilePictures', express.static(publicDir));
app.use(BodyParser.json({ limit: '50mb' }));
app.use(BodyParser.urlencoded({ limit: '50mb', extended: true }));
http.listen(3000, () => {
    // Connect to mongoDB
    MongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true, useNewUrlParser: true }, (err, client) => {
        assert.strictEqual(null, err);
        const db = client.db('postDB');
        User = db.collection("user");
        console.log("Connected successfully to server");


        //client.close();
    });
});

//account routes
app.post("/account/signup", (request, response) => signup(request, response, User));
app.post("/account/login", (request, response) => login(request, response, User));
app.post("/account/alternateLogin", (request, response) => alternateLogin(request, response, User));
app.delete('/account/deleteAccount/:email', (request, response) => deleteAccount(request, response, User));
app.patch('/account/updateProfileData', (request, response) => updateProfileData(request, response, User));
app.post("/account/uploadProfilePic", (request, response) => updateProfilePic(request, response, User));

//users routes
app.get("/users/search/:userName", (request, response) => searchForUser(request, response, User));
app.patch('/users/follow', (request, response) => follow(request, response, User));

//socket route
io.on('connection', socketConnection);


