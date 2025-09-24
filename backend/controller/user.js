const User = require('../model/user');

const getUsernames = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, payload: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

const postUsername = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, payload: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

module.exports = { getUsernames, postUsername };
