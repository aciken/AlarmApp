const User = require('../User/User');

const ToggleAlarm = async (req, res) => {
    const { alarmId, enabled, userId } = req.body;



    const user = await User.findById(userId);
    if(!user){
        return res.status(404).json({message: 'User not found'});
    }



    const alarm = user.alarms.find(a => a._id.toString() === alarmId.toString());
    if(!alarm){
        console.log('Alarm not found');
        return res.status(404).json({message: 'Alarm not found'});
    }

    alarm.enabled = enabled;
    console.log(alarm)
    user.markModified('alarms');
    await user.save();
    res.status(200).json(user);
}

module.exports = ToggleAlarm;