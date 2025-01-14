const User = require('../User/User');

const EndSleep = async (req, res) => {
    const {userId, sleepEndTime} = req.body;
    const user = await User.findById(userId);
    const currentSleep = user.sleep.find(sleep => sleep.sleepEndTime === null);
    if (currentSleep) {
        currentSleep.sleepEndTime = sleepEndTime;
        user.markModified('sleep');
        await user.save();
    }
    res.send(user);
}

module.exports = EndSleep;

