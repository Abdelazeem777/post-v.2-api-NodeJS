const ObjectID = require('mongodb').ObjectID;

async function deletePost(request, response, Posts, User) {
    const postID = request.body.postID;
    const userID = request.body.userID;
    const userPassword = request.body.userPassword;
    if (await thisUserIsExist(userID, userPassword, User)) {
        var isDeleted = await deletePostFromPostsDB(postID, userID, Posts);
        if (isDeleted) {
            await deletePostIDFromCurrentUserPostsList(postID, userID, User)
            response.send('Post is deleted successfully');
        }
    }


}
async function thisUserIsExist(userID, userPassword, User) {
    var result = await User.findOne({ '_id': ObjectID(userID), 'password': userPassword });
    if (result)
        return true;
    else
        return false;

}
async function deletePostFromPostsDB(postID, userID, Posts) {
    var result = await Posts.deleteOne({ '_id': ObjectID(postID), 'userID': userID });
    if (result.deletedCount === 1)
        return true;
    else
        return false;

}

async function deletePostIDFromCurrentUserPostsList(postID, userID, User) {
    const query = { _id: ObjectID(userID) };
    const options = { $pull: { postsList: postID } };
    await User.updateOne(query, options);
}
module.exports = deletePost;