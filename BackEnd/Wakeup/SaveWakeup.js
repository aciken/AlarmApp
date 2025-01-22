const User = require('../User/User');

const SaveWakeup = async (req, res) => {
    const {time, vibration, gradualVolume, wakeUpChallange, alarmSound, userId} = req.body;

    const user = await User.findById(userId);
    if(!user){
        return res.status(404).json({message: 'User not found'});
    }

    user.wakeup = {
        time,
        vibration,
        gradualVolume,
        wakeUpChallange,
        alarmSound
    }

    await user.save();
    res.status(200).json(user);
}

module.exports = SaveWakeup;
