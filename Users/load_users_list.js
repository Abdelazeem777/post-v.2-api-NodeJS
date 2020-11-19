const { query } = require('express');

const ObjectID = require('mongodb').ObjectID;
function loadFollowingList(request, response, User) {
    var userID = request.params.userID;

    User.findOne({ '_id': ObjectID(userID) }, {
        projection: { followingRankedMap: 1 }
    }, (error, followingMapResult) => {
        if (error) {
            console.error("loadFollowingList: " + error);
            return response.status(500).send(error);
        }

        var followingUsersIDMap = new Map(Object.entries(followingMapResult.followingRankedMap));
        followingUsersIDMap.forEach(wrapAllIDsWithObjectID);
        const query = { _id: { $in: [...followingUsersIDMap.values()] } };
        const options = {
            projection: { _id: 1, userName: 1, bio: 1, userProfilePicURL: 1, active: 1 },
        };
        User.find(query, options).toArray((error, usersList) => {
            if (error) {
                console.error("loadFollowingList: " + error);
                return response.status(500).send(error);
            }
            else {
                usersList.forEach(obj => renameKey(obj, '_id', 'userID'));
                usersMapWithRank = new Map(Object.entries(followingMapResult.followingRankedMap));
                usersMapWithRank.forEach((v, k, map) => convertMapOfUsersIDsToMapOfUsers(v, k, map, usersList));
                usersMap = { 'usersMap': strMapToJson(usersMapWithRank) };
                console.log(usersMap);
                return response.send(usersMap);
            }
        });
    });
}

function wrapAllIDsWithObjectID(value, key, map) {
    map.set(key, ObjectID(value));
}

function convertMapOfUsersIDsToMapOfUsers(value, key, map, usersList) {

    usersList.forEach((user) => {

        if (user["userID"] == value) {
            console.log(user);
            map.set(key, user);
        }
    });


}

function strMapToJson(strMap) {
    return JSON.stringify(strMapToObj(strMap));
}

function strMapToObj(strMap) {
    let obj = Object.create(null);
    for (let [k, v] of strMap) {
        // We don’t escape the key '__proto__'
        // which can cause problems on older engines
        obj[k] = v;
    }
    return obj;
}


//we use this method to change the userID from _id to userID
//to be accepted in front-end
function renameKey(obj, oldKey, newKey) {
    obj[newKey] = obj[oldKey];
    delete obj[oldKey];
}

function loadFollowersList(request, response, User) {
    var userID = request.params.userID;
    User.findOne({ '_id': ObjectID(userID) }, {
        projection: { followersList: 1 }
    }, (error, result) => {
        if (error) {
            console.error("loadFollowersList: " + error);
            return response.status(500).send(error);
        }
        var followersUsersIDList = result.followersList;
        followersUsersIDList = followersUsersIDList.map(myId => ObjectID(myId));
        const query = { _id: { $in: followersUsersIDList } };
        const options = {
            projection: { _id: 1, userName: 1, bio: 1, userProfilePicURL: 1, active: 1 },
        };
        User.find(query, options).toArray((error, result) => {
            if (error) {
                console.error("loadFollowersList: " + error);
                return response.status(500).send(error);
            }
            else {
                result.forEach(obj => renameKey(obj, '_id', 'userID'));
                usersMap = { 'usersList': result };

                return response.send(usersMap);
            }
        });
    });
}



module.exports = { loadFollowersList, loadFollowingList };
