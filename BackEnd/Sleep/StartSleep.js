const User = require('../User/User');

const StartSleep = async (req, res) => {
    const {userId, sleepStartTime, sleepId} = req.body;

const sleepObj = {
    _id: sleepId,
    sleepStartTime: sleepStartTime,
    sleepEndTime: null,
}

    const user = await User.findById(userId);
    user.sleep.push(sleepObj);
    user.markModified('sleep');
    await user.save();
    res.send(user);
}

module.exports = StartSleep;
