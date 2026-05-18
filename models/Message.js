const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversation_id: {
      type: Number,
      required: true,
    },
    sender_id: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    imgUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ conversation_id: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
