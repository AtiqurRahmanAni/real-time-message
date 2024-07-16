import React from "react";
import { GrAttachment } from "react-icons/gr";

const AttachmentButton = ({ onClick }) => {
  return (
    <button
      className="text-xl text-gray-500 bg-white/50 p-2 rounded-lg"
      onClick={onClick}
    >
      <GrAttachment />
    </button>
  );
};

export default AttachmentButton;
