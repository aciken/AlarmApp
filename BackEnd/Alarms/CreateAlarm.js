const User = require('../User/User');
const mongoose = require('mongoose');

const CreateAlarm = async (req, res) => {
    const {time, days, userId, _id} = req.body;

    const alarm = {
        _id,
        time,
        days,
        enabled: false
    }

    const user = await User.findById(userId);
    if(!user){
        return res.status(404).json({message: 'User not found'});
    }

    user.alarms.push(alarm);
    await user.save();
    res.status(200).json(user);
}

module.exports = CreateAlarm;
