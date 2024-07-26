import React from "react";

const Tab = ({ tabText, onClick, isActive = false }) => {
  return (
    <button
      className={`py-2 min-w-[50%] ${isActive ? "bg-sky-500" : ""}`}
      onClick={onClick}
    >
      {tabText}
    </button>
  );
};

export default Tab;
