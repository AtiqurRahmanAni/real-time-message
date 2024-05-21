import React from "react";

const Button = ({ className, onClick, children, type, disabled = false }) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`transition-colors px-4 py-2 rounded-md text-white font-semibold text-lg ${
        disabled && "opacity-65"
      } ${className || ""}`}
      type={type || "button"}
    >
      {children}
    </button>
  );
};

export default Button;
