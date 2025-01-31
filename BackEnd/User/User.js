const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/Alarm')
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    alarms: {type: Array, default: []},
    sleep: {type: Array, default: []},
    wakeup: {type: Object, default: {
        time: null,
        vibration: false,
        gradualVolume: false,
        wakeUpChallange: null,
        alarmSound: null,
    }},
    challenge: {type: Array, default: [
        {
            name: 'Early Bird',
            level: 1,
            completed: false,
        },
        {
            name: 'Consistent Schedule',
            level: 1,
            completed: false,
        },
        {
            name: 'No Snooze Master',
            level: 1,
            completed: false,
        },
        {
            name: 'Sleep Champion',
            level: 1,
            completed: false,
        }
    ]},
    xp: {type: Number, default: 0},
    avatar: String,
    socialId: String,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
