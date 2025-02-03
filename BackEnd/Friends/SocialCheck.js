const User = require('../User/User');

const SocialCheck = async (req, res) => {
    const {socialId, userId} = req.body;
    const user = await User.findOne({socialId});
    if(!user){
        res.send({error: "User not found"});
    }
    if(user._id !== userId){
        res.json(user);
    }
}

module.exports = SocialCheck;

