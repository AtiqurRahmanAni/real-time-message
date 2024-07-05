import Input from "../components/Input";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import { logInSchema } from "../utils/validationSchemas";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import { useAuthContext } from "../context/AuthContextProvider";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const { setUser, initSocket } = useAuthContext();

  const mutation = useMutation({
    mutationFn: (credentials) => {
      return axiosInstance.post("/auth/login", credentials);
    },
    onSuccess: (response) => {
      toast.success("Login successful");
      setUser(response.data);
      initSocket();
    },
    onError: (error) => {
      toast.error(
        error.response ? error.response.data.message : "Something went wrong"
      );
    },
  });

  return (
    <div className="flex-1 flex justify-center items-center">
      <Formik
        initialValues={{ username: "", password: "" }}
        validationSchema={logInSchema}
        onSubmit={(values) => mutation.mutate(values)}
      >
        <Form className="min-w-96 border border-gray-400 p-4 rounded-lg">
          <div>
            <h2 className="text-center text-2xl font-semibold mb-4">Log In</h2>
          </div>
          <Input label="Username" type="text" name="username" />
          <Input
            label="Password"
            className="mt-2"
            type="password"
            name="password"
          />
          <div className="mt-4 flex justify-center gap-x-2">
            <Button
              className="btn-primary"
              type="submit"
              disabled={mutation.isLoading}
            >
              Login
            </Button>
            <Button
              className="btn-secondary"
              onClick={() => navigate("/signup")}
              disabled={mutation.isLoading}
            >
              Sign Up
            </Button>
          </div>
        </Form>
      </Formik>
    </div>
  );
};

export default Login;
