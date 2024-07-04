import Button from "../components/Button";
import Input from "../components/Input";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import { signUpSchema } from "../utils/validationSchemas";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";

const SignUp = () => {
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: (data) => {
      return axiosInstance.post("/auth/signup", data);
    },
    onSuccess: (response) => {
      toast.success(response.data.message);
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
        initialValues={{ username: "", displayName: "", password: "" }}
        validationSchema={signUpSchema}
        onSubmit={(values) => mutation.mutate(values)}
      >
        <Form className="min-w-96 border border-gray-400 p-4 rounded-lg">
          <div>
            <h2 className="text-center text-2xl font-semibold mb-4">Sign Up</h2>
          </div>
          <Input label="Username" type="text" name="username" />
          <Input
            label="Display Name"
            className="mt-2"
            type="text"
            name="displayName"
          />
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
              disabled={mutation.isPending}
            >
              Sign Up
            </Button>
            <Button
              className="btn-secondary"
              onClick={() => navigate("/login")}
              disabled={mutation.isPending}
            >
              Login
            </Button>
          </div>
        </Form>
      </Formik>
    </div>
  );
};

export default SignUp;
