import { useAuthContext } from "../context/AuthContextProvider";
import conversationStore from "../stores/conversationStore";
import { useEffect, useRef, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { ChatEventEnum } from "../constants/index.js";
import socketStore from "../stores/socketStore.js";
import { useQueryClient } from "@tanstack/react-query";
import useFetchData from "../hooks/useFetchData.js";

const Sidebar = () => {
  const queryClient = useQueryClient();

  const { user, setUser } = useAuthContext();
  const socket = socketStore((state) => state.socket);

  // const conversations = conversationStore((state) => state.conversations);
  // const setConversations = conversationStore((state) => state.setConversations);
  // const setNewConversation = conversationStore(
  //   (state) => state.setNewConversation
  // );
  // const updateConversation = conversationStore(
  //   (state) => state.updateConversation
  // );

  // for select a conversation in the sidebar
  const selectedConversation = conversationStore(
    (state) => state.selectedConversation
  );
  const setSelectedConversation = conversationStore(
    (state) => state.setSelectedConversation
  );
  const selectedConversationRef = useRef(selectedConversation);

  // online users state
  const onlineUsers = conversationStore((state) => state.onlineUsers);
  const setOnlineUsers = conversationStore((state) => state.setOnlineUsers);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await axiosInstance.get(
  //         `/conversation/${user.username}`
  //       );
  //       setConversations(response.data);
  //     } catch (err) {
  //       if (err.response && err.response.status === 401) {
  //         setUser(null);
  //       } else {
  //         toast.error("Something went wrong");
  //       }
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchData();
  // }, []);

  const {
    isLoading,
    error,
    data: conversations,
  } = useFetchData(["getConversations"], `/conversation/${user.username}`);

  useEffect(() => {
    if (!socket) return;

    socket.on(ChatEventEnum.NEW_USER_EVENT, onNewUser);
    socket.on(ChatEventEnum.CONNECTED_EVENT, onConnect);
    socket.on(ChatEventEnum.USER_ONLINE, handleUserOnline);
    socket.on(ChatEventEnum.USER_OFFLINE, handleUserOffline);
    socket.on(ChatEventEnum.MESSAGE_RECEIVED_EVENT, onMessageReceive);

    return () => {
      socket.off(ChatEventEnum.NEW_USER_EVENT, onNewUser);
      socket.off(ChatEventEnum.CONNECTED_EVENT, onConnect);
      socket.off(ChatEventEnum.USER_ONLINE, handleUserOnline);
      socket.off(ChatEventEnum.USER_OFFLINE, handleUserOffline);
      socket.off(ChatEventEnum.MESSAGE_RECEIVED_EVENT, onMessageReceive);
    };
  }, [socket]);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  const handleUserOnline = (onlineUsers) => {
    // onlineUsers is an array
    setOnlineUsers(onlineUsers);
  };

  const handleUserOffline = (onlineUsers) => {
    // onlineUsers is an array
    setOnlineUsers(onlineUsers);
  };

  const onNewUser = () => {
    // if a user sign in, refetch the sidebar data
    queryClient.invalidateQueries({ queryKey: ["getConversations"] });
  };

  const onConnect = () => {
    console.log("Connected");
  };

  const onMessageReceive = (data) => {
    const { conversation, message } = data;
    const currentSelectedConversation = selectedConversationRef.current;
    /* if there is a new conversation, update the selectedConversation, 
      because conversation is null if users do not exchange any messages */
    if (
      currentSelectedConversation &&
      !currentSelectedConversation.conversation &&
      (currentSelectedConversation.username === message.receiver ||
        currentSelectedConversation.username === message.sender)
    ) {
      setSelectedConversation({
        ...currentSelectedConversation,
        conversation: conversation,
      });
    }

    // update the sidebar last message and last message timestamp when a new message is received
    queryClient.setQueryData(["getConversations"], (oldData) => {
      if (!oldData) return null;
      return {
        ...oldData,
        data: oldData?.data?.map((item) => {
          // when there is a new message, last message and timestamp are always updated
          if (
            item.username === message.receiver ||
            item.username === message.sender
          ) {
            return {
              ...item,
              conversation: conversation
                ? {
                    _id: conversation._id,
                    lastMessage: conversation.lastMessage,
                    lastMessageTimestamp: conversation.lastMessageTimestamp,
                  }
                : null,
            };
          } else {
            return item;
          }
        }),
      };
    });

    /* if there is inbox open, only then update the cache, 
    it will rerender the inbox and show new messages */
    if (
      currentSelectedConversation &&
      (currentSelectedConversation.username === message.receiver ||
        currentSelectedConversation.username === message.sender)
    ) {
      queryClient.setQueryData(
        ["getMessages", currentSelectedConversation.username],
        (oldData) => {
          if (!oldData) return { data: [message] };
          return {
            ...oldData,
            data: [...oldData.data, message],
          };
        }
      );
    }
  };

  return (
    <div>
      <ul className="border border-r-gray-300 min-w-56">
        {conversations?.data?.map((item) => (
          <li
            key={item._id}
            className={`relative px-4 py-2 border border-b-gray-300 hover:bg-gray-200 cursor-pointer ${
              item.username === selectedConversation?.username
                ? "bg-gray-300"
                : ""
            }`}
            onClick={() => setSelectedConversation(item)}
          >
            <div>
              <p className="text-gray-500 font-semibold text-lg">
                {item.displayName}
              </p>
              {onlineUsers.includes(item.username) && (
                <div className="absolute right-2 top-2 w-[8px] h-[8px] bg-green-600 rounded-full" />
              )}
            </div>
            {item.conversation?.lastMessage && (
              <p>
                <span className="text-gray-500 font-semibold">
                  Last Message:
                </span>{" "}
                <span>
                  {item.conversation.lastMessage.substr(0, 8) + "..."}
                </span>
              </p>
            )}
            {item.conversation?.lastMessageTimestamp && (
              <p>
                Time:{" "}
                <span>
                  {item.conversation.lastMessageTimestamp.substr(11, 8)}
                </span>
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
