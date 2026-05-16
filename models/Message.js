import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Conversation",

    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
  }
);

messageSchema.index({ conversation_id: 1, createdAt: -1 });


const Message = mongoose.model("Message", messageSchema);
export default Message;

