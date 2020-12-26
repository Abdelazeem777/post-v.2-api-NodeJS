const ObjectID = require('mongodb').ObjectID;

async function loadPostsList(request, response, Posts, User) {
    var userID = request.params.userID;
    var postsIDsList = [];
    postsIDsList = await getPostsIDs(userID, User);

    var postsList = await getPostsByPostsIDsList(postsIDsList, Posts);

    var responseData = { 'postsList': postsList };
    console.log(postsIDsList);
    console.log(responseData);
    response.send(responseData);
}

async function getPostsIDs(userID, User) {
    const query = { _id: ObjectID(userID) };
    const options = { projection: { postsList: 1 } };
    var result = await User.findOne(query, options);
    return result.postsList;
}

async function getPostsByPostsIDsList(postsIDsList, Posts) {
    var postsList = [];
    for (let index = 0; index < postsIDsList.length; index++) {
        const postID = postsIDsList[index];
        const post = await getPostByPostID(postID, Posts);
        renameKey_id2postID(post);
        postsList.push(post);
    }
    return postsList;
}

function getPostByPostID(postID, Posts) {
    const query = { _id: ObjectID(postID) };
    return Posts.findOne(query);
}

//we use this method to change the postID from _id to postID
//to be accepted in front-end
function renameKey_id2postID(obj) {
    obj.postID = obj._id;
    delete obj._id;
}
module.exports = loadPostsList;