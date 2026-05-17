const { Op } = require("sequelize");
const { FriendRequest, Friend, User } = require("../models/Index.js");
const { request } = require("../app.js");

//Gửi lời mời kết bạn
exports.sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    if (senderId == receiverId) {
      return res
        .status(400)
        .json({ message: "You cannot add yourself as a friend." });
    }

    const [minId, maxId] =
      senderId < receiverId ? [senderId, receiverId] : [receiverId, senderId];
    const existingFriend = await Friend.findOne({
      where: {
        user_id: minId,
        friend_id: maxId,
      },
    });
    if (existingFriend) {
      return res.status(400).json({ message: "You are already friends." });
    }

    const existingRequest = await FriendRequest.findOne({
      where: {
        [Op.or]: [
          { sender_id: senderId, receiver_id: receiverId },
          { sender_id: receiverId, receiver_id: senderId },
        ],
      },
    });
    if (existingRequest) {
      if (existingRequest.sender_id === senderId) {
        return res
          .status(400)
          .json({ message: "Friend request already sent." });
      } else {
        return res.status(400).json({
          message:
            "Bạn đã nhận được lời mời kết bạn từ người này. Vui lòng chấp nhận hoặc từ chối lời mời trước khi gửi lại.",
          sender_id: existingRequest.sender_id,
          receiver_id: existingRequest.receiver_id,
          status: "pending",
          created_at: existingRequest.created_at,
        });
      }
    }

    // Tạo lời mời kết bạn
    const friendRequest = await FriendRequest.create({
      sender_id: senderId,
      receiver_id: receiverId,
    });

    return res.status(201).json({
      message: "Friend request sent.",
      data: {
        request_id: friendRequest.id,
        sender_id: senderId,
        receiver_id: receiverId,
        status: "pending",
        created_at: new Date(),
      },
    });
  } catch (error) {
    console.error("Error adding friend:", error);
    return res.status(500).json({
      error: "An error occurred while adding friend.",
      message: error.message,
    });
  }
};

// Chấp nhận lời mời kết bạn
exports.acceptFriendRequest = async (req, res) => {
  try {
    const receiverId = req.user.id;
    const { requestId } = req.params;

    const friendRequest = await FriendRequest.findOne({
      where: {
        id: requestId,
        receiver_id: receiverId,
      },
    });
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found." });
    }

    // Xóa lời mời kết bạn
    await friendRequest.destroy();

    const [minId, maxId] =
      friendRequest.sender_id < friendRequest.receiver_id
        ? [friendRequest.sender_id, friendRequest.receiver_id]
        : [friendRequest.receiver_id, friendRequest.sender_id];

    // Tạo mối quan hệ bạn bè
    await Friend.create({
      user_id: minId,
      friend_id: maxId,
    });

    return res.status(200).json({
      message: "Friend request accepted.",
      data: {
        user_id: minId,
        friend_id: maxId,
        status: "accepted",
      },
    });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return res.status(500).json({
      error: "An error occurred while accepting friend request.",
      message: error.message,
    });
  }
};

// Từ chối lời mời kết bạn
exports.rejectFriendRequest = async (req, res) => {
  try {
    const receiverId = req.user.id;
    const { requestId } = req.params;

    const friendRequest = await FriendRequest.findOne({
      where: {
        id: requestId,
        receiver_id: receiverId,
      },
    });

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found." });
    }

    // Xóa lời mời kết bạn
    await friendRequest.destroy();

    return res.status(200).json({
      message: "Friend request rejected.",
      data: {
        sender_id: friendRequest.sender_id,
        receiver_id: friendRequest.receiver_id,
        status: "rejected",
        rejected_at: new Date(),
      },
    });
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    return res.status(500).json({
      error: "An error occurred while rejecting friend request.",
      message: error.message,
    });
  }
};

// Hủy kết bạn
exports.removeFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    const [minId, maxId] =
      userId < friendId ? [userId, friendId] : [friendId, userId];
    const existingFriend = await Friend.findOne({
      where: {
        user_id: minId,
        friend_id: maxId,
      },
    });
    if (!existingFriend) {
      return res
        .status(404)
        .json({ message: "Friend relationship not found." });
    }
    await existingFriend.destroy();

    return res.status(200).json({
      message: "Friend removed.",
      data: {
        user_id: userId,
        friend_id: friendId,
      },
    });
  } catch (error) {
    console.error("Error removing friend:", error);
    res.status(500).json({
      error: "An error occurred while removing friend.",
      message: error.message,
    });
  }
};

// Lấy danh sách bạn bè
exports.getFriendsList = async (req, res) => {
  try {
    const userId = req.user.id;

    const friends = await Friend.findAll({
      where: {
        user_id: userId,
      },
      include: [
        {
          model: User,
          as: "friend",
          attributes: ["id", "username", "email", "avatar"],
        },
      ],
    });
    res.status(200).json({
      message: "Friends list retrieved.",
      data: friends,
    });
  } catch (error) {
    console.error("Error getting friends list:", error);
    res.status(500).json({
      error: "An error occurred while getting friends list.",
      message: error.message,
    });
  }
};

// Lấy danh sách lời mời kết bạn đến
exports.getFriendRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const friendRequests = await FriendRequest.findAll({
      where: {
        receiver_id: userId,
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username", "avatar"],
        },
      ],
    });

    if (friendRequests.length === 0) {
      return res.status(200).json({
        message: "No friend requests found.",
        data: [],
      });
    }

    res.status(200).json({
      message: "List friend requests retrieved.",
      data: friendRequests,
    });
  } catch (error) {
    console.error("Error getting friend requests:", error);
    res.status(500).json({
      error: "An error occurred while getting friend requests list.",
      message: error.message,
    });
  }
};

// Lấy danh sách lời mời kết bạn đã gửi đi
exports.getSentFriendRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const sentFriendRequests = await FriendRequest.findAll({
      where: {
        sender_id: userId,
      },
      include: [
        {
          model: User,
          as: "receiver",
          attributes: ["id", "username", "avatar"],
        },
      ],
    });

    if (sentFriendRequests.length === 0) {
      return res.status(200).json({
        message: "No sent friend requests found.",
        data: [],
      });
    }

    res.status(200).json({
      message: "List sent friend requests retrieved.",
      data: sentFriendRequests,
    });
  } catch (error) {
    console.error("Error getting sent friend requests:", error);
    res.status(500).json({
      error: "An error occurred while getting sent friend requests.",
      message: error.message,
    });
  }
};

//Hủy lời mời kết bạn đã gửi đi
exports.cancelSentFriendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { requestId } = req.params;

    const friendRequest = await FriendRequest.findOne({
      where: {
        id: requestId,
        sender_id: senderId,
      },
    });
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found." });
    }

    await friendRequest.destroy();

    return res.status(200).json({
      message: "Sent friend request canceled.",
      data: {
        sender_id: senderId,
        receiver_id: friendRequest.receiver_id,
        status: "canceled",
        send_at: friendRequest.created_at,
      },
    });
  } catch (error) {
    console.error("Error canceling sent friend request:", error);
    return res.status(500).json({
      error: "An error occurred while canceling sent friend request.",
      message: error.message,
    });
  }
};

// Xem chi tiết trang cá nhân của bạn bè
exports.getFriendProfile = async (req, res) => {
  try {
  } catch (error) {
    console.error("Error getting friend profile:", error);
    return res.status(500).json({
      error: "An error occurred while getting friend profile.",
      message: error.message,
    });
  }
};
