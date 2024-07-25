import React, { useRef } from "react";

const GroupNameInput = ({ groupName, setGroupName }) => {
  const isFocused = useRef(false);

  const setFocused = (e) => {
    isFocused.current = true;
  };
  return (
    <div>
      <div>
        <span>Group Name:</span>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="bg-gray-200 ml-2 rounded-md focus:outline-none px-2 py-1 text-gray-500"
          onBlur={setFocused}
        />
      </div>
      {isFocused.current && groupName === "" && (
        <span className="text-red-500 text-sm">Group name required</span>
      )}
    </div>
  );
};

export default GroupNameInput;
