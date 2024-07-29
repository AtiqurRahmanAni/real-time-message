import React, { useRef } from "react";

const GroupNameInput = ({ groupName, setGroupName }) => {
  const isFocused = useRef(false);

  const setFocused = (e) => {
    isFocused.current = true;
  };
  return (
    <div>
      <div>
        <span className="text-gray-300 font-semibold">Group Name:</span>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="bg-gray-200 ml-2 rounded-md focus:outline-none px-2 py-1 text-gray-800"
          onBlur={setFocused}
        />
      </div>
      {isFocused.current && groupName === "" && (
        <div className="mt-1">
          <span className="text-red-500 text-sm">Group name required</span>
        </div>
      )}
    </div>
  );
};

export default GroupNameInput;
