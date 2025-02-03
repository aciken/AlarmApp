const User = require('../User/User');

const AcceptRequest = async (req, res) => {
    const {userId, friendId} = req.body;
    console.log(userId, friendId);
    try {
        // Update user document
        const userUpdate = await User.findOneAndUpdate(
            { _id: userId },
            { 
                $pull: { 'friends.requests': friendId },
                $push: { 'friends.list': friendId }
            },
            { new: true }
        );

        // Update friend document
        const friendUpdate = await User.findOneAndUpdate(
            { _id: friendId },
            {
                $pull: { 'friends.pending': userId },
                $push: { 'friends.list': userId }
            },
            { new: true }
        );

        if (!userUpdate || !friendUpdate) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(userUpdate);

    } catch (error) {
        console.error("Error accepting friend request:", error);
        res.status(500).json({ error: "Failed to accept friend request" });
    }
}

module.exports = AcceptRequest;
