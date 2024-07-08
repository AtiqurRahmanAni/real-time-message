import asyncHandler from "../utils/asyncHandler.js";
import Conversation from "../models/conversation.js";
import MessageDto from "../dto/messageDto.js";
import ConversationDto from "../dto/conversationDto.js";
import Users from "../models/user.js";
import Message from "../models/message.js";
import { InternalServerError } from "../utils/errors.js";
import mongoose from "mongoose";
import { ChatEventEnum } from "../constants/index.js";

export const getConversationByParticipantIds = asyncHandler(
  async (req, res) => {
    const { participantIds } = req.params;
    const id1 = participantIds.split("&")[0];
    const id2 = participantIds.split("&")[1];

    return res.status(200).send("Ok");
  }
);

export const getConversationsByUsername = asyncHandler(async (req, res) => {
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
              lastMessageSender: {
                $arrayElemAt: ["$conversationArray.lastMessageSender", 0],
              },
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: "messages",
        let: { conversationId: "$conversation._id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$conversationId", "$$conversationId"] },
                  { $eq: ["$seen", false] },
                ],
              },
            },
          },
          {
            $count: "unseenCount",
          },
        ],
        as: "unseenMessages",
      },
    },
    {
      $sort: {
        "conversation.lastMessageTimestamp": -1, // -1 for descending order
      },
    },
    {
      $project: {
        _id: true,
        username: true,
        displayName: true,
        conversation: true,
        unseenMessages: {
          $ifNull: [{ $arrayElemAt: ["$unseenMessages.unseenCount", 0] }, 0],
        },
      },
    },
  ]);

  return res.status(200).send(conversations);
});

export const getMessagesByConversationId = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const messages = await Message.find({ conversationId })
    .sort({ createdAt: 1 })
    .select({
      __v: false,
      createdAt: false,
    });

  return res.status(200).send(messages);
});

export const setSeenByConversationId = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  try {
    const bulkOps = [
      {
        updateMany: {
          filter: {
            conversationId: conversationId,
            seen: false,
          },
          update: { $set: { seen: true } },
        },
      },
    ];

    const updateResponse = await Message.bulkWrite(bulkOps);

    return res.status(200).json({ message: "Set seen successful" });
  } catch (err) {
    console.log(`Error updating seen status: ${err}`);
    throw new InternalServerError("Something went wrong updating seen status");
  }
});

export const setSeenByMessageId = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { seen } = req.body;
  try {
    await Message.findByIdAndUpdate({ _id: messageId }, { seen: seen });
    return res.status(200).json({ message: "Set seen successful" });
  } catch (err) {
    console.log(`Error updating seen status: ${err}`);
    throw new InternalServerError("Something went wrong updating seen status");
  }
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { sender, receiver, content } = req.body;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    let conversation = null;
    conversation = await Conversation.findOne({
      participants: { $all: [sender, receiver], $size: 2 },
    })
      .select({ __v: false })
      .session(session);

    conversation =
      conversation ||
      (
        await Conversation.create(
          [
            {
              participants: [sender, receiver],
              lastMessageSender: sender,
            },
          ],
          { session }
        )
      )[0];

    const newMessage = await Message.create(
      [
        {
          conversationId: conversation._id,
          content: content,
          sender: sender,
          receiver: receiver,
        },
      ],
      { session }
    );

    const updatedConversation = await Conversation.findByIdAndUpdate(
      { _id: conversation._id },
      {
        lastMessage: content,
        lastMessageTimestamp: new Date(),
        lastMessageSender: sender,
      },
      { new: true, session }
    );

    const message = new MessageDto(newMessage[0]);

    await session.commitTransaction();
    session.endSession();

    /* new message will receive through socket connection both sender and receiver,
       this is handy if sender is logged in multiple devices. sent message will appear
       in real time in all devices
    */
    [sender, receiver].forEach((recipient) =>
      req.app
        .get("io")
        .in(recipient)
        .emit(ChatEventEnum.MESSAGE_RECEIVED_EVENT, {
          conversation: new ConversationDto(updatedConversation),
          message,
        })
    );

    return res.status(200).json({ message: "Message sent" });
  } catch (err) {
    console.error("Error sending message:", err);
    await session.abortTransaction();
    session.endSession();
    throw new InternalServerError("Something went wrong sending message");
  }
});
