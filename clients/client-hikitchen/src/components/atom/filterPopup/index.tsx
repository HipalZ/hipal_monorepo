import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function FilterPopup({ children, show, onClose }: { children: React.ReactNode; show: boolean; onClose: () => void }) {
  return (
    <>
      <Transition appear show={show} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <div className="fixed inset-0 flex items-start justify-end bg-black bg-opacity-50 lg:justify-start">
            <Transition.Child
              as={Fragment}
              enter="transition ease-out duration-500 transform"
              enterFrom="opacity-0 translate-x-full lg:-translate-x-full"
              enterTo="opacity-100 translate-x-0 lg:translate-x-0"
              leave="transition ease-in duration-200 transform"
              leaveFrom="opacity-100 translate-x-0"
              leaveTo="opacity-0 translate-x-full"
            >
              <Dialog.Panel className="relative mx-6 mt-[10vh] w-[45vw] min-w-[40vw] max-w-[50vw] rounded-2xl bg-white shadow-md md:w-[35vw] md:min-w-[30vw] md:max-w-[40vw] lg:ml-[22.5vw] lg:w-[20vw] lg:min-w-[20vw] lg:max-w-[25vw]">
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
