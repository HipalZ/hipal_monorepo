import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function MenuPopup({ children, show, onClose }: { children: React.ReactNode; show: boolean; onClose: () => void }) {
  return (
    <>
      <Transition appear show={show} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={onClose}>
          <div className="hide-scrollbar fixed inset-0 overflow-y-auto">
            <div className="fixed inset-0 bg-black/80 opacity-80"></div>
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="bg-base-100 mx-4 w-full max-w-md transform overflow-hidden rounded-2xl text-left align-middle transition-all duration-300 ">
                  {children}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
