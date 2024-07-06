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

const createOrGetConversation = async (username1, username2) => {
  // const { username1, username2 } = req.body;

  const conversation = await Conversation.findOne({
    participants: { $all: [username1, username2], $size: 2 },
  }).select({ __v: false, createdAt: false });

  if (conversation) {
    return conversation;
  }
  const newConversation = await Conversation.create({
    participants: [username1, username2],
  });

  return newConversation;
};

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

export const sendMessage = asyncHandler(async (req, res) => {
  const { content, sender, receiver, receiverId, senderId } = req.body;
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
      { lastMessage: content, lastMessageTimestamp: new Date() },
      { new: true, session }
    );

    const message = new MessageDto(newMessage[0]);

    // req.app
    //   .get("io")
    //   .in(senderId)
    //   .emit(ChatEventEnum.MESSAGE_RECEIVED_EVENT, {
    //     conversation: new ConversationDto(updatedConversation),
    //     message,
    //   });
    // req.app
    //   .get("io")
    //   .in(receiverId)
    //   .emit(ChatEventEnum.MESSAGE_RECEIVED_EVENT, {
    //     conversation: new ConversationDto(updatedConversation),
    //     message,
    //   });

    await session.commitTransaction();
    session.endSession();

    /* new message will receive through socket connection both sender and receiver,
       this is handy if sender is logged in multiple devices. sent message will appear
       in real time in all devices
    */
    [senderId, receiverId].forEach((recipient) =>
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
