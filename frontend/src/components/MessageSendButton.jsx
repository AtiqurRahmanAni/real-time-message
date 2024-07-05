import { IoSend } from "react-icons/io5";

const MessageSendButton = ({ onClick, disabled = false }) => {
  return (
    <button
      className={`p-2 rounded-full bg-white hover:bg-gray-100 ${
        disabled ? "bg-white/50" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      <IoSend className="text-2xl" />
    </button>
  );
};

export default MessageSendButton;
