import { io } from "socket.io-client";
import { createContext, useContext, useEffect, useState } from "react";

const SocketContext = createContext();

export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState();
  useEffect(() => {
    const socket_url = import.meta.env.VITE_SOCKET_URL;
    const socketInstance = io(socket_url, {
      withCredentials: true,
    });
    setSocket(socketInstance);
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
