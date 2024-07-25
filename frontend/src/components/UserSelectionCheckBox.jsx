import { Checkbox } from "@headlessui/react";
import React, { useState } from "react";

const UserSelectionCheckBox = ({ userId, addUser, removeUser }) => {
  const [enabled, setEnabled] = useState(false);

  const handleChange = (checked) => {
    setEnabled(checked);
    if (!checked) {
      removeUser(userId);
    } else {
      addUser(userId);
    }
  };

  return (
    <Checkbox
      checked={enabled}
      onChange={handleChange}
      className="group block size-[20px] rounded border bg-white data-[checked]:bg-gray-500"
    >
      <svg
        className="stroke-white opacity-0 group-data-[checked]:opacity-100"
        viewBox="0 0 15 15"
        fill="none"
      >
        <path
          d="M3 8L6 11L11 3.5"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Checkbox>
  );
};

export default UserSelectionCheckBox;
