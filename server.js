var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Chat = require('./models/chat');

var port = process.env.PORT || 3000;

users = [];
connections = [];

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/bower_components'));

app.get('/', function(req, res){
   res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    // loading msgs saved on mongodb
    var query = Chat.find({});
    // displaying last 8 saved messages only
    query.sort('-created').limit(8).exec(function(err, docs){
        if(err) throw err;
        socket.emit('load old msgs', docs);
    });

   connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length); // this is same as above

    // Disconnect
    socket.on('disconnect', function(data){
        users.splice(users.indexOf(socket.username), 1);
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets disconnected', connections.length);
    });

    // Send Message
    socket.on('send message', function(data){
        var newMsg = new Chat({msg: data, user: socket.username});
        newMsg.save();
        io.emit('new message', { msg: data, user: socket.username});
    });

    // New user
    socket.on('new user', function(data, callback){
        // check if username exists and returns false if user already exists
        if(users.indexOf(data) != -1){
            callback(false);
        }
        else {
            callback(true);
            socket.username = data;
            users.push(socket.username);
            updateUsernames();
        }
    });

    function updateUsernames(){
        io.emit('usernames', users);
    }

    // is typing functionality
    socket.on('typing', function (data) {
        socket.broadcast.emit('is typing', {msg: data, user: socket.username});
    });
});

// Server running
server.listen(port, function(){
    console.log("Server running on port " + port);
});

