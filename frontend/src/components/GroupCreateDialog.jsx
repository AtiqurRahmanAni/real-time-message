import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import React, { Fragment, useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuthContext } from "../context/AuthContextProvider";
import UserSelectionCheckBox from "./UserSelectionCheckBox";
import Button from "./Button";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import GroupNameInput from "./GroupNameInput";

const GroupCreateDialog = ({ isOpen, setIsOpen }) => {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  //selectedUsers is an array of selectedUserIds
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");

  const users = queryClient.getQueryData(["getConversations"])?.data;

  const addUser = (userId) => {
    setSelectedUsers((prev) => [...prev, userId]);
  };

  const removeUser = (userId) => {
    selectedUsers.current = setSelectedUsers((prev) =>
      prev.filter((existingIds) => existingIds !== userId)
    );
  };

  const createGroupMutation = useMutation({
    mutationFn: (data) => axiosInstance.post("group-conversation/group", data),
    onSuccess: (response) => {
      toast.success(response.data.message);
    },
    onError: (error) => {
      toast.error(
        error.response ? error.response.data.message : "Something went wrong"
      );
    },
  });

  const closeDialog = (value) => {
    if (!createGroupMutation.isPending) {
      setIsOpen(false);
      setSelectedUsers([]);
      setGroupName("");
    }
  };

  const createGroup = () => {
    createGroupMutation.mutate({
      userIds: [user._id, ...selectedUsers],
      groupName,
    }); // create group including me
  };

  return (
    <Transition appear show={isOpen}>
      <Dialog
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={closeDialog}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md rounded-xl bg-gray-700 p-1 font-roboto">
                <div className="rounded-xl overflow-hidden p-5">
                  <table className=" w-full text-base text-left rtl:text-right text-gray-300">
                    <thead className="text-md text-gray-300 uppercase bg-gray-800/75">
                      <tr>
                        <th scope="col" className="px-4 py-3">
                          Username
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Display Name
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Select
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users?.map((user) => (
                        <tr key={user._id} className="text-base">
                          <td className="px-4 py-1">{user.username}</td>
                          <td className="px-4 py-1">{user.displayName}</td>
                          <td className="px-4 py-1">
                            <UserSelectionCheckBox
                              userId={user._id}
                              addUser={addUser}
                              removeUser={removeUser}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="ml-4 mt-2">
                    <GroupNameInput
                      groupName={groupName}
                      setGroupName={setGroupName}
                    />
                  </div>
                  <div className="flex justify-end mt-4">
                    {selectedUsers.length > 0 && (
                      <Button
                        className="btn-primary text-sm"
                        onClick={createGroup}
                        disabled={
                          createGroupMutation.isPending || groupName === ""
                        }
                      >
                        Create Group
                      </Button>
                    )}
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default GroupCreateDialog;
