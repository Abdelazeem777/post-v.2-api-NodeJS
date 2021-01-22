const ObjectID = require('mongodb').ObjectID;

//TODO: I am going to make a loop for every notification that loads the fromUser{userName,profilePicture}
function getNotifications(request, response, Notifications, User) {
    var userID = request.params.userID;
    const query = { toUserID: userID };
    const options = buildOptions();
    Notifications.find(query, options, async (error, result) => {
        if (error) {
            console.log("getNotifications: " + error);
            return response.status(500).send(error);
        }
        else {
            usersList = await modifyResultAndGetUsersList(result, User);
            notificationsMap = {
                'notificationsList': result,
                'usersList': usersList,
            };
            console.log(notificationsMap);
            return response.send(notificationsMap);
        }
    });
}

function buildOptions() {
    return {
        projection: {
            _id: 1,
            fromUserID: 1,
            notificationContent: 1,
            notificationType: 1,
            reactType: 1,
            timestamp: 1,
            seen: 1,
            payload: 1,
        }
    };
}

async function modifyResultAndGetUsersList(result, User) {
    usersList = [];
    alreadyAddedUsersIDs = [];
    for (let i = 0; i < result.length; i++) {
        const notification = result[i];
        renameKey(notification, '_id', 'notificationID');
        fromUserID = notification[fromUserID];
        if (!alreadyAddedUsersIDs.includes(fromUserID)) {
            user = await getUserNameAndProfilePic(fromUserID, User);
            usersList.push(user);
            alreadyAddedUsersIDs.push(fromUserID);
        }
    }
    return usersList;
}

function renameKey(notification, oldKey, newKey) {
    notification[newKey] = notification[oldKey];
    delete notification[oldKey];
}

async function getUserNameAndProfilePic(fromUserID, User) {
    const query = { _id: ObjectID(fromUserID) };
    const options = {
        projection: {
            userName: 1, userProfilePicURL: 1, active: 1
        }
    };
    user = await User.findOne(query, options);
    user.userID = user._id;
    delete user._id;
    return user;
}

module.exports = { getNotifications, getUserNameAndProfilePic };