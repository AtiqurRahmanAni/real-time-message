import { Server, Socket } from "socket.io";
import { ChatEventEnum, ChatRoomEnum } from "../constants/index.js";

const onlineUsers = new Set();

export const initSocket = (io) => {
  return io.on("connection", (socket) => {
    console.log(`Socket connected`);
    // each connection will join this room so that if a new user signup, he will appear in the sidebar
    socket.join(ChatRoomEnum.NEW_USER_ROOM);

    const userId = socket.handshake.query?.userId || "";

    if (userId) {
      socket.join(userId);
      onlineUsers.add(userId);
      io.emit(ChatEventEnum.USER_ONLINE, [...onlineUsers]); // spreading to convert set to array
    }

    socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
      console.log(`User has disconnected: ${userId}`);
      if (userId) {
        socket.leave(userId);
        onlineUsers.delete(userId);
        io.emit(ChatEventEnum.USER_OFFLINE, [...onlineUsers]); // spreading to convert set to array
      }
    });
  });
};
