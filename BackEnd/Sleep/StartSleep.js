const User = require('../User/User');

const StartSleep = async (req, res) => {
    const {userId, sleepStartTime, sleepId} = req.body;

    

const sleepObj = {
    _id: sleepId,
    sleepStartTime: sleepStartTime,
    sleepEndTime: null,
}

    console.log(sleepObj);

    const user = await User.findById(userId);
    user.sleep.push(sleepObj);
    user.markModified('sleep');

    console.log(user.sleep);
    await user.save();
    res.send(user);
}

module.exports = StartSleep;
