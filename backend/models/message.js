import { Schema, model } from "mongoose";

const messageSchema = new Schema({
  conversationId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
  },
  // sender is senders' username
  sender: {
    type: String,
    required: true,
  },
  // sender is receiver' username
  receiver: {
    type: String,
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
