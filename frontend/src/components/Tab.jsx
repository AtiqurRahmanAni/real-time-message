import React from "react";

const Tab = ({ tabText, onClick, isActive = false }) => {
  return (
    <button
      className={`text-gray-200 py-2 min-w-[50%] ${
        isActive ? "bg-blue-500" : "bg-gray-600/80"
      }`}
      onClick={onClick}
    >
      {tabText}
    </button>
  );
};

export default Tab;
