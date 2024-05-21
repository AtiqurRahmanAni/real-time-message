import { forwardRef } from "react";

const Input = forwardRef(({ className, label }, ref) => {
  return (
    <div className={className || ""}>
      <label htmlFor={label} className="text-lg block">
        {label}
      </label>
      <input
        ref={ref}
        type="text"
        id={label}
        className="border border-gray-300 rounded-md w-full p-2"
      />
    </div>
  );
});

export default Input;
