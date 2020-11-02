//the problem is u r not sending an email so its null and that's mean it will return any user from the db
//the solution is to send email with request whatever the way is
var alternateLogin=(request, response, User) => {
    User.findOne({ "email": request.body.email }, (err, user) => {
        if (err) {
            console.log("alternateLogin1: " + err);
            return response.status(500).send(err);
        }
        //login
        if (user) {
            User.updateOne({ "email": request.body.email, "password": { $exists: false } }, { $set: request.body }, (error, result) => {
                if (error) {
                    console.log("alternateLogin2: " + error);
                    return response.status(500).send(error);
                }
                userDataMap = {
                    "userID": request.body._id,
                    "userName": request.body.userName,
                    "bio": request.body.bio,
                    "email": request.body.email,
                    "userProfilePicURL": request.body.userProfilePicURL,
                    "active": request.body.active,
                    "followersList": request.body.followersList,
                    "followingRankedList": request.body.followingRankedList,
                    "postsList": request.body.postsList
                }
                response.send(userDataMap);
                console.log("alternateLogin");
                console.log(userDataMap);

            });
        }
        //if user not exist then signup
        else {
            User.insertOne(request.body, (error, result) => {
                if (error) {
                    console.log("alternateSignUp: " + error);
                    return response.status(500).send(error);
                }
                userDataMap = {
                    "userID": result.insertedId,
                    "userName": request.body.userName,
                    "bio": request.body.bio,
                    "email": request.body.email,
                    "userProfilePicURL": request.body.userProfilePicURL,
                    "active": request.body.active,
                    "followersList": request.body.followersList,
                    "followingRankedList": request.body.followingRankedList,
                    "postsList": request.body.postsList
                }
                response.send(userDataMap);

                console.log("alternateSignup");
                console.log(userDataMap);
            });
        }

    });
};
module.exports=alternateLogin;