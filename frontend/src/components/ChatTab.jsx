import ChatTabItem from "./ChatTabItem.jsx";

const ChatTab = ({ conversations }) => {
  return (
    <div>
      <ul className="border border-r-gray-300 w-56 max-h-[calc(100dvh-95px)] overflow-y-scroll scrollbar-custom">
        {conversations?.map((item) => (
          <ChatTabItem key={item._id} item={item} />
        ))}
      </ul>
    </div>
  );
};

export default ChatTab;
