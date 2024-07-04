import { useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "../context/AuthContextProvider";
import toast from "react-hot-toast";

const useFetchData = (queryKey, url, options = {}) => {
  const { setUser } = useAuthContext();
  const { isLoading, error, data } = useQuery({
    queryKey,
    queryFn: () => axiosInstance.get(url),
    ...options,
  });

  useEffect(() => {
    if (error) {
      if (error.response && error.response.status === 401) {
        setUser(null);
      } else {
        toast.error("Something went wrong");
      }
    }
  }, [error, setUser]);

  return { isLoading, error, data };
};

export default useFetchData;
