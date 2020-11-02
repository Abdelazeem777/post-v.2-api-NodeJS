//request example:
// http://localhost:3000/account/deleteAccount/testing_user@test.com
var deleteAccount=(request, response, User) => {
    User.deleteOne({ email: request.params.email }, (err, res) => {
        if (err) {
            console.log("delete account: " + err);

        }
        else if (res.deletedCount !== 1) {
            console.log('This account is not exist!');
            return response.status(400).send({ 'message': 'This account is not exist!' });
        }
        else {
            console.log('deleted successfully');
            return response.send('Deleted successfully');
        }
    });

};
module.exports=deleteAccount;