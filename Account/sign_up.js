//TODO: I need to pass User var to make the method works
//Also I intended to move all function to a separated files to make the server module cleaner
//if it didn't work just move the signup function back to the server module
var signup = (request, response, User) => {
    //check if the user is exist or not at first
    User.findOne({ "email": request.body.email }, (err, user) => {
        if (err) {
            console.log("signUp: " + err);
            return response.status(500).send(err);
        }

        //if user exist then return
        if (user) {
            return response.status(400).send({ "message": "This email is already exist!" });
        }



        //if not exist
        else {
            console.log(request.body);
            User.insertOne(request.body, (error, result) => {
                if (error) {
                    console.log("signUp: " + error);
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
                };
                response.send(userDataMap);

            });
        }
    });

};
module.exports = signup;