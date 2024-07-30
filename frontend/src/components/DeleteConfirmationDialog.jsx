import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";
import { MdDelete } from "react-icons/md";
import Button from "./Button";

const DeleteConfirmationDialog = ({
  isOpen,
  setIsOpen,
  deleteFn,
  disableButtons = false,
}) => {
  const close = () => {
    if (!disableButtons) {
      setIsOpen(false);
    }
  };

  return (
    <Transition appear show={isOpen}>
      <Dialog
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={close}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="py-8 w-full max-w-sm rounded-xl bg-gray-500 p-1">
                <DialogTitle
                  as="div"
                  className="text-red-600 flex justify-center"
                >
                  <MdDelete className="text-5xl" />
                </DialogTitle>
                <div>
                  <div>
                    <h1 className="text-center text-xl text-gray-200">
                      Are you sure want to delete
                    </h1>
                  </div>
                  <div className="flex justify-center gap-x-2 mt-4">
                    <Button
                      className="btn-danger"
                      onClick={() => deleteFn()}
                      disabled={disableButtons}
                    >
                      Delete
                    </Button>
                    <Button
                      className="btn-primary"
                      onClick={close}
                      disabled={disableButtons}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DeleteConfirmationDialog;
