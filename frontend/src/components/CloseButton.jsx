import React from "react";
import { IoCloseCircleOutline } from "react-icons/io5";

const CloseButton = ({ className, onClick }) => {
  return (
    <button className={className || ""} onClick={onClick}>
      <IoCloseCircleOutline className="text-2xl bg-gray-100 rounded-full" />
    </button>
  );
};

export default CloseButton;
