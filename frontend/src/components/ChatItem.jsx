import { useAuthContext } from "../context/AuthContextProvider";

const ChatItem = ({ message }) => {
  const { user } = useAuthContext();

  return (
    <li
      key={message._id}
      className={`flex ${
        message.sender === user.username ? "justify-end" : "justify-start"
      }`}
    >
      <p
        className={`${
          message.sender === user.username ? "bg-blue-500" : "bg-gray-400"
        } rounded-lg px-2 py-1 text-white`}
      >
        {message.content}
      </p>
    </li>
  );
};

export default ChatItem;
