require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Connect DB and start server only if not running tests
if (process.env.NODE_ENV !== 'test') {
  connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = { app, connectDB };
