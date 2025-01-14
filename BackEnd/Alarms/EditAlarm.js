const User = require('../User/User');

const EditAlarm = async (req, res) => {
    const {time, days, userId, alarmId} = req.body;

    const user = await User.findById(userId);
    if(!user){
        return res.status(404).json({message: 'User not found'});
    }

    const alarm = user.alarms.find(a => a._id.toString() === alarmId.toString());
    alarm.time = time;
    alarm.days = days;
    user.markModified('alarms');
    await user.save();
    res.status(200).json(user);
}

module.exports = EditAlarm;
