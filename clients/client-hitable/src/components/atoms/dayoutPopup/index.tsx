import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { HiX } from 'react-icons/hi';

export default function DayOutPopup({ children, show, onClose }: { children: React.ReactNode; show: boolean; onClose: () => void }) {
  const closeModalNothing = (e: any) => {
    // e.preventDefault()
  };
  return (
    <>
      <Transition appear show={show} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={(e) => closeModalNothing(e)}>
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
              <Dialog.Panel className="bg-base-100 relative w-full max-w-md rounded-t-2xl shadow-md">
                <div className="on_active_bounce absolute -top-8 left-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 transform items-center justify-center">
                  <HiX className="text-primary bg-base-100 cursor-pointer rounded-full p-2 text-4xl" onClick={onClose} />
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
