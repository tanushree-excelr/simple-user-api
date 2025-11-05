const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  emailId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  birthdate: { type: Date, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['guest', 'admin', 'support'], default: 'guest' },
  hobby: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
