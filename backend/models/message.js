import { Schema, model } from "mongoose";

const attachmentSchema = new Schema(
  { url: String, publicId: String },
  { _id: false }
);

const messageSchema = new Schema({
  conversationId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  content: {
    type: String,
  },
  attachments: [attachmentSchema],
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
