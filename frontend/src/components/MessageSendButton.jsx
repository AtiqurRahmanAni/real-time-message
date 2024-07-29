import { IoSend } from "react-icons/io5";

const MessageSendButton = ({ onClick, disabled = false }) => {
  return (
    <button
      className={`p-2 rounded-full bg-gray-300 hover:bg-gray-300/80 ${
        disabled ? "bg-white/50 pointer-events-none" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      <IoSend className="text-2xl" />
    </button>
  );
};

export default MessageSendButton;
