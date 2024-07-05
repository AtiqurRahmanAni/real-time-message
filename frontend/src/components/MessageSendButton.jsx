import { IoSend } from "react-icons/io5";

const MessageSendButton = ({ onClick }) => {
  return (
    <button
      className="p-2 rounded-full bg-white hover:bg-gray-100"
      onClick={onClick}
    >
      <IoSend className="text-2xl" />
    </button>
  );
};

export default MessageSendButton;
