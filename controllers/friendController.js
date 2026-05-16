const FriendRequest = require("../models/FriendRequest.js");
const Friend = require("../models/Friend.js");
const User = require("../models/User.js");

// Thêm bạn - Gửi lời mời kết bạn
export const addFriend = async (req, res) => {
  try {
  } catch (error) {
    console.error("Error adding friend:", error);
    res.status(500).json({
      error: "An error occurred while adding friend.",
      message: error.message,
    });
  }
};

// Chấp nhận lời mời kết bạn
export const acceptFriendRequest = async (req, res) => {
  try {
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({
      error: "An error occurred while accepting friend request.",
      message: error.message,
    });
  }
};

// Từ chối lời mời kết bạn
export const rejectFriendRequest = async (req, res) => {
  try {
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    res.status(500).json({
      error: "An error occurred while rejecting friend request.",
      message: error.message,
    });
  }
};

// Hủy kết bạn
export const removeFriend = async (req, res) => {
  try {
  } catch (error) {
    console.error("Error removing friend:", error);
    res.status(500).json({
      error: "An error occurred while removing friend.",
      message: error.message,
    });
  }
};

// Lấy danh sách bạn bè
export const getFriendsList = async (req, res) => {
  try {
  } catch (error) {
    console.error("Error getting friends list:", error);
    res.status(500).json({
      error: "An error occurred while getting friends list.",
      message: error.message,
    });
  }
};

// Lấy danh sách lời mời kết bạn đến
export const getFriendRequests = async (req, res) => {
  try {
  } catch (error) {
    console.error("Error getting friend requests:", error);
    res.status(500).json({
      error: "An error occurred while getting friend requests.",
      message: error.message,
    });
  }
};

// Lấy danh sách lời mời kết bạn đã gửi
export const getSentFriendRequests = async (req, res) => {
  try {
  } catch (error) {
    console.error("Error getting sent friend requests:", error);
    res.status(500).json({
      error: "An error occurred while getting sent friend requests.",
      message: error.message,
    });
  }
};
