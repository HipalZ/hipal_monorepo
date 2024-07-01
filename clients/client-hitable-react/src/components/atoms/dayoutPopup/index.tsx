import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { HiX } from "react-icons/hi";

export default function DayOutPopup({
  children,
  show,
  onClose,
}: {
  children: React.ReactNode;
  show: boolean;
  onClose: () => void;
}) {
  const closeModalNothing = () => {
    // e.preventDefault()
  };
  return (
    <>
      <Transition appear show={show} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={closeModalNothing}
        >
          <div className="fixed inset-0 flex items-end justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <Transition.Child
              as={Fragment}
              enter="transition ease-out duration-500 transform"
              enterFrom="opacity-0 translate-y-full"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150 transform"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-full"
            >
              <Dialog.Panel className="relative w-full max-w-md shadow-md bg-base-100 rounded-t-2xl">
                <div className="absolute z-50 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 on_active_bounce -top-8 left-1/2">
                  <HiX
                    className="p-2 text-4xl rounded-full cursor-pointer text-primary bg-base-100"
                    onClick={onClose}
                  />
                </div>
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
