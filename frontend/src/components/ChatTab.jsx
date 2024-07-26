import ChatTabItem from "./ChatTabItem.jsx";

const ChatTab = ({ conversations }) => {
  return (
    <div>
      <ul className="border border-r-gray-300 w-56">
        {conversations?.map((item) => (
          <ChatTabItem key={item._id} item={item} />
        ))}
      </ul>
    </div>
  );
};

export default ChatTab;
