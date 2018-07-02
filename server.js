const express = require('express');
const app = express();
const path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var users = [];
var connections = [];

app.use(express.static(path.join(__dirname, 'views')));



server.listen(process.env.PORT || 4000, function () {
    console.log('server running ')
});

app.get('/', function (req, res){
    console.log('main page requested');
    res.sendFile(__dirname + '/index');
});

io.sockets.on('connection', function (socket) {
    try{

        connections.push(socket);
        console.log('sockets connected : ' + connections.length);

        //disconnect
        socket.on('disconnect', function (data) {

            users.splice(users.indexOf(socket.username), 1)
            connections.splice(connections.indexOf(socket), 1);
            updateUserNames();
            console.log('sockets disconected ' + socket)
        });

        // send new msg
        socket.on('send message', function (data) {
            io.sockets.emit('new message', {msg: data, user: socket.username})
        });

        //new user
        socket.on('new user', function (data, callback) {
            callback(true);
            socket.username = data;
            users.push(socket.username);

            updateUserNames();
        });

        function updateUserNames() {
            io.sockets.emit('get users', users)
        }

    }catch(err){
        console.log(err)
    }

});
