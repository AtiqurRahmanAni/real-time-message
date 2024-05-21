import { Checkbox, Field, Label } from "@headlessui/react";

const Check = ({ id, label, selected, setSelected }) => {
  const setItem = (e) => {
    if (e) {
      setSelected((prev) => [...prev, { id: id, name: label }]);
    } else {
      setSelected((prev) => prev.filter((item) => item.id !== id));
    }
  };
  return (
    <Field className="flex items-center gap-2">
      <Checkbox
        checked={selected.some((item) => item.id === id)}
        onChange={setItem}
        className="group  block size-5 rounded border border-gray-400 bg-white data-[checked]:bg-blue-500"
      >
        <svg
          className="stroke-white opacity-0 group-data-[checked]:opacity-100"
          viewBox="0 0 14 14"
          fill="none"
        >
          <path
            d="M3 8L6 11L11 3.5"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Checkbox>
      <Label className="text-xl">{label}</Label>
    </Field>
  );
};

export default Check;
