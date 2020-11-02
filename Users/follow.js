const ObjectID = require('mongodb').ObjectID;

function follow(request, response, User) {
    currentUserID = request.body.currentUserID;
    targetUserID = request.body.targetUserID;

    addTargetIDToCurrentUserFollowingList(User, response, currentUserID, targetUserID);
    addCurrentUserIDtoTargetUserFollowersList(User, response, currentUserID, targetUserID);

    return response.send('Ok');

}

function addTargetIDToCurrentUserFollowingList(User, response, currentUserID, targetUserID) {
    const query = { '_id': ObjectID(currentUserID) };
    const options = { $push: { followingRankedList: targetUserID } };
    User.updateMany(query, options, (error, _result) => {
        if (error) {
            console.error("follow: " + error);
            return response.status(500).send(error);
        }

    });
}
function addCurrentUserIDtoTargetUserFollowersList(User, response, currentUserID, targetUserID) {
    const query = { '_id': ObjectID(targetUserID) };
    const options = { $push: { followersList: currentUserID } };
    User.updateMany(query, options, (error, _result) => {
        if (error) {
            console.error("follow: " + error);
            return response.status(500).send(error);
        }
    });
}
module.exports = follow;