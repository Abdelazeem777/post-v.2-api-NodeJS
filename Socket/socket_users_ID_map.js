var usersSocketsMap = new Map();

function addClientToMap(userID, socket) {
    usersSocketsMap.set(userID, socket);
}

function removeClientFromMap(userID) {
    usersSocketsMap.delete(userID);
}



module.exports = { usersSocketsMap, addClientToMap, removeClientFromMap }