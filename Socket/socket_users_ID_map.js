const UserSocket = require("../Models/user_socket_model.js");

var usersSocketsMap = new Map();
//{userID:[followerSocket"an instance from UserSocket"]}
var usersFollowersSocketMap = new Map();

function addClientToMap(userID, socket) {
    if (usersSocketsMap.has(userID))
        usersSocketsMap.get(userID).socket = socket;
    else
        usersSocketsMap.set(userID, new UserSocket(socket));
}

function removeClientFromMap(userID) {
    usersSocketsMap.get(userID).socket = null;
}

function addCurrentUserSocketToTargetFollowersList(currentUserSocket, targetUserID) {
    if (usersFollowersSocketMap.has(targetUserID))
        usersFollowersSocketMap[targetUserID].set(currentUserSocket);
    else
        usersFollowersSocketMap.set(targetUserID, [currentUserSocket]);
}

function removeCurrentUserSocketFromTargetFollowersList(currentUserSocket, targetUserID) {
    if (usersFollowersSocketMap.has(targetUserID)) {
        targetUserFollowersList = usersFollowersSocketMap.get(targetUserID);
        usersFollowersSocketMap[targetUserID] = removeItem(targetUserFollowersList, currentUserSocket);
    }
}

function removeItem(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}


module.exports = {
    usersSocketsMap,
    addClientToMap,
    removeClientFromMap,

    usersFollowersSocketMap,
    addCurrentUserSocketToTargetFollowersList,
    removeCurrentUserSocketFromTargetFollowersList,
}