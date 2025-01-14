const User = require('../User/User');

const DeleteAlarm = async (req, res) => {
    const {id, selectedAlarm} = req.body;
    const user = await User.findById(id);
    console.log('Before deletion:', user.alarms);
    console.log('Trying to delete alarm with ID:', selectedAlarm._id);
    
    // Convert ObjectId to string for comparison
    user.alarms = user.alarms.filter(alarm => alarm._id.toString() !== selectedAlarm._id.toString());
    
    console.log('After deletion:', user.alarms);
    await user.save();
    res.status(200).json(user);
}

module.exports = DeleteAlarm;
