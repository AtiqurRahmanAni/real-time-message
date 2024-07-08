import { ChatEventEnum, ChatRoomEnum } from "../constants/index.js";

const onlineUsers = new Set();

export const initSocket = (io) => {
  return io.on("connection", (socket) => {
    // each connection will join this room so that if a new user signup, he will appear in the sidebar
    socket.join(ChatRoomEnum.NEW_USER_ROOM);

    const username = socket.handshake.query?.username || "";

    socket.join(username);
    if (username) {
      console.log(`User ${username} just joined`);
      onlineUsers.add(username);
      io.emit(ChatEventEnum.USER_ONLINE, [...onlineUsers]); // spreading to convert set to array
    }

    socket.on(ChatEventEnum.MESSAGE_SEEN_EVENT, ({ conversationId, room }) => {
      /* when a user click on a conversation, set the count of unseen messages to 0
        broadcasting this event to that user
      */
      io.to(room).emit(ChatEventEnum.MESSAGE_SEEN_EVENT, conversationId);
    });

    socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
      console.log(`User ${username} has disconnected`);
      if (username && onlineUsers.has(username)) {
        socket.leave(username);
        onlineUsers.delete(username);
        io.emit(ChatEventEnum.USER_OFFLINE, [...onlineUsers]); // spreading to convert set to array
      }
    });
  });
};
