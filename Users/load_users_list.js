const ObjectID = require('mongodb').ObjectID;
function loadFollowingUsers(request, response, User) {
    var userID = request.params.userID;

    User.findOne({ '_id': ObjectID(userID) }, {
        projection: { followingRankedList: 1 }
    }, async (error, result) => {
        if (error) {
            console.error("loadFollowingUsers: " + error);
            return response.status(500).send(error);
        }

        let usersList = [];
        let followingUsersIDList = [];
        followingUsersIDList = result.followingRankedList;

        for (let index = 0; index < followingUsersIDList.length; index++) {
            const myID = followingUsersIDList[index];
            const query = { _id: ObjectID(myID) };
            const options = {
                projection: { _id: 1, userName: 1, bio: 1, userProfilePicURL: 1, active: 1 },
            };
            user = await User.findOne(query, options);
            if(user===null)continue;
            usersList.push(user);
        }

        usersList.forEach(renameKey_id2userID);
        responseData = { 'usersList': usersList };
        return response.send(responseData);
    });
}

//we use this method to change the userID from _id to userID
//to be accepted in front-end
function renameKey_id2userID(obj) {
    if(obj._id!= null)
        obj.userID = obj._id;
    delete obj._id;
}

function loadFollowersUsers(request, response, User) {
    var userID = request.params.userID;
    User.findOne({ '_id': ObjectID(userID) }, {
        projection: { followersList: 1 }
    }, (error, result) => {
        if (error) {
            console.error("loadFollowersUsers: " + error);
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
                console.error("loadFollowersUsers: " + error);
                return response.status(500).send(error);
            }
            else {
                result.forEach(renameKey_id2userID);
                return response.send({ 'usersList': result });
            }
        });
    });
}



module.exports = { loadFollowersUsers, loadFollowingUsers };
