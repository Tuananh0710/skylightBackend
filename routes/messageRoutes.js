const express = require("express");
const route = express.Router();
const { sendDirectMessage } = require("../controllers/messageController.js");

route.post("/");
