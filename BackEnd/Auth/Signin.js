const User = require('../User/User');

const Signin = async (req, res) => {
    const {email, password} = req.body;
    console.log(email, password);
    const user = await User.findOne({email});
    if (!user) {
        return res.status(401).json({message: 'Invalid email or password'});
    }
    if (user.password !== password) {
        return res.status(401).json({message: 'Invalid email or password'});
    }
    res.status(200).json(user);
}

module.exports = Signin;
