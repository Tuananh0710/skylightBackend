const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//import routes
const authRoutes = require("./routes/authRoutes");

// Routes
app.use("/api/auth", authRoutes);

// Test Route
app.get("/api/status", (req, res) => {
  res.json({
    status: "success",
    message: "Backend Social Network API is running",
    timestamp: new Date(),
  });
});

module.exports = app;
