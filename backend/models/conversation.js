import { Schema, model } from "mongoose";

const conversationSchema = new Schema({
  participants: [
    {
      participantId: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      lastSeenTime: {
        type: Date,
        default: null,
      },
    },
  ],
  lastMessageId: {
    type: Schema.Types.ObjectId,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Conversation = model("Conversation", conversationSchema);
Conversation.createIndexes({ participants: 1 });
export default Conversation;
