const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  birthdate: { type: Date },
  username: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ["guest", "admin", "support"], default: "guest" },
  hobby: [{ type: String }],
});

// ✅ Prevent OverwriteModelError during tests
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
