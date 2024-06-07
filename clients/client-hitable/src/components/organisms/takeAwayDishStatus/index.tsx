import axios from '@/axios';
import DayOutPopup from '@/components/atoms/dayoutPopup';
import { useLogin } from '@/components/store/useLogin';
import { useOrderStore } from '@/components/store/useOrderStore';
import { PAGE_TYPES, routePaths } from '@/components/utils/routes';
import { useRouter } from 'next/router';
import type React from 'react';
import { useState } from 'react';
import { ImWarning } from 'react-icons/im';
import { MdKeyboardDoubleArrowRight } from 'react-icons/md';
import { toast } from 'react-toastify';
import { OrderHeader, StatusButton } from '../dishStatus';

const TakeAwayDishStatus: React.FC<{
  activeButton: string;
  setBtnActive: (str: boolean) => void;
  setActiveButton: (str: string) => void;
  setSelectedDish: (str: string) => void;
}> = ({ activeButton, setBtnActive, setActiveButton, setSelectedDish }) => {
  const router = useRouter();
  const { businessId, orderId, takeawayId } = router.query as {
    businessId: string;
    orderId: string;
    takeawayId: string;
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userName = useLogin((s) => s.userDetails.name);
  const currentOrder = useOrderStore((s) => s.currentOrder);
  const zoneName = useLogin((s) => s.zoneName);
  const [footButton, setFootButton] = useState('');
  const basicCheck = currentOrder?.orderId === orderId;
  const [password, setPassword] = useState('');

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };
  const openModal = (kot: any) => {
    setIsModalOpen(true);
  };

  const deleteKot = async () => {
    try {
      const config = {
        method: 'put',
        url: `/v1/kitchens/:id/orderBySwiggy?businessId=${businessId}&orderId=${orderId}`,
        body: {
          deletedBy: userName,
          zoneName: zoneName,
          password: password,
        },
      };
      const res = await axios(config);
      toast.error(`Order ${orderId} has been deleted by ${userName}`);
      router.push(routePaths[PAGE_TYPES.TAKE_AWAY](businessId, takeawayId));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="masonry-layout px-6 pb-12">
      <div className="bg-base-100 masonry-item relative rounded-t-2xl shadow-md">
        {basicCheck && (
          <>
            {' '}
            <div
              onClick={() => {
                openModal(currentOrder?.orderId);
                setFootButton('edit');
              }}
              className="text-primary absolute right-16 top-3.5"
            >
              manage
            </div>{' '}
            <OrderHeader kot={currentOrder?.kots?.[0]} />
          </>
        )}

        {basicCheck &&
          currentOrder?.kots?.map((kot, index) => (
            <>
              <div key={kot.id} className={`relative mb-4 ${kot.match ? 'bg-base-100' : 'bg-[#FF6262]/20'} `}>
                <div className="mt-4 rounded-full border-2 border-gray-400/30" />
                <div className="flex flex-col justify-between">
                  <div className="flex items-center justify-between p-4">
                    <div className="font-normal">1 x {kot?.dish?.name}</div>
                  </div>
                  <div className="-mt-2 ml-6 opacity-70">
                    {kot?.dish?.extras && kot?.dish?.extras.map((extra, i) => <p key={i}>{extra?.name}</p>)}
                  </div>
                  <div className="pt-2">
                    {' '}
                    {!kot.match ? (
                      <div className="flex justify-between px-4 pb-6">
                        <div className="flex items-center justify-center space-x-2 text-sm text-[#CB202D]">
                          <ImWarning />
                          <div>Dish not found</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setBtnActive(true);
                            setActiveButton('pos');
                            setSelectedDish(kot.id);
                          }}
                          className="bg-base-100 text-primary rounded-full px-4 py-2 text-sm"
                        >
                          Add Dish
                        </button>
                      </div>
                    ) : (
                      <StatusButton kot={kot} />
                    )}
                  </div>
                </div>
              </div>
            </>
          ))}
      </div>
      {isModalOpen && (
        <DayOutPopup show={isModalOpen} onClose={() => setIsModalOpen(false)}>
          {footButton === 'edit' && (
            <>
              {' '}
              <div className="m-4 flex justify-between border-b-4 pb-2 text-sm">
                <div className="text-primary font-medium">Manage Order {orderId}</div>
                <div className="text-primary">{currentOrder?.kotTime?.slice(0, 5)}</div>
              </div>
              <div className="mx-4 my-8 flex items-center justify-between rounded-2xl border p-4 text-sm">
                <div className="flex">
                  <MdKeyboardDoubleArrowRight size={20} className="mr-2" />
                  Delete Order
                </div>
                <div
                  onClick={() => {
                    openModal(currentOrder?.orderId);
                    setFootButton('temp');
                  }}
                  className="font-medium text-red-500"
                >
                  Delete
                </div>
              </div>
            </>
          )}
          {footButton === 'temp' && (
            <div className="my-4 flex items-center justify-center">
              <div className="bg-base-100 px-6">
                <div className="mb-4 text-sm font-semibold">Are you sure, you want to delete order?</div>
                <p className="text-base-content/60 mb-4 text-sm">
                  Deleting an item will result in removing it from the running order and from the kitchen.
                </p>
                <span className="my-4 text-sm font-semibold">Password for deleting</span>
                <div className="pt-4">
                  <input
                    type="password"
                    placeholder="Enter password"
                    className="border-base-content focus:ring-primary mb-4 w-full rounded-xl border px-4 py-2 focus:border-transparent focus:outline-none focus:ring-1"
                    value={password}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className="mt-4 flex justify-between text-sm">
                  <button type="button" className="text-base-content mr-2 px-4 py-2 font-medium" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="button" className="text-base-100 bg-primary w-[40%] rounded-full px-4 py-2" onClick={deleteKot}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </DayOutPopup>
      )}
    </div>
  );
};

export default TakeAwayDishStatus;
