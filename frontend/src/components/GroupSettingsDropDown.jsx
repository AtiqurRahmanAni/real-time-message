import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";

const GroupSettingsDropDown = ({ groupId }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const deleteMessages = () => {
    console.log("Message deleted");
  };
  return (
    <>
      <div className="text-right" onClick={(e) => e.stopPropagation()}>
        <Menu>
          <MenuButton onClick={(e) => e.stopPropagation()}>
            <IoSettingsSharp className="text-xl transition-transform duration-300 hover:rotate-90" />
          </MenuButton>

          <MenuItems
            anchor="bottom start"
            className="mt-1 w-36 origin-top-right rounded-xl border border-gray-700 bg-gray-800 p-1 text-sm/6 text-gray-200 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            <MenuItem>
              <button className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-white/10">
                Delete Group
              </button>
            </MenuItem>
            <div className="my-1 h-px bg-white/5" />
            <MenuItem>
              <button
                className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-white/10"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Delete Messages
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
      <DeleteConfirmationDialog
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        disableButtons={false}
        deleteFn={deleteMessages}
      />
    </>
  );
};

export default GroupSettingsDropDown;
