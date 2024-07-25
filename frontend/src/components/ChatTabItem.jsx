import { ChatEventEnum } from "../constants";
import { useAuthContext } from "../context/AuthContextProvider";
import conversationStore from "../stores/conversationStore";
import socketStore from "../stores/socketStore";
import { formatTimeStamp } from "../utils/index";

const ChatTabItem = ({ item }) => {
  // for selecting a conversation in the sidebar
  const selectedConversation = conversationStore(
    (state) => state.selectedConversation
  );
  const setSelectedConversation = conversationStore(
    (state) => state.setSelectedConversation
  );
  const socket = socketStore((state) => state.socket);

  // online users state
  const onlineUsers = conversationStore((state) => state.onlineUsers);
  const { user } = useAuthContext();

  const onConversationSelect = (item) => {
    if (selectedConversation?._id !== item._id) {
      setSelectedConversation(item);
      if (socket && item.conversation) {
        socket.emit(ChatEventEnum.MESSAGE_SEEN_EVENT, {
          selectedConversationId: item.conversation._id,
          room: user._id,
        });
      }
    }
  };

  return (
    <li
      key={item._id}
      className={`relative px-4 py-2 border border-b-gray-300 hover:bg-gray-200 cursor-pointer ${
        item._id === selectedConversation?._id ? "bg-gray-300" : ""
      }`}
      onClick={() => onConversationSelect(item)}
    >
      <div>
        <p className="text-gray-500 font-semibold text-lg">
          {item.displayName}
        </p>
        {onlineUsers.includes(item._id) && (
          <div className="absolute right-2 top-2 w-[8px] h-[8px] bg-green-600 rounded-full" />
        )}
      </div>
      {item?.lastMessage && (
        <>
          <p>
            <span className="text-gray-500 font-semibold">
              {item.lastMessage.senderId === user._id ? "You:" : null}
            </span>{" "}
            <span>{item.lastMessage.content.substr(0, 8) + "..."}</span>
          </p>
          <p>
            <span>{formatTimeStamp(item.lastMessage.createdAt)}</span>
          </p>
        </>
      )}

      {item.unseenCount > 0 && (
        <div className="absolute bottom-2 right-2 bg-green-600 px-1.5 py-0 rounded-full">
          <span className="text-white">{item.unseenCount}</span>
        </div>
      )}
    </li>
  );
};

export default ChatTabItem;
