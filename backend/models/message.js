import { Schema, model } from "mongoose";

const messageSchema = new Schema({
  conversationId: {
    type: Schema.Types.ObjectId,
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
  seen: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Message = model("Message", messageSchema);
// Message.createIndexes({ conversationId: 1, seen: 1 });
export default Message;
