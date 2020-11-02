var ObjectID = require('mongodb').ObjectID;
var updateProfileData=(request, response, User) => {
    var userID = request.body.userID;
    var newUserName = request.body.userName;
    var newBio = request.body.bio;
    User.updateOne({ _id: ObjectID(userID) }, { $set: { userName: newUserName, bio: newBio } }, (err, _) => {
        if (err) {
            console.log("updateProfileData: " + err);
            return response.status(500).send(err);
        }
        else {
            console.log('Updated successfully');
            return response.send('Updated successfully')
        }
    });
};
module.exports=updateProfileData;