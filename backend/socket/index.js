import { Server, Socket } from "socket.io";
import { ChatEventEnum, ChatRoomEnum } from "../constants/index.js";

const onlineUsers = new Set();

export const initSocket = (io) => {
  return io.on("connection", (socket) => {
    // each connection will join this room so that if a new user signup, he will appear in the sidebar
    socket.join(ChatRoomEnum.NEW_USER_ROOM);

    const userId = socket.handshake.query?.userId || "";

    socket.join(userId);
    if (userId && !onlineUsers.has(userId)) {
      console.log(`User ${userId} just joined`);
      onlineUsers.add(userId);
      io.emit(ChatEventEnum.USER_ONLINE, [...onlineUsers]); // spreading to convert set to array
    }

    socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
      console.log(`User ${userId} has disconnected`);
      if (userId && onlineUsers.has(userId)) {
        socket.leave(userId);
        onlineUsers.delete(userId);
        io.emit(ChatEventEnum.USER_OFFLINE, [...onlineUsers]); // spreading to convert set to array
      }
    });
  });
};
