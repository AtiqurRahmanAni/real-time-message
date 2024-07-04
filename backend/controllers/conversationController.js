import asyncHandler from "../utils/asyncHandler.js";
import Conversation from "../models/conversation.js";
import ConversationDto from "../dto/conversationDto.js";
import Users from "../models/user.js";

export const getConversationByParticipantIds = asyncHandler(
  async (req, res) => {
    const { participantIds } = req.params;
    const id1 = participantIds.split("&")[0];
    const id2 = participantIds.split("&")[1];

    return res.status(200).send("Ok");
  }
);

export const getConversationsByUserId = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const conversations = await Users.aggregate([
    {
      $match: {
        username: { $ne: username },
      },
    },
    {
      $lookup: {
        from: "conversations",
        let: { username: "$username" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$$username", "$participants"] },
                  { $in: [username, "$participants"] },
                ],
              },
            },
          },
        ],
        as: "conversationArray",
      },
    },
    {
      $project: {
        _id: true,
        username: true,
        displayName: true,
        conversation: {
          $cond: {
            if: { $eq: [{ $size: "$conversationArray" }, 0] },
            then: null,
            else: {
              _id: { $arrayElemAt: ["$conversationArray._id", 0] },
              lastMessage: {
                $arrayElemAt: ["$conversationArray.lastMessage", 0],
              },
              lastMessageTimestamp: {
                $arrayElemAt: ["$conversationArray.lastMessageTimestamp", 0],
              },
            },
          },
        },
      },
    },
  ]);

  return res.status(200).send(conversations);
});

export const createOrGetConversation = asyncHandler(async (req, res) => {
  const { username1, username2 } = req.body;

  const conversation = await Conversation.findOne({
    participants: { $all: [username1, username2], $size: 2 },
  }).select({ __v: false, createdAt: false });

  if (conversation) {
    return res.status(200).send(new ConversationDto(conversation));
  }
  const newConversation = await Conversation.create({
    participants: [username1, username2],
  });

  return res.status(200).send(new ConversationDto(newConversation));
});
