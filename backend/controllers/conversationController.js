import asyncHandler from "../utils/asyncHandler.js";
import Conversation from "../models/conversation.js";
import ConversationDto from "../dto/conversationDto.js";

export const getConversationByParticipantIds = asyncHandler(
  async (req, res) => {
    const { participantIds } = req.params;
    const id1 = participantIds.split("&")[0];
    const id2 = participantIds.split("&")[1];

    return res.status(200).send("Ok");
  }
);

export const getConversationByOneParticipantId = asyncHandler(
  async (req, res) => {
    const { participantId } = req.params;
    const conversations = await Conversation.find({
      participants: participantId,
    }).select({ __v: false, createdAt: false });

    return res.status(200).send(conversations);
  }
);

export const createOrGetConversation = asyncHandler(async (req, res) => {
  const { userId1, userId2 } = req.body;

  const conversation = await Conversation.findOne({
    participants: { $all: [userId1, userId2], $size: 2 },
  }).select({ __v: false, createdAt: false });

  if (conversation) {
    return res.status(200).send(new ConversationDto(conversation));
  }
  const newConversation = await Conversation.create({
    participants: [userId1, userId2],
  });

  return res.status(200).send(new ConversationDto(newConversation));
});
