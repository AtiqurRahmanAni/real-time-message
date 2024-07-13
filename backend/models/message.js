import { Schema, model } from "mongoose";

const messageSchema = new Schema({
  conversationId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  content: {
    type: String,
  },
  senderId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Message = model("Message", messageSchema);
Message.createIndexes({ conversationId: 1 });
export default Message;
