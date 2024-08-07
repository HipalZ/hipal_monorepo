import { memo, Fragment } from "react";
import { Dialog, Transition, TransitionChild } from "@headlessui/react";
import { HiX } from "react-icons/hi";

const MemoCropperPopUp = ({
  children,
  show,
  onClose,
  onSave,
}: {
  children: React.ReactNode;
  show: boolean;
  onClose?: () => void;
  onSave?: () => void;
}) => {
  const closeModalNothing = (e: any) => {
    // e.preventDefault();
  };
  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={(e) => closeModalNothing(e)}
      >
        <div className="min-h-screen px-4 text-center">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-70" />
          </TransitionChild>

          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-xs p-2 my-8 overflow-y-auto text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex justify-end">
                <button
                  type="button"
                  className="inline-flex justify-center p-2 text-sm font-medium text-black bg-gray-200 rounded-full hover:bg-gray-300"
                  onClick={onClose}
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-2">{children}</div>
              <div className="flex justify-center mt-4">
                <button
                  type="button"
                  onClick={onSave}
                  className="on_active_bounce bg-[#7D68FE] text-base-100 z-50 mx-6 w-[90vw] rounded-full py-[0.75rem] text-[18px] font-[600] leading-[1.15rem] pointer-events-auto"
                >
                  Save
                </button>
              </div>
            </div>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

const CropperPopup = memo(MemoCropperPopUp);
export default CropperPopup;
