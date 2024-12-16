const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const professorRoutes = require('./routes/professor');
const studentRoutes = require('./routes/student');

const app = express();

// Connect to MongoDB only if not in test environment
if (process.env.NODE_ENV !== 'test') {
    connectDB(process.env.MONGODB_URI);
}

// Middleware
app.use(cors());
app.use(express.json()); // For Parse  JSON request bodies

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/professor', professorRoutes);
app.use('/api/student', studentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app; 