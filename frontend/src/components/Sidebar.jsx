import { useAuthContext } from "../context/AuthContextProvider";
import conversationStore from "../stores/conversationStore";
import { useEffect, useRef, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { ChatEventEnum } from "../constants/index.js";
import socketStore from "../stores/socketStore.js";
import { useQueryClient } from "@tanstack/react-query";

const Sidebar = () => {
  const queryClient = useQueryClient();

  const { user, setUser } = useAuthContext();
  const socket = socketStore((state) => state.socket);

  const conversations = conversationStore((state) => state.conversations);
  const setConversations = conversationStore((state) => state.setConversations);
  const setNewConversation = conversationStore(
    (state) => state.setNewConversation
  );
  const updateConversation = conversationStore(
    (state) => state.updateConversation
  );

  // for select a conversation in the sidebar
  const selectedConversation = conversationStore(
    (state) => state.selectedConversation
  );
  const setSelectedConversation = conversationStore(
    (state) => state.setSelectedConversation
  );
  const selectedConversationRef = useRef(selectedConversation);

  const [onlineUsers, setOnlineUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/conversation/${user.username}`
        );
        // const conversationsWithSelected = response.data.map((conversation) => ({
        //   ...conversation,
        //   selected: false,
        // }));
        setConversations(response.data);
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
    fetchData();
  }, []);

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

  const onNewUser = (newConversation) => {
    // if a user sign in, he will show in the sidebar
    if (newConversation) {
      setNewConversation(newConversation);
    }
  };

  const onConnect = () => {
    console.log("Connected");
  };

  // console.log(`From sidebar ${selectedConversation}`);

  // console.log(conversations);

  const onMessageReceive = (data) => {
    const { conversation, message } = data;
    // console.log(`Conversation: ${conversation}, Message: ${message}`);
    const currentSelectedConversation = selectedConversationRef.current;
    /* if there is a new conversation, update the selectedConversation, 
      because conversation is null if users do not exchange any messages */
    // if (
    //   selectedConversation &&
    //   selectedConversation.username === message.receiver &&
    //   !selectedConversation.conversation
    // ) {
    //   setSelectedConversation({
    //     ...selectedConversation,
    //     conversation: conversation,
    //   });
    // }

    updateConversation(conversation);

    /* if there is inbox open, only then update the cache, 
    it will rerender the inbox and show new messages */
    if (
      currentSelectedConversation &&
      (currentSelectedConversation.username === message.receiver ||
        currentSelectedConversation.username === message.sender)
    ) {
      queryClient.setQueryData(
        ["getMessages", currentSelectedConversation._id],
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
        {conversations?.map((item) => (
          <li
            key={item._id}
            className={`px-4 py-2 border border-b-gray-300 hover:bg-gray-200 cursor-pointer ${
              item._id === selectedConversation?._id ? "bg-gray-300" : ""
            }`}
            onClick={() => setSelectedConversation(item)}
          >
            <div className="flex justify-between">
              <p className="text-gray-500 font-semibold text-lg">
                {item.displayName}
              </p>
              {onlineUsers.includes(item._id) && (
                <div className="w-[8px] h-[8px] bg-green-600 rounded-full" />
              )}
            </div>
            {item.conversation?.lastMessage && (
              <p>
                Last Message: <span>{item.conversation.lastMessage}</span>
              </p>
            )}
            {item.conversation?.lastMessageTimestamp && (
              <p>
                Time: <span>{item.conversation.lastMessageTimestamp}</span>
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
