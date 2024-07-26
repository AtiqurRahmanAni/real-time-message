import { Schema, model } from "mongoose";

const attachmentSchema = new Schema(
  { url: String, publicId: String },
  { _id: false }
);

const groupMessageSchema = new Schema({
  groupId: {
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
  receiverIds: [
    {
      type: Schema.Types.ObjectId,
      required: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const GroupMessage = model("GroupMessage", groupMessageSchema);
GroupMessage.createIndexes({ conversationId: 1 });
export default GroupMessage;
