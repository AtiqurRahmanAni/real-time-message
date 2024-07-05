import { useAuthContext } from "../context/AuthContextProvider";
import conversationStore from "../stores/conversationStore";
import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { ChatEventEnum } from "../constants/index.js";
import socketStore from "../stores/socketStore.js";

const Sidebar = () => {
  const { user, setUser } = useAuthContext();
  const socket = socketStore((state) => state.socket);

  const conversations = conversationStore((state) => state.conversations);
  const setConversations = conversationStore((state) => state.setConversations);
  const setNewConversation = conversationStore(
    (state) => state.setNewConversation
  );

  // for select a conversation in the sidebar
  const selectedConversation = conversationStore(
    (state) => state.selectedConversation
  );
  const setSelectedConversation = conversationStore(
    (state) => state.setSelectedConversation
  );

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
    socket.on(ChatEventEnum.MESSAGE_RECEIVED_EVENT, handleReceiveMessage);

    return () => {
      socket.off(ChatEventEnum.NEW_USER_EVENT, onNewUser);
      socket.off(ChatEventEnum.CONNECTED_EVENT, onConnect);
      socket.off(ChatEventEnum.USER_ONLINE, handleUserOnline);
      socket.off(ChatEventEnum.USER_OFFLINE, handleUserOffline);
      socket.off(ChatEventEnum.MESSAGE_RECEIVED_EVENT, handleReceiveMessage);
    };
  }, [socket]);

  const handleUserOnline = (onlineUsers) => {
    // onlineUsers is an array
    setOnlineUsers(onlineUsers);
  };

  const handleUserOffline = (onlineUsers) => {
    // onlineUsers is an array
    setOnlineUsers(onlineUsers);
  };

  const onNewUser = (newConversation) => {
    if (newConversation) {
      setNewConversation(newConversation);
    }
  };

  const onConnect = () => {
    console.log("Connected");
  };

  const handleReceiveMessage = (message) => {
    console.log(`Received ${message}`);
  };

  return (
    <div>
      <ul className="border border-r-gray-300 min-w-56">
        {conversations?.map((item, idx) => (
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
