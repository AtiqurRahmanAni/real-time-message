import { Schema, model } from "mongoose";

const conversationSchema = new Schema({
  participants: [
    {
      type: String,
    },
  ],
  lastMessage: {
    type: String,
    default: null,
  },
  lastMessageTimestamp: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Conversation = model("Conversation", conversationSchema);
Conversation.createIndexes({ participants: 1 });
export default Conversation;
