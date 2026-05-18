const Conversation = require("../models/Conversation.js");
const Conversation_members = require("../models/ConversationMember.js");
const Message = require("../models/Message.js");
const { Sequelize } = require("sequelize");
const { sequelize } = require("../configs/database.js");
const { Op } = Sequelize;

// gửi tin nhắn đến một người dùng khác (direct message)
exports.sendDirectMessage = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { content, receiverId, conversationId } = req.body;
    const senderId = req.user?.id;

    let conversation;
    if (!content) {
      return res.status(404).json({
        message: "Please enter content message",
      });
    }
    if (conversationId) {
      conversation = await Conversation.findByPk(conversationId);
    }
    if (!conversation) {
      conversation = await Conversation.create(
        { is_group: false },
        { transaction },
      );

      await Conversation_members.bulkCreate(
        [
          {
            conversation_id: conversation.id,
            user_id: senderId,
            role: "member",
          },
          {
            conversation_id: conversation.id,
            user_id: receiverId,
            role: "member",
          },
        ],
        { transaction },
      );
    }

    await transaction.commit();

    const message = await Message.create({
      conversation_id: conversation.id,
      sender_id: senderId,
      content,
    });

    await message.save();

    return res.status(200).json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (err) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }

    console.log("Error when sending direct message:", err);
    return res.status(500).json({
      Error: "Error when sending direct message",
      message: err.message,
    });
  }
};

// gửi tin nhắn đến một nhóm (group message)
exports.sendGroupMessage = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { content, conversationId, memberIds } = req.body;
    const senderId = req.user?.id;

    if (!content) {
      return res.status(404).json({
        message: "Please enter content message",
      });
    }

    let conversation;

    if (conversationId) {
      conversation = await Conversation.findByPk(conversationId);

      if (!conversation) {
        return res.status(404).json({
          message: "Conversation not found",
        });
      }
    } else {
      if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
        return res.status(400).json({
          message: "Please provide memberIds for group conversation",
        });
      }
      conversation = await Conversation.create(
        { is_group: true },
        { transaction },
      );
      const memberData = [
        {
          conversation_id: conversation.id,
          user_id: senderId,
          role: "admin",
        },
      ];
      memberIds.forEach((memberId) => {
        if (memberId !== senderId) {
          memberData.push({
            conversation_id: conversation.id,
            user_id: memberId,
            role: "member",
          });
        }
      });
      await Conversation_members.bulkCreate(memberData, { transaction });
    }

    await transaction.commit();

    const message = await Message.create({
      conversation_id: conversation.id,
      sender_id: senderId,
      content,
    });

    return res.status(200).json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (err) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.log("Error when sending group message:", err);
    return res.status(500).json({
      Error: "Error when sending group message",
      message: err.message,
    });
  }
};

// lấy lịch sử tin nhắn của một cuộc trò chuyện
exports.getChatHistory = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user?.id;

    const isMember = await Conversation_members.findOne({
      where: {
        conversation_id: conversationId,
        user_id: userId,
      },
    });

    if (!isMember) {
      return res.status(403).json({
        message: "You do not have permission to view this chat",
      });
    }

    // phân trang
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation_id: conversationId })
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    return res.status(200).json({
      message: "Chat history fetched successfully",
      currentPage: parseInt(page),
      data: messages.reverse(),
      // báo hiệu cho Frontend biết còn tin nhắn cũ hay không
      hasMore: messages.length === parseInt(limit),
    });
  } catch (err) {
    console.log("Error when getting chat history:", err);
    return res.status(500).json({
      Error: "Error when getting chat history",
      message: err.message,
    });
  }
};

//Sửa tin nhắn
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    if (message.sender_id.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You do not have permission to edit this message",
      });
    }

    message.content = content;

    await message.save();

    return res.status(200).json({
      message: "Message edited successfully",
      data: message,
    });
  } catch (error) {
    console.error("Error editMessage:", error);
    return res.status(500).json({
      error: "Error editMessage:",
      message: error.message,
    });
  }
};

//Xóa tin nhắn
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user?.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    if (message.sender_id.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You do not have permission to delete this message",
      });
    }

    await message.deleteOne();

    return res.status(200).json({
      message: "Message deleted successfully",
      data: message,
    });
  } catch (error) {
    console.error("Error deleteMessage:", error);
    return res.status(500).json({
      error: "Error deleteMessage:",
      message: error.message,
    });
  }
};

//Nhắn tin với user khi ấn vào nút nhắn tin trên trang cá nhân của user đó
exports.sendMessageToUser = async (req, res) => {
  try {
  } catch (error) {
    console.error("Error sendMessageToUser:", error);
    return res.status(500).json({
      error: "Error sendMessageToUser:",
      message: error.message,
    });
  }
};
