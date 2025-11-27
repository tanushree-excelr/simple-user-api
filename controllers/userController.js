const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signupUser = async (req, res) => {
  try {
    const { name, emailId, username, password, birthdate, hobby, role } = req.body;

    if (!name || !emailId || !username || !password || !birthdate)
      return res.status(400).json({ message: "Missing fields" });

    const existsEmail = await User.findOne({ emailId });
    const existsUser = await User.findOne({ username });

    if (existsEmail || existsUser)
      return res.status(400).json({ message: "Email or username exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      emailId,
      username,
      password: hashedPassword,
      birthdate,
      hobby: hobby || [],
      role: role === "admin" ? "admin" : "guest"
    });

    res.status(201).json({ message: "User created", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();

    const users = await User.aggregate([
      { $unwind: "$hobby" },
      {
        $group: {
          _id: "$hobby",
          total_users: { $sum: 1 },
          unique_ages: { $addToSet: "$birthdate" }
        }
      },
      { $project: { _id: 0, hobby: "$_id", total_users: 1, unique_ages: 1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    res.json({ totalPages, totalUsers, limit, page, users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { signupUser, loginUser, getUsers, deleteUser };
