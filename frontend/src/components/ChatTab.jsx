import ChatTabItem from "./ChatTabItem.jsx";

const ChatTab = ({ conversations }) => {
  return (
    <div>
      <ul className="border border-gray-600 w-56 max-h-[calc(100dvh-7rem)] overflow-y-scroll scrollbar-custom">
        {conversations?.map((item) => (
          <ChatTabItem key={item._id} item={item} />
        ))}
      </ul>
    </div>
  );
};

export default ChatTab;
