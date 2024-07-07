import conversationStore from "../stores/conversationStore";

const SidebarItem = ({ item }) => {
  // for selecting a conversation in the sidebar
  const selectedConversation = conversationStore(
    (state) => state.selectedConversation
  );
  const setSelectedConversation = conversationStore(
    (state) => state.setSelectedConversation
  );

  // online users state
  const onlineUsers = conversationStore((state) => state.onlineUsers);

  return (
    <li
      key={item._id}
      className={`relative px-4 py-2 border border-b-gray-300 hover:bg-gray-200 cursor-pointer ${
        item.username === selectedConversation?.username ? "bg-gray-300" : ""
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
          <span className="text-gray-500 font-semibold">Last Message:</span>{" "}
          <span>{item.conversation.lastMessage.substr(0, 8) + "..."}</span>
        </p>
      )}
      {item.conversation?.lastMessageTimestamp && (
        <p>
          Time:{" "}
          <span>{item.conversation.lastMessageTimestamp.substr(11, 8)}</span>
        </p>
      )}
      <div className="absolute bottom-2 right-2 bg-green-600 px-1.5 py-0 rounded-full">
        <span className="text-white">3</span>
      </div>
    </li>
  );
};

export default SidebarItem;
