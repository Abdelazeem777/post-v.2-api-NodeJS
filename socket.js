const userSocketIDMap=new Map();

function socketConnection (socket) {
    

    socket.on('newPost', (newPost) => {
        console.log(newPost);
    });
}
module.exports=socketConnection;