import React, { useState } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import GroupCreateDialog from "./GroupCreateDialog";
import GroupTabItem from "./GroupTabItem";

const GroupChatTab = ({ groups }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="border border-gray-600">
        <div>
          <button
            className="bg-blue-500 w-full py-2 text-white flex justify-center items-center gap-x-2 hover:bg-blue-500/90 transition-colors"
            onClick={() => setIsOpen(true)}
          >
            <IoMdAddCircleOutline className="text-xl" />
            <span>Create group</span>
          </button>
        </div>
        <ul className="w-56 max-h-[calc(100dvh-10rem)] overflow-y-scroll scrollbar-custom">
          {groups?.map((item) => (
            <GroupTabItem key={item._id} item={item} />
          ))}
        </ul>
      </div>
      <GroupCreateDialog isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};

export default GroupChatTab;
