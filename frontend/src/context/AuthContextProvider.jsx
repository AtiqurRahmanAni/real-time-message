import React, { useEffect, useState } from "react";
import { createContext, useContext } from "react";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import socketStore from "../stores/socketStore";
import { useQueryClient } from "@tanstack/react-query";
import conversationStore from "../stores/conversationStore";
import groupStore from "../stores/groupStore";
import Loading from "../components/Loading";

const AuthContext = createContext();

export const useAuthContext = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const setSocket = socketStore((state) => state.setSocket);
  const socket = socketStore((state) => state.socket);
  const queryClient = useQueryClient();
  const resetConversations = conversationStore(
    (state) => state.resetConversations
  );
  const resetGroups = groupStore((state) => state.resetGroups);

  const initSocket = (userId) => {
    const socket_url = import.meta.env.VITE_SOCKET_URL;
    const socketInstance = io(socket_url, {
      withCredentials: true,
      query: { userId },
    });
    setSocket(socketInstance);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get("/users/profile");
        setUser(response.data);
        initSocket(response.data._id);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setUser(null);
        } else {
          toast.error("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const logoutActions = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    setUser(null);
    resetConversations();
    resetGroups();
    queryClient.removeQueries();
  };

  const value = {
    user,
    setUser,
    initSocket,
    logoutActions,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <Loading /> : children}
    </AuthContext.Provider>
  );
};
