const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/Alarm')
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    alarms: {type: Array, default: []},
    sleep: {type: Array, default: []}
});

const User = mongoose.model('User', userSchema);

module.exports = User;
