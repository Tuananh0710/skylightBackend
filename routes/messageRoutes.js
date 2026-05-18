const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware.js");
const {
  sendDirectMessage,
  sendGroupMessage,
  getChatHistory,
  editMessage,
  deleteMessage,
} = require("../controllers/messageController.js");

router.post("/direct", authMiddleware, sendDirectMessage);
router.post("/group", authMiddleware, sendGroupMessage);
router.get("/history/:conversationId", authMiddleware, getChatHistory);
router.put("/edit/:messageId", authMiddleware, editMessage);
router.delete("/delete/:messageId", authMiddleware, deleteMessage);

module.exports = router;
