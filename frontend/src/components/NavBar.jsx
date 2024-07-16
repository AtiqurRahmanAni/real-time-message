import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContextProvider";
import { IoIosLogOut } from "react-icons/io";
import conversationStore from "../stores/conversationStore";

const NavBar = () => {
  const { logoutActions, user } = useAuthContext();
  const selectedConversation = conversationStore(
    (state) => state.selectedConversation
  );
  const mutation = useMutation({
    mutationFn: () => {
      return axiosInstance.post("/auth/logout", {});
    },
    onSuccess: (response) => {
      toast.success(response.data.message);
      logoutActions();
    },
    onError: (error) => {
      toast.error(
        error.response ? error.response.data.message : "Something went wrong"
      );
    },
  });

  // const queryClient = useQueryClient();

  // console.log(
  //   queryClient.getQueryData(["getMessages", selectedConversation?._id]),
  //   selectedConversation?._id
  // );

  return (
    <nav className="sticky top-0 left-0 p-3 bg-gray-200">
      <div className="m-auto flex justify-end container">
        <div className="flex gap-x-2 items-center">
          <div>
            <p>{user.displayName}</p>
          </div>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            <IoIosLogOut className="text-3xl" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
