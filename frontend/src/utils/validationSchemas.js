import * as Yup from "yup";

export const logInSchema = Yup.object({
  username: Yup.string()
    .required("Required")
    .min(4, "Minimum 4 characters")
    .max(30, "Maximum 10 characters"),
  password: Yup.string().required("Required").min(4, "Minimum 4 characters"),
});

export const signUpSchema = Yup.object({
  username: Yup.string()
    .required("Required")
    .min(4, "Minimum 4 characters")
    .max(30, "Maximum 10 characters"),
  displayName: Yup.string()
    .required("Required")
    .min(4, "Minimum 4 characters")
    .max(30, "Maximum 10 characters"),
  password: Yup.string().required("Required").min(4, "Minimum 4 characters"),
});
