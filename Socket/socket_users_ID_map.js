var usersSocketIDsMap = new Map();

function addClientToMap(userID, socketId) {
    if (!usersSocketIDsMap.has(userID)) {
        usersSocketIDsMap.set(userID, socketId);
    }
}

function removeClientFromMap(userID) {
    if (usersSocketIDsMap.has(userID)) {
        usersSocketIDsMap.delete(userID);
    }

}



module.exports = { usersSocketIDsMap, addClientToMap, removeClientFromMap }