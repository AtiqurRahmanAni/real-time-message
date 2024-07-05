import React, { useEffect, useState } from "react";
import { createContext, useContext } from "react";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import socketStore from "../stores/socketStore";

const AuthContext = createContext();

export const useAuthContext = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const setSocket = socketStore((state) => state.setSocket);

  const initSocket = () => {
    const socket_url = import.meta.env.VITE_SOCKET_URL;
    const socketInstance = io(socket_url, {
      withCredentials: true,
    });
    setSocket(socketInstance);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get("/users/profile");
        setUser(response.data);
        initSocket();
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setUser(null);
          navigate("/login");
        } else {
          toast.error("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const value = {
    user,
    setUser,
    initSocket,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};