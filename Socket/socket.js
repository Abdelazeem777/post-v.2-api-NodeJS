const { setActiveToTrue, setActiveToFalse } = require('../Account/active_status.js');
var { usersSocketIDsMap, addClientToMap, removeClientFromMap } = require('./socket_users_ID_map.js');
const ObjectID = require('mongodb').ObjectID;

const New_USER_CONNECT_EVENT = 'newUserConnect';
const USER_DISCONNECTING_EVENT = 'userDisconnecting';
const FOLLOW_EVENT = 'follow';
const UNFOLLOW_EVENT = 'unFollow';
const NEW_POST_EVENT = 'newPost';

function socketConnection(socketP, UserP, ioP) {
    User = UserP;
    io = ioP;
    socket = socketP;

    var userID = socket.handshake.query.userID;
    addClientToMap(userID, socket);
    setActiveToTrue(User, userID);
    console.log('Connected users: ' + [...usersSocketIDsMap.keys()].toString());

    io.emit(New_USER_CONNECT_EVENT, userID);
    socket.on(USER_DISCONNECTING_EVENT, userDisconnecting);

    socket.on(FOLLOW_EVENT, follow);
    socket.on(UNFOLLOW_EVENT, unFollow)

    socket.on(NEW_POST_EVENT, addNewPost);
}



async function follow(dataJson) {

    currentUserID = dataJson.currentUserID;
    targetUserID = dataJson.targetUserID;
    rank = dataJson.rank;

    currentUserSocket = usersSocketIDsMap.get(currentUserID);
    targetUserSocket = usersSocketIDsMap.get(targetUserID);

    addTargetIDToCurrentUserFollowingList(currentUserID, targetUserID, rank)
        .then(() => {
            addCurrentUserIDtoTargetUserFollowersList(currentUserID, targetUserID)
                .then(() => {
                    console.log('follow Done');
                    if (targetUserSocket != null)
                        targetUserSocket.emit(FOLLOW_EVENT, { 'from': currentUserID, 'to': targetUserID });
                    if (currentUserSocket != null)
                        currentUserSocket.emit(FOLLOW_EVENT, { 'from': currentUserID, 'to': targetUserID, 'rank': rank });
                },
                    (error) => console.error("add current to target error: " + error));
        },
            (error) => console.error("add target to current error: " + error)
        );


}

async function addTargetIDToCurrentUserFollowingList(currentUserID, targetUserID, rank) {
    const query = { '_id': ObjectID(currentUserID) };
    const options = {
        $set: { ["followingRankedMap." + rank]: targetUserID }
    };
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
    console.log(dataJson);

    currentUserSocket = usersSocketIDsMap.get(currentUserID);
    targetUserSocket = usersSocketIDsMap.get(targetUserID);



    removeTargetIDFromCurrentUserFollowingList(currentUserID, targetUserID, rank)
        .then(() => {
            removeCurrentUserIDFromTargetUserFollowersList(currentUserID, targetUserID)
                .then(() => {
                    console.log('unFollow Done');
                    if (targetUserSocket != null)
                        targetUserSocket.emit(UNFOLLOW_EVENT, { 'from': currentUserID, 'to': targetUserID });
                    if (currentUserSocket != null)
                        currentUserSocket.emit(UNFOLLOW_EVENT, { 'from': currentUserID, 'to': targetUserID, 'rank': rank });
                },
                    (error) => console.error("remove current from target error: " + error));
        },
            (error) => console.error("remove target from current error: " + error));

}



async function removeTargetIDFromCurrentUserFollowingList(currentUserID, _, rank) {
    const query = { '_id': ObjectID(currentUserID) };
    const options = { $unset: { ["followingRankedMap." + rank]: '' } };
    await User.updateOne(query, options);
}
async function removeCurrentUserIDFromTargetUserFollowersList(currentUserID, targetUserID) {
    const query = { '_id': ObjectID(targetUserID) };
    const options = { $pull: { followersList: currentUserID } };
    await User.updateOne(query, options);
}

function addNewPost(newPost) {
    console.log(newPost);

}

function userDisconnecting(userID) {
    removeClientFromMap(userID);
    console.log("disconnected: " + userID);
    console.log("Connected users: " + [...usersSocketIDsMap.keys()].toString());
    io.emit(USER_DISCONNECTING_EVENT, userID);
    setActiveToFalse(User, userID);
}


module.exports = socketConnection;