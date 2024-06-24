import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function MiddlePopUp({ children, show, onClose }: { children: React.ReactNode; show: boolean; onClose: () => void }) {
  const closeModalNothing = (e: any) => {
    // e.preventDefault()
  };
  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={(e) => closeModalNothing(e)}>
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 px-6 backdrop-blur-sm">
          <Transition.Child
            as={Fragment}
            enter="transition ease-out duration-200 transform"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition ease-in duration-150 transform"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Panel className="bg-base-100 relative w-full max-w-md rounded-[1.5rem] shadow-md ">
              {children}
              <div onClick={onClose} className="mb-4 flex justify-center">
                <button className="on_active_bounce bg-primary text-base-100 z-50 mx-6 w-[90vw] rounded-full py-[1rem] text-[18px] font-[600] leading-[1.15rem]">
                  Close
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
