import { Server, Socket } from "socket.io";
import { ChatRoomEnum } from "../constants/index.js";

export const initSocket = (io) => {
  return io.on("connection", (socket) => {
    console.log(`Socket connected`);
    // each connection will join this room so that if a new user signup, he will appear in the sidebar
    socket.join(ChatRoomEnum.NEW_USER_ROOM);
  });
};
