const { setActiveToTrue, setActiveToFalse } = require('../Account/active_status.js');
var {
    usersSocketsMap,
    addClientToMap,
    removeClientFromMap,
    usersFollowersSocketMap,
    addCurrentUserSocketToTargetFollowersList,
    removeCurrentUserSocketFromTargetFollowersList,
} = require('./socket_users_ID_map.js');
const ObjectID = require('mongodb').ObjectID;

const New_USER_CONNECT_EVENT = 'newUserConnect';
const USER_DISCONNECTING_EVENT = 'userDisconnecting';
const USER_PAUSED = 'userPaused';
const FOLLOW_EVENT = 'follow';
const UNFOLLOW_EVENT = 'unFollow';
const NEW_POST_EVENT = 'newPost';

function socketConnection(socketP, UserP, PostsP, ioP) {
    User = UserP;
    io = ioP;
    socket = socketP;
    Posts = PostsP;

    onUserConnect();

    socket.on(USER_PAUSED, userPaused);
    socket.on(USER_DISCONNECTING_EVENT, userDisconnecting);

    socket.on(FOLLOW_EVENT, follow);
    socket.on(UNFOLLOW_EVENT, unFollow);

    socket.on(NEW_POST_EVENT, addNewPost);
}



function onUserConnect() {
    var userID = socket.handshake.query.userID;
    console.log(userID);
    if (userID != null) {
        addClientToMap(userID, socket);
        setActiveToTrue(User, userID);
        console.log('Connected users: ' + [...usersSocketsMap.keys()].toString());
        io.emit(New_USER_CONNECT_EVENT, userID);
    }
}

async function follow(dataJson) {

    currentUserID = dataJson.currentUserID;
    targetUserID = dataJson.targetUserID;
    rank = dataJson.rank;

    currentUserSocket = usersSocketsMap.get(currentUserID);
    targetUserSocket = usersSocketsMap.get(targetUserID);

    addTargetIDToCurrentUserFollowingList(currentUserID, targetUserID)
        .then(() => {
            addCurrentUserIDtoTargetUserFollowersList(currentUserID, targetUserID)
                .then(() => {
                    if (socketIsDefined(targetUserSocket))
                        targetUserSocket.socket.emit(FOLLOW_EVENT, { 'from': currentUserID, 'to': targetUserID, 'rank': rank });
                    if (socketIsDefined(currentUserSocket))
                        currentUserSocket.socket.emit(FOLLOW_EVENT, { 'from': currentUserID, 'to': targetUserID, 'rank': rank });
                    addCurrentUserSocketToTargetFollowersList(currentUserSocket, targetUserID);
                },
                    (error) => console.error("add current to target error: " + error));
        },
            (error) => console.error("add target to current error: " + error)
        );


}

function socketIsDefined(userSocket) {
    if (userSocket != null) {
        if (userSocket.socket != null)
            return true
    }
    return false
}

async function addTargetIDToCurrentUserFollowingList(currentUserID, targetUserID) {
    const query = { '_id': ObjectID(currentUserID) };
    const options = { $addToSet: { followingRankedList: targetUserID } };
    await User.updateOne(query, options);
}
async function addCurrentUserIDtoTargetUserFollowersList(currentUserID, targetUserID) {
    const query = { '_id': ObjectID(targetUserID) };
    const options = { $addToSet: { followersList: currentUserID } };
    await User.updateOne(query, options);
}
async function unFollow(dataJson) {

    currentUserID = dataJson.currentUserID;
    targetUserID = dataJson.targetUserID;
    rank = dataJson.rank;

    currentUserSocket = usersSocketsMap.get(currentUserID);
    targetUserSocket = usersSocketsMap.get(targetUserID);



    removeTargetIDFromCurrentUserFollowingList(currentUserID, targetUserID)
        .then(() => {
            removeCurrentUserIDFromTargetUserFollowersList(currentUserID, targetUserID)
                .then(() => {
                    if (socketIsDefined(targetUserSocket))
                        targetUserSocket.socket.emit(UNFOLLOW_EVENT, { 'from': currentUserID, 'to': targetUserID, 'rank': rank });
                    if (socketIsDefined(currentUserSocket))
                        currentUserSocket.socket.emit(UNFOLLOW_EVENT, { 'from': currentUserID, 'to': targetUserID, 'rank': rank });
                    removeCurrentUserSocketFromTargetFollowersList(currentUserSocket, targetUserID);
                },
                    (error) => console.error("remove current from target error: " + error));
        },
            (error) => console.error("remove target from current error: " + error));

}

async function removeTargetIDFromCurrentUserFollowingList(currentUserID, targetUserID) {
    const query = { '_id': ObjectID(currentUserID) };
    const options = { $pull: { followingRankedList: targetUserID } };
    await User.updateOne(query, options);
}
async function removeCurrentUserIDFromTargetUserFollowersList(currentUserID, targetUserID) {
    const query = { '_id': ObjectID(targetUserID) };
    const options = { $pull: { followersList: currentUserID } };
    await User.updateOne(query, options);
}

function addNewPost(newPost) {
    Posts.insertOne(newPost, async (error, result) => {
        if (error)
            console.error("addNewPost: " + error);
        else {
            newPost = {
                'postID': result.insertedId.toString(),
                'userID': newPost.userID,
                'postContent': newPost.postContent,
                'postType': newPost.postType,
                'timestamp': newPost.timestamp,
                'reactsList': newPost.reactsList,
                'numberOfShares': newPost.numberOfShares,
                'commentsList': newPost.commentsList,
            }
            await addPostIDToCurrentUserPostList(newPost.userID, newPost.postID);
            sendPostToCurrentUserAndHisFollowers(newPost.userID, newPost);

        }
    });

}
async function addPostIDToCurrentUserPostList(userID, postID) {
    const query = { _id: ObjectID(userID) };
    const options = { $addToSet: { postsList: postID.toString() } };
    await User.updateOne(query, options);

}
function sendPostToCurrentUserAndHisFollowers(currentUserID, newPost) {
    var followersSocketList = new Array();
    if (usersFollowersSocketMap.has(currentUserID)) {
        followersSocketList = usersFollowersSocketMap.get(currentUserID);
        followersSocketList.forEach((userSocket) => {
            if (userSocket.socket != null) userSocket.socket.emit(NEW_POST_EVENT, newPost);
        });
    }
    console.log(newPost);
    currentUserSocket = usersSocketsMap.get(currentUserID).socket;
    currentUserSocket.emit(NEW_POST_EVENT, newPost);
}

function userPaused(userID) {
    notifyOtherUsers(userID);
    setActiveToFalse(User, userID);
}

function notifyOtherUsers(userID) {
    var followersSocketList = new Array();
    if (usersFollowersSocketMap.has(userID)) {
        followersSocketList = usersFollowersSocketMap.get(userID);
        followersSocketList.forEach((userSocket) => {
            if (userSocket.socket != null) userSocket.socket.emit(USER_PAUSED, userID);
        });
    }
    userSocket = usersSocketsMap.get(userID).socket;
    userSocket.emit(USER_PAUSED, userID);
}

function userDisconnecting(userID) {
    removeClientFromMap(userID);
    console.log("disconnected: " + userID);
    console.log("Connected users: " + [...usersSocketsMap.keys()].toString());
    io.emit(USER_DISCONNECTING_EVENT, userID);
}


module.exports = socketConnection;