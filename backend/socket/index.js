import {
  ChatEventEnum,
  ChatRoomEnum,
  GroupChatEventEnum,
} from "../constants/index.js";

const onlineUsers = new Set();

export const initSocket = (io) => {
  return io.on("connection", (socket) => {
    // each connection will join this room so that if a new user signup, he will appear in the sidebar
    socket.join(ChatRoomEnum.NEW_USER_ROOM);

    const userId = socket.handshake.query?.userId || "";

    socket.join(userId);
    if (userId) {
      console.log(`User ${userId} just joined`);
      onlineUsers.add(userId);
      io.emit(ChatEventEnum.USER_ONLINE, [...onlineUsers]); // spreading to convert set to array
    }

    socket.on(
      ChatEventEnum.MESSAGE_SEEN_EVENT,
      ({ selectedConversationId, room }) => {
        /* 
        when a user click on a conversation, set the count of unseen 
        messages to 0 and broadcast this event to that user
        */
        io.to(room).emit(
          ChatEventEnum.MESSAGE_SEEN_EVENT,
          selectedConversationId
        );
      }
    );

    socket.on(
      GroupChatEventEnum.GROUP_MESSAGE_SEEN_EVENT,
      ({ selectedGroupId, room }) => {
        /* 
        when a user click on a group, set the count of unseen 
        messages to 0 and broadcast this event to that user
        */
        io.to(room).emit(
          GroupChatEventEnum.GROUP_MESSAGE_SEEN_EVENT,
          selectedGroupId
        );
      }
    );

    socket.on(ChatEventEnum.TYPING_EVENT, ({ targetUserId, typingUserId }) => {
      /* 
      broadcasting the typing event to the target user
      */
      io.to(targetUserId).emit(ChatEventEnum.TYPING_EVENT, typingUserId);
    });

    socket.on(
      ChatEventEnum.STOP_TYPING_EVENT,
      ({ targetUserId, typingUserId }) => {
        /* broadcasting the stop typing event to the target user
         */
        io.to(targetUserId).emit(ChatEventEnum.STOP_TYPING_EVENT, typingUserId);
      }
    );

    // for updating one to one chat last seen
    socket.on(
      ChatEventEnum.LAST_SEEN_MESSAGE,
      ({ lastMessageId, room, receiverId }) => {
        io.to(room).emit(ChatEventEnum.LAST_SEEN_MESSAGE, {
          lastMessageId,
          receiverId,
        });
      }
    );

    // for updating group chat last seen
    socket.on(
      GroupChatEventEnum.GROUP_LAST_SEEN_MESSAGE,
      ({ groupId, senderId, receiverId, messageId }) => {
        io.to(senderId).emit(GroupChatEventEnum.GROUP_LAST_SEEN_MESSAGE, {
          groupId,
          receiverId,
          messageId,
        });
      }
    );

    socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
      console.log(`User ${userId} has disconnected`);
      if (userId) {
        socket.leave(userId);
        onlineUsers.delete(userId);
        io.emit(ChatEventEnum.USER_OFFLINE, [...onlineUsers]); // spreading to convert set to array
      }
    });
  });
};
