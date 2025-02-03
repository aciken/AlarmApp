const User = require('../User/User');

const AddFriend = async (req, res) => {
    const {userId, friendId} = req.body;
    
    try {
        // Update user's pending list
        const userUpdate = await User.findOneAndUpdate(
            { _id: userId },
            { $push: { 'friends.pending': friendId }},
            { new: true }
        );

        // Update friend's requests list
        const friendUpdate = await User.findOneAndUpdate(
            { _id: friendId },
            { $push: { 'friends.requests': userId }},
            { new: true }
        );

        if (!userUpdate || !friendUpdate) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(userUpdate);

    } catch (error) {
        console.error("Error adding friend:", error);
        res.status(500).json({ error: "Failed to add friend" });
    }
}

module.exports = AddFriend;
