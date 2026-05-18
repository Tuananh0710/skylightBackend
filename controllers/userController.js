const { Friend, User, FriendRequest } = require("../models/Index.js");
const { Op } = require("sequelize");

// Xem trang cá nhân của mình hoặc của người khác
exports.getUserInfo = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const targetUserId = req.params.id
      ? parseInt(req.params.id)
      : currentUserId;

    // 1. Phân loại xem đang tự xem mình hay xem người khác
    const isOwnProfile = currentUserId === targetUserId;

    // 2. Định nghĩa các trường dữ liệu cần lấy để bảo mật
    const queryAttributes = isOwnProfile
      ? ["id", "username", "email", "birthday", "avatar", "bio", "created_at"]
      : ["id", "username", "birthday", "avatar", "bio", "created_at"];

    // 3. Lấy thông tin User
    const user = await User.findByPk(targetUserId, {
      attributes: queryAttributes,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 4. Kiểm tra trạng thái kết bạn (Nếu đang xem trang người khác)
    let relationStatus = "none";

    if (!isOwnProfile) {
      const [minId, maxId] =
        currentUserId < targetUserId
          ? [currentUserId, targetUserId]
          : [targetUserId, currentUserId];

      // Kiểm tra trong bảng Friend
      const isFriend = await Friend.findOne({
        where: { user_id: minId, friend_id: maxId },
      });

      if (isFriend) {
        relationStatus = "friend";
      } else {
        // Nếu chưa là bạn, kiểm tra xem có lời mời nào đang treo không
        const request = await FriendRequest.findOne({
          where: {
            [Op.or]: [
              { sender_id: currentUserId, receiver_id: targetUserId },
              { sender_id: targetUserId, receiver_id: currentUserId },
            ],
          },
        });

        if (request) {
          relationStatus =
            request.sender_id === currentUserId
              ? "pending_sent" // Mình đã gửi cho họ
              : "pending_received"; // Họ gửi cho mình
        }
      }
    }

    // 5. Trả về kết quả
    return res.status(200).json({
      message: "User info retrieved successfully",
      data: {
        user,
        isOwnProfile, // true/false để Front-end biết có hiện nút "Chỉnh sửa trang cá nhân" không
        relationStatus, // Trạng thái mối quan hệ để vẽ nút "Chấp nhận", "Hủy lời mời"
      },
    });
  } catch (error) {
    console.error("Error getting user info:", error);
    res.status(500).json({
      error: "An error occurred while getting user info.",
      message: error.message,
    });
  }
};

// Cập nhật thông tin cá nhân
exports.updateUserInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, birthday, avatar, bio } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.update({
      username,
      email,
      birthday,
      avatar,
      bio,
    });

    return res.status(200).json({
      message: "User info updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating user info:", error);
    return res.status(500).json({
      error: "An error occurred while updating user info.",
      message: error.message,
    });
  }
};

// Lấy sinh nhật của bạn bè
exports.getFriendsBirthdays = async (req, res) => {
  try {
    const userId = req.user.id;

    const friends = await Friend.findAll({
      where: {
        [Op.or]: [{ user_id: userId }, { friend_id: userId }],
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "birthday", "avatar"],
        },
        {
          model: User,
          as: "friend",
          attributes: ["id", "username", "birthday", "avatar"],
        },
      ],
    });

    // Xử lý map data: Vì người bạn có thể nằm ở cột 'user' hoặc 'friend'
    const birthdays = friends.map((f) => {
      const friendData = f.user_id === userId ? f.friend : f.user;
      return {
        id: friendData.id,
        username: friendData.username,
        birthday: friendData.birthday,
        avatar: friendData.avatar,
      };
    });

    res.status(200).json({
      message: "Friends' birthdays retrieved successfully",
      birthdays_friends: birthdays,
    });
  } catch (error) {
    console.error("Error getting friends' birthdays:", error);
    return res.status(500).json({
      error: "An error occurred while getting friends' birthdays.",
      message: error.message,
    });
  }
};

// Tìm kiếm người dùng
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user.id;

    if (!query) {
      return res.status(400).json({ message: "Query parameter is not null" });
    }

    const users = await User.findAll({
      where: {
        [Op.or]: [{ username: { [Op.like]: `%${query}%` } }],
        id: { [Op.ne]: currentUserId },
      },
      attributes: ["id", "username", "email", "avatar"],
      include: [
        {
          model: Friend,
          as: "friendsAsUser",
          where: { friend_id: currentUserId },
          required: false,
        },
        {
          model: Friend,
          as: "friendsAsFriend",
          where: { user_id: currentUserId },
          required: false,
        },
      ],
    });

    // giúp front_end hiển thị đã là bạn chưa
    const formattedUsers = users.map((user) => {
      const isFriend =
        user.friendsAsUser.length > 0 || user.friendsAsFriend.length > 0;

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isFriend: isFriend, // Trả về true/false cực kỳ tiện cho Front-end hiển thị nút "Kết bạn" hoặc "Nhắn tin"
      };
    });

    return res.status(200).json({
      message: "Users searched successfully",
      users: formattedUsers,
    });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({
      error: "An error occurred while searching users.",
      message: error.message,
    });
  }
};
