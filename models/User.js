const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  emailId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  birthdate: { type: Date, required: true },
  role: { type: String, enum: ["guest", "admin"], default: "guest" },
  hobby: { type: [String], default: [] }
});

module.exports = mongoose.model("User", userSchema);
