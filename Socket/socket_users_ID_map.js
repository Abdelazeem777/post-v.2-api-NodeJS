const UserSocket = require("../Models/user_socket_model.js");

//{userID: instance from UserSocket}
var usersSocketsMap = new Map();

//{userID:[followerSocket"an instance from UserSocket"]}
var usersFollowersSocketMap = new Map();

async function initUsersSockets(User) {
    console.log('initialing users sockets...');

    const query = {};
    const options = { projection: { _id: 1, followersList: 1 } };
    const usersList = await User.find(query, options).toArray();

    initUsersToUsersSocketsMap(usersList);
    initFollowersSocketsToFollowersMap(usersList);

    console.log('Done Initialing')
}

function initUsersToUsersSocketsMap(usersList) {
    usersList.forEach((user) => addClientToMap(user._id.toString(), null));
}

function initFollowersSocketsToFollowersMap(usersList) {

    for (i = 0; i < usersList.length; i++) {
        user = usersList[i];
        var currentUserSocket = usersSocketsMap.get(user._id.toString());
        var followersList = user.followersList;
        for (const targetUserID of followersList)
            addCurrentUserSocketToTargetFollowersList(currentUserSocket, targetUserID);
    }

}

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
    console.log(usersSocketsMap);
    console.log(usersFollowersSocketMap);
    console.log(currentUserSocket);
    console.log(targetUserID);
    if (usersFollowersSocketMap.has(targetUserID)) {
        targetUserFollowersList = usersFollowersSocketMap.get(targetUserID);
        targetUserFollowersList.push(currentUserSocket);
    }
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
    initUsersSockets,

    usersSocketsMap,
    addClientToMap,
    removeClientFromMap,

    usersFollowersSocketMap,
    addCurrentUserSocketToTargetFollowersList,
    removeCurrentUserSocketFromTargetFollowersList,
}