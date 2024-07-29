import React from "react";
import { GrAttachment } from "react-icons/gr";

const AttachmentButton = ({ onClick }) => {
  return (
    <button
      className="text-xl text-gray-700 bg-gray-300/85 p-2 rounded-lg hover:bg-gray-300/80"
      onClick={onClick}
    >
      <GrAttachment />
    </button>
  );
};

export default AttachmentButton;
