import { Fragment, memo } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { HiX } from "react-icons/hi";
import { CiGlobe } from "react-icons/ci";
import { cn } from "@/components/utils/helpers";
import { useLiteStore } from "@/components/store/useLiteStore";

function PopUp({
  children,
  show,
  onClose,
  status,
}: {
  children: React.ReactNode;
  show: boolean;
  onClose?: () => void;
  status?: string;
}) {
  const { viewData } = useLiteStore();
  const closeModalNothing = () => {
    // e.preventDefault()
  };
  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={closeModalNothing}
      >
        <div className="fixed inset-0 flex items-end justify-center bg-black backdrop-blur-sm bg-opacity-70">
          <TransitionChild
            as={Fragment}
            enter="transition ease-out duration-200 transform"
            enterFrom="opacity-0 translate-y-full"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150 transform"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-full"
          >
            <DialogPanel className={cn("relative w-full max-w-md shadow-md bg-white rounded-t-[1.5rem]", status?.length > 0 ? ' h-[85vh]' : '')}>
              <div className={cn("absolute z-50 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 on_active_bounce left-1/2", status?.length > 0 ? '' : '-top-8')}>
                <HiX
                  className="absolute -top-10 p-2 text-4xl text-black rounded-full cursor-pointer bg-white"
                  onClick={onClose}
                />
                {status && status.length > 0 ?
                  <article className={cn("flex items-center p-2 rounded-full", viewData?.alertType === "ONLINE" ? 'bg-green-100 ' : 'bg-red-100')}>
                    <span><CiGlobe size={24} /></span>&nbsp;
                    <h1 className="text-base">{status}</h1>
                  </article>
                  : null}
              </div>
              {children}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}

const PopUpMemo = memo(PopUp);
export default PopUpMemo;
