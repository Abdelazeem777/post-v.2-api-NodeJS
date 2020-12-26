const ObjectID = require('mongodb').ObjectID;

async function updateUserRank(request,response,User){
    const currentUserID=request.body.currentUserID;
    const targetUserID=request.body.targetUserID;
    const newRank=request.body.newRank;

    await removeTargetIDFromTheOldIndex(currentUserID, targetUserID, User);
    await addTargetIDAtTheNewIndex(currentUserID,targetUserID,newRank,User);
    return response.send('Done');
}

async function removeTargetIDFromTheOldIndex(currentUserID, targetUserID, User) {
    const query = { '_id': ObjectID(currentUserID) };
    const options = { $pull: { followingRankedList: targetUserID } };
    await User.updateOne(query, options);
}

async function addTargetIDAtTheNewIndex(currentUserID,targetUserID,newRank,User){
    const query = { '_id': ObjectID(currentUserID) };
    const options = { 
        $push: { 
            followingRankedList: {
                $each :[targetUserID],
                $position: newRank
            }
        } 
    };
    await User.updateOne(query, options);
}


module.exports=updateUserRank;