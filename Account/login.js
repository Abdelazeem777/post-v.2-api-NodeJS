var login = (request, response, User) => {
    User.findOne({ "email": request.body.email, "password": request.body.password }, (err, user) => {
        if (err) {
            console.log("login: " + err);
            return response.status(500).send(err);
        }

        //if the user exist
        if (user) {
            userDataMap = {
                "userID": user._id,
                "userName": user.userName,
                "bio": user.bio,
                "email": user.email,
                "userProfilePicURL": user.userProfilePicURL,
                "active": user.active,
                "followersList": user.followersList,
                "followingRankedMap": user.followingRankedMap,
                "postsList": user.postsList
            }
            response.send(userDataMap);
            console.log(userDataMap);
        }

        //if not exist
        else {
            response.status(400).send({ "message": "Invalid Email or Password!" })
        }

    });
};
module.exports = login;