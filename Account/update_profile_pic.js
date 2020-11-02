var ObjectID = require('mongodb').ObjectID;
var fs = require('fs');
var updateProfilePic=(request, response,User) => {
    var userID = request.body.userID;
    let base64Image = request.body.base64;
    let ext = request.body.ext;
    console.log(base64Image + ext);

    var imagePath = 'usersProfilePictures/' + userID + '.' + ext;
    User.updateOne({ _id: ObjectID(userID) }, { $set: { userProfilePicURL: '/' + imagePath } }, (err, _) => {
        if (err) {
            console.log("uploadProfilePic: " + err);
            return response.status(500).send(err);
        }
        else {
            let imageAfterDecoding = Buffer.from(base64Image, 'base64');
            fs.writeFile(imagePath, imageAfterDecoding, 'binary', (err) => {
                if (err) {
                    console.log(err.message);
                }

            });
            console.log(imagePath);

            response.send({ 'userProfilePicURL': '/' + imagePath });

        }
    });

};
module.exports=updateProfilePic;