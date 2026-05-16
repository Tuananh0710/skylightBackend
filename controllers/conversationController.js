const {
  Conversation,
  User,
  Conversation_members,
} = require("../models/Index.js");

// Tạo cuộc trò chuyện mới
exports.createConversation = async (req, res) => {
  try {
    const { is_group, member_ids } = req.body;
    const currentUserId = req.user.id;

    // 1. Tạo conversation
    const newConversation = await Conversation.create({
      is_group: is_group || false,
    });

    // 2. Chuẩn bị danh sách thành viên
    const membersData = [
      {
        conversation_id: newConversation.id,
        user_id: currentUserId,
        role: is_group ? "admin" : "member",
      },
    ];

    if (member_ids && Array.isArray(member_ids)) {
      member_ids.forEach((id) => {
        if (id !== currentUserId) {
          membersData.push({
            conversation_id: newConversation.id,
            user_id: id,
            role: "member",
          });
        }
      });
    }

    // 3. Insert danh sách thành viên vào bảng trung gian
    await Conversation_members.bulkCreate(membersData);

    return res.status(201).json({
      message: "Tạo cuộc trò chuyện thành công",
      conversation: newConversation,
      members: membersData,
    });
  } catch (error) {
    console.error("Error createConversation:", error);
    return res.status(500).json({
      error: "Error createConversation:",
      details: error.message,
    });
  }
};

// Lấy danh sách cuộc trò chuyện của người dùng
exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Tìm tất cả ID các cuộc trò chuyện mà user đang tham gia
    const userMemberships = await Conversation_members.findAll({
      where: { user_id: currentUserId },
      attributes: ["conversation_id"],
    });

    const conversationIds = userMemberships.map((m) => m.conversation_id);

    // Lấy chi tiết các cuộc trò chuyện kèm danh sách các member trong đó
    const conversations = await Conversation.findAll({
      where: {
        id: conversationIds,
      },
      include: [
        {
          model: User,
          as: "members", // Alias định nghĩa trong file Index.js
          attributes: ["id", "username", "avatar"],
          through: {
            attributes: ["role", "joined_at"], // Lấy thêm thông tin từ bảng trung gian
          },
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      message: "Lấy danh sách cuộc trò chuyện thành công",
      conversations,
    });
  } catch (error) {
    console.error("Error getConversations:", error);
    return res.status(500).json({
      error: "Error getConversations:",
      details: error.message,
    });
  }
};

// Lấy tin nhắn trong cuộc trò chuyện
exports.getMessage = async (req, res) => {
  try {
    const { conversation_id } = req.params;

    // LƯU Ý: Do bạn chưa cung cấp Message Model, đây sẽ là hàm giả lập.
    // Khi có Message Model, logic sẽ tương tự như sau:
    // const messages = await Message.findAll({ where: { conversation_id } });

    return res.status(501).json({
      message: "Chưa thể lấy tin nhắn vì chưa định nghĩa model Message",
      conversation_id,
    });
  } catch (error) {
    console.error("Error getMessage:", error);
    return res.status(500).json({
      error: "Error getMessage:",
      details: error.message,
    });
  }
};

// Thêm thành viên vào cuộc trò chuyện
exports.addMember = async (req, res) => {
  try {
    const { conversation_id } = req.params;
    const { user_id } = req.body;
    const currentUserId = req.user.id;

    // Kiểm tra quyền của người thêm (chỉ admin mới được thêm thành viên)
    const currentUserRole = await Conversation_members.findOne({
      where: { conversation_id, user_id: currentUserId },
    });

    if (!currentUserRole || currentUserRole.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền thêm thành viên" });
    }

    const conversation = await Conversation.findByPk(conversation_id);
    if (!conversation) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy cuộc trò chuyện" });
    }
    // Kiểm tra xem user_id có tồn tại không

    const existingMember = await Conversation_members.findOne({
      where: { conversation_id, user_id },
    });

    if (existingMember) {
      return res
        .status(400)
        .json({ message: "Người dùng đã ở trong cuộc trò chuyện" });
    }

    // Thêm mới
    const newMember = await Conversation_members.create({
      conversation_id,
      user_id,
      role: "member",
    });

    return res.status(200).json({
      message: "Thêm thành viên thành công",
      data: newMember,
    });
  } catch (error) {
    console.error("Error addMember:", error);
    return res.status(500).json({
      error: "Error addMember:",
      details: error.message,
    });
  }
};

// Xóa thành viên khỏi cuộc trò chuyện
exports.removeMember = async (req, res) => {
  try {
    const { conversation_id, user_id } = req.params;
    const currentUserId = req.user.id;

    const currentUserRole = await Conversation_members.findOne({
      where: { conversation_id, user_id: currentUserId },
    });

    if (!currentUserRole || currentUserRole.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xoá thành viên" });
    }

    const deletedCount = await Conversation_members.destroy({
      where: {
        conversation_id,
        user_id,
      },
    });

    if (deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Thành viên không tồn tại trong cuộc trò chuyện" });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa thành viên thành công",
    });
  } catch (error) {
    console.error("Error removeMember:", error);
    return res.status(500).json({
      error: "Error removeMember:",
      details: error.message,
    });
  }
};

// Rời khỏi cuộc trò chuyện
exports.leaveConversation = async (req, res) => {
  try {
    const { conversation_id } = req.params;
    const currentUserId = req.user.id;

    const deletedCount = await Conversation_members.destroy({
      where: {
        conversation_id,
        user_id: currentUserId,
      },
    });

    if (deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Bạn không thuộc cuộc trò chuyện này" });
    }

    return res.status(200).json({
      success: true,
      message: "Rời cuộc trò chuyện thành công",
    });
  } catch (error) {
    console.error("Error leaveConversation:", error);
    return res.status(500).json({
      error: "Error leaveConversation:",
      details: error.message,
    });
  }
};

// xem member trong cuộc trò chuyện
exports.getMembers = async (req, res) => {
  try {
    const { conversation_id } = req.params;

    const conversation = await Conversation.findByPk(conversation_id, {
      include: [
        {
          model: User,
          as: "members",
          attributes: ["id", "username", "avatar"],
          through: {
            attributes: ["role", "joined_at"],
          },
        },
      ],
    });

    if (!conversation) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy cuộc trò chuyện" });
    }

    return res.status(200).json({
      message: "Lấy danh sách thành viên thành công",
      conversation_id: conversation.id,
      is_group: conversation.is_group,
      members: conversation.members,
    });
  } catch (error) {
    console.error("Error getMembers:", error);
    return res.status(500).json({
      error: "Error getMembers:",
      details: error.message,
    });
  }
};
