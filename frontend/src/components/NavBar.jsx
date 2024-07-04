import React from "react";
import Button from "./Button";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContextProvider";

const NavBar = () => {
  const { setUser } = useAuthContext();

  const mutation = useMutation({
    mutationFn: () => {
      return axiosInstance.post("/auth/logout", {});
    },
    onSuccess: (response) => {
      toast.success(response.data.message);
      setUser(null);
    },
    onError: (error) => {
      toast.error(
        error.response ? error.response.data.message : "Something went wrong"
      );
    },
  });

  return (
    <nav className="sticky top-0 left-0 p-3 bg-gray-200">
      <div className="m-auto flex justify-end container">
        <Button
          className="btn-primary"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default NavBar;
