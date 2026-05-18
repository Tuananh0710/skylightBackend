const express = require("express");
const route = express.Router();
const {
  createConversation,
  getConversations,
  getMessage,
  addMember,
  removeMember,
  leaveConversation,
  getMembers,
} = require("../controllers/conversationController.js");

// const authMiddleware = require("../middlewares/authMiddleware.js");

// route.use(authMiddleware); // Áp dụng middleware xác thực cho tất cả các route trong file này

// route.post("/", createConversation);
// route.get("/", getConversations);
// route.get("/:conversationId/message", getMessage);
// route.post("/:conversationId/members", addMember);
// route.delete("/:conversationId/members/:userId", removeMember);
// route.post("/:conversationId/leave", leaveConversation);
// route.get("/:conversationId/members", getMembers);
