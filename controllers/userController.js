const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.signup = async (req, res) => {
  try {
    const { name, emailId, username, password, birthdate, hobby } = req.body;
    if (!name || !emailId || !username || !password || !birthdate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await User.findOne({ $or: [{ emailId }, { username }] });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      emailId,
      username,
      password: hashed,
      birthdate,
      hobby: Array.isArray(hobby) ? hobby : (hobby ? [hobby] : []),
      role: 'guest'
    });

    res.status(201).json({ message: 'User registered successfully', user: {
      id: user._id,
      name: user.name,
      emailId: user.emailId,
      username: user.username,
      birthdate: user.birthdate,
      role: user.role,
      hobby: user.hobby
    }});
  } catch (error) {
    res.status(500).json({ message: 'Error during signup', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { emailId, username, password } = req.body;
    if (!password || (!emailId && !username)) {
      return res.status(400).json({ message: 'Provide username or emailId and password' });
    }

    const user = await User.findOne({ $or: [{ emailId }, { username }] });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    const hobbyData = {};

    users.forEach(u => {
      const age = new Date().getFullYear() - new Date(u.birthdate).getFullYear();
      (u.hobby || []).forEach(h => {
        if (!hobbyData[h]) hobbyData[h] = { total_users: 0, unique_ages: new Set() };
        hobbyData[h].total_users += 1;
        hobbyData[h].unique_ages.add(age);
      });
    });

    const result = Object.keys(hobbyData).map(h => ({
      hobby: h,
      total_users: hobbyData[h].total_users,
      unique_ages: Array.from(hobbyData[h].unique_ages)
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const body = { ...req.body };
    // if password present, hash it
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }
    const updated = await User.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};
