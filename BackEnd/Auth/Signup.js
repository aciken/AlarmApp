const User = require('../User/User');

const Signup = async (req, res) => {
    const {name, email, password} = req.body;
    
    // Check if user with email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user if email is unique
    const user = await User.create({name, email, password});
    res.status(201).json(user);
}

module.exports = Signup;

