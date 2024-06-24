import AddDishToCartButton from '@/components/atoms/addDishToCartButton';
import { handleDishQty } from '@/components/organisms/dishDescription/dishQuantityButton';
import ExtraWithDishWithSelect from '@/components/organisms/dishDescription/extras';
import { useBottomPanel } from '@/components/store/useBottomPanel';
import { useCart } from '@/components/store/useCart';
import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from 'next/router';
import { Fragment, memo } from 'react';
import { RxCross2 } from 'react-icons/rx';
import ChoosePortions from '../choosePortions';

function BottomPanel({ dishData, categoryName }) {
  const { closeBottomPanel, isBottomPanelOpened, openBottomPanel } = useBottomPanel();
  const validationExtras = useBottomPanel((s) => s.validationExtras);
  const setBounceButton = useBottomPanel((s) => s.setBounceButton);
  const variantType = useBottomPanel((s) => s.variantType);
  const cart = useCart((s) => s.cart);
  const setCart = useCart((s) => s.setCart);
  const router = useRouter();
  const { tableId } = router.query as {
    businessId: string;
    zoneId: string;
    tableId: string;
  };

  const checkValidation = () => {
    return validationExtras.every((item) => item);
  };

  const closeModal = () => {
    if (variantType === 'portion') {
      closeBottomPanel(dishData?._id);
    }
    const itemValidation = checkValidation();
    if (itemValidation) {
      closeBottomPanel(dishData?._id);
    } else {
      setBounceButton(true);
      setTimeout(() => setBounceButton(false), 1000);
    }
  };

  const closeNRemoveCartDish = () => {
    handleDishQty(
      tableId,
      cart,
      dishData,
      categoryName,
      openBottomPanel,
      setCart,
      closeBottomPanel,
    )(cart?.[tableId]?.[dishData?._id]?.variants?.length || 0);
  };
  const closeModalNothing = (e: any) => {
    // e.preventDefault()
  };

  return (
    <>
      <Transition show={isBottomPanelOpened(dishData?._id)} as={Fragment}>
        <Dialog as="div" className="relative !z-[99999999]" onClose={(e) => closeModalNothing(e)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="bg-base-content fixed inset-0 bg-opacity-30 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-x-0 bottom-0 mx-auto mt-10 h-screen overflow-y-auto ">
            <div className="h-56 w-screen" onClick={closeNRemoveCartDish}></div>
            <div className="flex min-h-full text-center ">
              <Transition.Child
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-8"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-8"
              >
                <Dialog.Panel className="bg-base-100 shadow-base-100 relative top-0 mx-auto min-h-[60vh] w-full max-w-md transform overflow-auto rounded-t-2xl py-3 text-left align-middle shadow-xl transition-all">
                  <div className="mb-12 mt-4 flex flex-col ">
                    <div className="absolute right-4 top-6">
                      <div className="bg-base-100 on_active_bounce mr-auto flex h-10 w-10 flex-row rounded-full" onClick={closeNRemoveCartDish}>
                        <div className="m-auto flex flex-row">
                          <RxCross2 size={24} className="text-primary text-3xl " />
                        </div>
                      </div>
                    </div>

                    <div className="divide-base-200 flex flex-col space-y-4 divide-y-2">
                      <ChoosePortions dishData={dishData} />

                      <div className="">
                        <ExtraWithDishWithSelect dishData={dishData} />
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
              <AddDishToCartButton onClick={closeModal}>
                <div className="flex flex-row space-x-2 capitalize">
                  <span className="my-auto">Add Dish to the cart</span>
                </div>
              </AddDishToCartButton>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
export default memo(BottomPanel);
