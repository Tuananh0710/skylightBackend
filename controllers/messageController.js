import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { updateConversationAfterCreateMessage } from "../utils/messageHelper.js";

export const sendDirectMessage = async (req, res) => {
  try {
    const { recipientId, content, conversationId } = req.body;

    const senderId = req.user._id;

    let conversation;
    if (!content) {
      return res.status(400).json({
        message: "Have no content in message",
      });
    }

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    }

    if (!conversationId) {
      conversation = await Conversation.create({
        type: "direct",
        participants: [
          { userId: senderId, joinedAt: new Date() },
          {
            userId: recipientId,
            joinedAt: new Date(),
          },
        ],
        lastMessageAt: new Date(),
        unreadCount: new Map(),
      });
    }

    const message = await Message.create({
      // có thể thêm gửi h/a imgUrl
      conversationId: conversation._id,
      senderId,
      content,
    });

    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();

    return res.status(201).json({
      message: "send message successful",
      message: message,
    });
  } catch (err) {
    console.log("Err: ", err);
    return res.status(500).json({
      message: "error send message ",
      error: err,
    });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const senderId = req.user?._id;
    const conversation = req.conversation;

    if (!content) {
      return res.status(404).json({
        message: "Have no content message",
      });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      content,
    });

    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();

    return res.status(200).json({
      message: "Send group message successful",
      data: message,
    });
  } catch (err) {
    console.log("Err: ", err);
    return res.status(500).json({
      message: "error send message to group",
    });
  }
};
