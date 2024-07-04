import { useAuthContext } from "../context/AuthContextProvider";
import conversationStore from "../stores/conversationStore";
import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";

const Sidebar = () => {
  const { user, setUser } = useAuthContext();
  const conversations = conversationStore((state) => state.conversations);
  const setConversations = conversationStore((state) => state.setConversations);
  const [loading, setLoading] = useState(true);

  const getConversationsBetweenUsers = (allConversations, userId1, userId2) => {
    const foundItem = allConversations.find(
      (element) =>
        (element.participants[0] === userId1 &&
          element.participants[1] === userId2) ||
        (element.participants[1] === userId2 &&
          element.participants[2] === userId1)
    );
    return {
      lastMessage: foundItem?.lastMessage,
      lastMessageTimestamp: foundItem?.lastMessageTimestamp,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allUsersResponse = await axiosInstance.get("/users");
        const allConversationsResponse = await axiosInstance.get(
          `/conversation/${user._id}`
        );
        const formattedConversation = allUsersResponse.data.map((item) => {
          const conversation = getConversationsBetweenUsers(
            allConversationsResponse.data,
            user._id,
            item._id
          );
          return {
            _id: item._id,
            username: item.username,
            displayName: item.displayName,
            ...conversation,
          };
        });

        setConversations(formattedConversation);
      } catch (err) {
        console.log(err);
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

  return (
    <div>
      <ul className="border border-r-gray-300 min-w-fit">
        {conversations?.map((item) => {
          return (
            user._id !== item._id && (
              <li
                key={item._id}
                className="px-4 py-2 border border-b-gray-300 hover:bg-gray-200 cursor-pointer"
              >
                <p className="text-gray-500 font-semibold text-lg">
                  {item.displayName}
                </p>
                {item.lastMessage && (
                  <p>
                    Last Message: <span>{item.lastMessage}</span>
                  </p>
                )}
                {item.lastMessageTimestamp && (
                  <p>
                    Time: <span>{item.lastMessageTimestamp}</span>
                  </p>
                )}
              </li>
            )
          );
        })}
      </ul>
    </div>
  );
};

export default Sidebar;
