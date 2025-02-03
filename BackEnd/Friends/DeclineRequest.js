const User = require('../User/User');

const DeclineRequest = async (req, res) => {
    const {userId, friendId} = req.body;
    
    try {
        // Update user document directly in database
        const user = await User.findOneAndUpdate(
            { _id: userId },
            { $pull: { 'friends.requests': friendId } },
            { new: true }
        );

        // Update friend document directly in database 
        await User.findOneAndUpdate(
            { _id: friendId },
            { $pull: { 'friends.pending': userId } }
        );

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to decline friend request' });
    }
}

module.exports = DeclineRequest;
