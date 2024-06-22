import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { Fragment, memo } from 'react';
import { HiX } from 'react-icons/hi';

function PopUp({ children, show, onClose }: { children: React.ReactNode; show: boolean; onClose: () => void }) {
  const closeModalNothing = (e: any) => {
    // e.preventDefault()
  };
  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={(e) => closeModalNothing(e)}>
        <div className="fixed inset-0 flex items-end justify-center bg-black bg-opacity-70 backdrop-blur-sm">
          <TransitionChild
            as={Fragment}
            enter="transition ease-out duration-200 transform"
            enterFrom="opacity-0 translate-y-full"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150 transform"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-full"
          >
            <DialogPanel className="bg-base-100 relative w-full max-w-md rounded-t-[1.5rem] shadow-md ">
              <div className="absolute z-50 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 on_active_bounce -top-8 left-1/2">
                <HiX className="p-2 text-4xl text-black bg-white rounded-full cursor-pointer" onClick={onClose} />
              </div>
              {children}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}

export default memo(PopUp);
