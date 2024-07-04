import { Outlet, Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContextProvider";
import NavBar from "../components/NavBar";

const PrivateRoute = () => {
  const { user } = useAuthContext();

  return user ? (
    <>
      <NavBar /> <Outlet />
    </>
  ) : (
    <Navigate to="/login" />
  );
};

export default PrivateRoute;
