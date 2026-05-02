const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json());

// --- Routes ---
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks',    require('./routes/taskRoutes'));
app.use('/api/dashboard',require('./routes/dashboardRoutes'));

const path = require("path");

// Serve frontend
app.use(express.static(path.join(__dirname, "dist")));

// React routing support
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Team Task Manager API is running ✅' });
});

// Central error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
