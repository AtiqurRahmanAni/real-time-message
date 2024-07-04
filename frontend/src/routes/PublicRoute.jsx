import React from "react";
import { useAuthContext } from "../context/AuthContextProvider";
import { Navigate, Outlet } from "react-router-dom";
const PublicRoute = () => {
  const { user } = useAuthContext();

  return user ? <Navigate to="/" /> : <Outlet />;
};

export default PublicRoute;
