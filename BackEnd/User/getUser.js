const User = require('../User/User');

const GetUser = async (req, res) => {
    const {id} = req.body;
    try {
        const user = await User.findOne({ _id: id });
        if (user) {
            console.log(user)
            res.json(user);
        } else {
            res.json('User not found');
        }
} catch (error) {
        console.error('Error occurred:', error); // More detailed error logging
        res.status(400).json({ message: error.message });
    }
}

module.exports = GetUser;