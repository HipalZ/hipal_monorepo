import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { Fragment, memo } from 'react';
import { HiX } from 'react-icons/hi';

function MemoMiddlePopUp({
  children,
  show,
  onClose,
  onSave,
  onlyPopUp,
}: {
  children: React.ReactNode;
  show: boolean;
  onClose?: () => void;
  onSave?: () => void;
  onlyPopUp?: boolean;
}) {
  const closeModalNothing = (e: any) => {
    // e.preventDefault();
  };

  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={(e) => closeModalNothing(e)}>
        <div className="z-100 pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden bg-black bg-opacity-70 px-6 backdrop-blur-sm">
          <TransitionChild
            as={Fragment}
            enter="transition ease-out duration-200 transform"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition ease-in duration-150 transform"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <DialogPanel className="bg-base-100 z-100 pointer-events-auto relative w-full max-w-xs rounded-[1.5rem] shadow-md">
              {children}
              {onlyPopUp ? null : (
                <>
                  <div
                    onClick={onClose}
                    className="on_active_bounce pointer-events-auto absolute -top-10 left-[48%] z-50 flex -translate-x-1/2 -translate-y-1/2 transform items-center justify-center"
                  >
                    <HiX className="cursor-pointer rounded-full bg-white p-2 text-4xl text-black" />
                  </div>
                  &nbsp;
                  {onSave ? (
                    <div onClick={onSave} className="mb-4 flex justify-center">
                      <button
                        type="button"
                        className="on_active_bounce text-base-100 pointer-events-auto z-50 mx-6 w-[90vw] rounded-full bg-[#7D68FE] py-[0.75rem] text-[18px] font-[600] leading-[1.15rem]"
                      >
                        Save
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}

const MiddlePopUp = memo(MemoMiddlePopUp);
export default MiddlePopUp;
