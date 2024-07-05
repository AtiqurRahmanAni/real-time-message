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
  const setConversationSelected = conversationStore(
    (state) => state.setConversationSelected
  );
  const setNewConversation = conversationStore(
    (state) => state.setNewConversation
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/conversation/${user.username}`
        );
        const conversationsWithSelected = response.data.map((conversation) => ({
          ...conversation,
          selected: false,
        }));
        setConversations(conversationsWithSelected);
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

    return () => {
      socket.off(ChatEventEnum.NEW_USER_EVENT, onNewUser);
    };
  });

  const onNewUser = (newConversation) => {
    if (newConversation) {
      setNewConversation(newConversation);
    }
  };

  return (
    <div>
      <ul className="border border-r-gray-300 min-w-fit">
        {conversations?.map((item, idx) => (
          <li
            key={item._id}
            className={`px-4 py-2 border border-b-gray-300 hover:bg-gray-200 cursor-pointer ${
              item.selected ? "bg-gray-300" : ""
            }`}
            onClick={() => setConversationSelected(idx)}
          >
            <p className="text-gray-500 font-semibold text-lg">
              {item.displayName}
            </p>
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
