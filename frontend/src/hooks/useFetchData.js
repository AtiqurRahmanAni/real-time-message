import { useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "../context/AuthContextProvider";
import toast from "react-hot-toast";

const useFetchData = (queryKey, url, options = {}) => {
  const { logoutActions } = useAuthContext();
  const { isLoading, error, data } = useQuery({
    queryKey,
    queryFn: () => axiosInstance.get(url),
    ...options,
  });

  useEffect(() => {
    if (error) {
      if (error.response && error.response.status === 401) {
        toast.error(error.response.data.message);
        logoutActions();
      }
    }
  }, [error, logoutActions]);

  return { isLoading, error, data };
};

export default useFetchData;
