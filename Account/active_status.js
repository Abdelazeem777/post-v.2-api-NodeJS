const ObjectID = require('mongodb').ObjectID;

function setActiveToTrue(User, userID) {
    const query = { _id: ObjectID(userID) };
    const options = { $set: { active: true } };
    User.updateOne(query, options, (err, _) => {
        if (err)
            console.error("setActiveToTrue: " + err);
    });

}

function setActiveToFalse(User, userID) {
    const query = { _id: ObjectID(userID) };
    const options = { $set: { active: false } };
    User.updateOne(query, options, (err, _) => {
        if (err)
            console.error("setActiveToFalse: " + err);
    });
}
module.exports = { setActiveToTrue, setActiveToFalse };