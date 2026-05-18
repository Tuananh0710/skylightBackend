const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware.js");
const {
  getUserInfo,
  updateUserInfo,
  getFriendsBirthdays,
  searchUsers,
} = require("../controllers/userController.js");

router.get("/profile", authMiddleware, getUserInfo);
router.get("/profile/:id", authMiddleware, getUserInfo);

router.put("/profile", authMiddleware, updateUserInfo);
router.get("/friends/birthdays", authMiddleware, getFriendsBirthdays);
router.get("/search", authMiddleware, searchUsers);

module.exports = router;
