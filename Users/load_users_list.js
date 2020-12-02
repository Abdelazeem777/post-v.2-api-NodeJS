const ObjectID = require('mongodb').ObjectID;
function loadFollowingList(request, response, User) {
    var userID = request.params.userID;

    User.findOne({ '_id': ObjectID(userID) }, {
        projection: { followingRankedList: 1 }
    }, async (error, result) => {
        if (error) {
            console.error("loadFollowingList: " + error);
            return response.status(500).send(error);
        }

        let usersList = new Array();
        let followingUsersIDList = new Array();
        followingUsersIDList = result.followingRankedList;

        for (let index = 0; index < followingUsersIDList.length; index++) {
            const myID = followingUsersIDList[index];
            const query = { _id: ObjectID(myID) };
            const options = {
                projection: { _id: 1, userName: 1, bio: 1, userProfilePicURL: 1, active: 1 },
            };
            user = await User.findOne(query, options)
            usersList.push(user);
        }

        usersList.forEach(obj => renameKey(obj, '_id', 'userID'));
        responseData = { 'usersList': usersList };
        return response.send(responseData);
    });
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
                return response.send({ 'usersList': result });
            }
        });
    });
}



module.exports = { loadFollowersList, loadFollowingList };
