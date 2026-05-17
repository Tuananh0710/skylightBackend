const express = require("express");
const router = express.Router();

const {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriendsList,
  getFriendRequests,
  getSentFriendRequests,
  cancelSentFriendRequest,
  getFriendProfile,
} = require("../controllers/friendController.js");
const authMiddleware = require("../middlewares/authMiddleware.js");

router.post("/send", authMiddleware, sendFriendRequest);
router.post("/accept", authMiddleware, acceptFriendRequest);
router.post("/reject", authMiddleware, rejectFriendRequest);
router.post("/remove", authMiddleware, removeFriend);
router.get("/list", authMiddleware, getFriendsList);
router.get("/requests", authMiddleware, getFriendRequests);
router.get("/sent-requests", authMiddleware, getSentFriendRequests);
router.post("/cancel-request", authMiddleware, cancelSentFriendRequest);

// để lại đến khi đã hoàn thành xong chức năng post.
router.get("/profile/:friendId", authMiddleware, getFriendProfile);

module.exports = router;
