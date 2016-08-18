var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/chatDB', function(err){
    if(err){
        console.log(err);
    }
});

var chatSchema = mongoose.Schema({
    user: String,
    msg: String,
    created: {
        type: Date,
        default: Date.now()
    }
});

var Chat = mongoose.model('Message', chatSchema);

module.exports = Chat;