const signup = require('./Account/sign_up.js');
const login = require('./Account/login.js');
const alternateLogin = require('./Account/alternate_login.js');
const updateProfilePic = require('./Account/update_profile_pic.js');
const updateProfileData = require('./Account/update_profile_data.js');
const deleteAccount = require('./Account/delete_account.js');
const deletePost = require('./Posts/deletePost.js');
const express = require('express');
const BodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var path = require('path');
const socketConnection = require('./Socket/socket.js');
const searchForUser = require('./Users/search_for_user.js');
const { loadFollowersUsers, loadFollowingUsers } = require('./Users/load_users_list.js');
const loadPostsList = require('./Posts/loadPostsList.js');
const { initUsersSockets } = require('./Socket/socket_users_ID_map.js');
const updateUserRank = require('./Account/update_user_rank.js');
const getNotifications = require('./Notifications/get_notifications.js');
var publicDir = path.join(__dirname, 'usersProfilePictures');


var User;
var Posts;
var app = express();
var http = require('http').Server(app);
const io = require('socket.io')(http);
app.use('/usersProfilePictures', express.static(publicDir));
app.use(BodyParser.json({ limit: '50mb' }));
app.use(BodyParser.urlencoded({ limit: '50mb', extended: true }));
http.listen(3000, () => {
    // Connect to mongoDB
    MongoClient.connect('mongodb://localhost:27017',
        { useUnifiedTopology: true, useNewUrlParser: true },
        async (err, client) => {
            assert.strictEqual(null, err);
            const db = client.db('postDB');
            User = db.collection('user');
            Posts = db.collection('posts');
            Notifications = db.collection('notifications');
            console.log('Connected successfully to server');

            await initUsersSockets(User);

            //client.close();
        });
});

//account routes
app.post('/account/signup', (request, response) => signup(request, response, User));
app.post('/account/login', (request, response) => login(request, response, User));
app.post('/account/alternateLogin', (request, response) => alternateLogin(request, response, User));
app.delete('/account/deleteAccount/:email', (request, response) => deleteAccount(request, response, User));
app.patch('/account/updateProfileData', (request, response) => updateProfileData(request, response, User));
app.post('/account/uploadProfilePic', (request, response) => updateProfilePic(request, response, User));
app.post('/account/updateUserRank', (request, response) => updateUserRank(request, response, User));

//users routes
app.get('/users/search/:userName', (request, response) => searchForUser(request, response, User));
app.get('/users/loadFollowingUsers/:userID', (request, response) => loadFollowingUsers(request, response, User));
app.get('/users/loadFollowersUsers/:userID', (request, response) => loadFollowersUsers(request, response, User));

//posts routes
app.get('/posts/getPosts/:userID', (request, response) => loadPostsList(request, response, Posts, User));
app.post('/posts/deletePost', (request, response) => deletePost(request, response, Posts, User));

//notifications routes
app.get('/posts/getNotifications/:userID', (request, response) => getNotifications(request, response, Notifications, User));

//socket route
io.on('connection', (socket) => socketConnection(socket, User, Posts, Notifications, io));

