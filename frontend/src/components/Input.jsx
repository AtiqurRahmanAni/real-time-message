import { useField } from "formik";

const Input = ({ label, className, ...props }) => {
  const [field, meta, helpers] = useField(props);
  return (
    <div className={className || ""}>
      <label htmlFor={label} className="text-lg block">
        {label}
      </label>
      <input
        {...field}
        {...props}
        id={label}
        className="border border-gray-300 rounded-md w-full p-2"
      />
      {meta.touched && meta.error ? (
        <div className="text-red-500 font-sm pl-1">{meta.error}</div>
      ) : null}
    </div>
  );
};

export default Input;
