import { useAuthContext } from "../context/AuthContextProvider";

const ChatItem = ({ message }) => {
  const { user } = useAuthContext();

  return (
    <li
      key={message._id}
      className={`flex ${
        message.senderId === user._id ? "justify-end" : "justify-start"
      }`}
    >
      <p
        className={`${
          message.senderId === user._id ? "bg-blue-500" : "bg-gray-400"
        } rounded-lg px-2 py-1 text-white`}
      >
        {message.content}
      </p>
    </li>
  );
};

export default ChatItem;
