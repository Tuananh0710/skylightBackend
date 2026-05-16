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
const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const conversationRoutes = require("./routes/conversationRoute.js");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
// app.use("/api/conversations", conversationRoutes);

// Test Route
app.get("/api/status", (req, res) => {
  res.json({
    status: "success",
    message: "Backend Social Network API is running",
    timestamp: new Date(),
  });
});

module.exports = app;
