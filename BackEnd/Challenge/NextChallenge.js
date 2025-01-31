const User = require('../User/User');

const NextChallenge = async (req, res) => {
    const {index, challenge, level, userId} = req.body;
    const user = await User.findById(userId);
    if(!user) {
        res.status(404).send({message: 'User not found'});
    }

    let xp = 0;
    if(user.challenge[index].level === 1) {
        xp = 25;
    } else if(user.challenge[index].level === 2) {
        xp = 50;
    } else if(user.challenge[index].level === 3) {
        xp = 100;
    } else if(user.challenge[index].level === 4) {
        xp = 150;
    } else if(user.challenge[index].level === 5) {
        xp = 200;
    } else if(user.challenge[index].level === 6) {
        xp = 250;
    }

    user.xp = user.xp + xp;
    user.markModified('xp');

    user.challenge[index].level = user.challenge[index].level + 1;
    user.challenge[index].completed = false;
    user.markModified('challenge');
    await user.save();
    res.send(user);
}

module.exports = NextChallenge;

