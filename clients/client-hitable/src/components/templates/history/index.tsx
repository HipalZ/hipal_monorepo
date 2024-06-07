import HiPalLogo from '@/assets/svg/hipalLogoNew.svg';
import axios from '@/axios';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { memo, useEffect, useState } from 'react';
import { BiEdit, BiLeftArrowAlt } from 'react-icons/bi';
import { MdOutlineNoFood } from 'react-icons/md';

export const headerButtons = [
  { label: 'Accepted', value: 'isAccept', Icon: MdOutlineNoFood },
  { label: 'Edited', value: 'isEdit', Icon: BiEdit },
  { label: 'Reject', value: 'isReject', Icon: MdOutlineNoFood },
];

type Order = {
  date: string;
  id: string;
  _id: string;
  isAccept: boolean;
  isEdit: boolean;
  isReject: boolean;
  items: Item[];
  tableName: string;
  time: string;
  acceptedBy: string;
  editedBy: string;
  rejectedBy: string;
};

type Item = {
  dish: Dish;
  customerName: string;
  comments: string;
  dishId: string;
  extras: any[];
  name: string;
  price: number;
  qty: number;
};

type Dish = {
  dishId: string;
  name: string;
  price: number;
  qty: number;
  comments: string;
};

const History = ({ setCurrentView }) => {
  const router = useRouter();
  const { businessId, zoneId } = router.query as {
    businessId: string;
    zoneId: string;
  };
  const [orderHistoryData, setOrderHistoryData] = useState<Order[]>([]);
  const [selectedButton, setSelectedButton] = useState('');

  const getHistoryData = async () => {
    try {
      let url = `/v1/kitchens/:id/orders?businessId=${businessId}`;
      if (selectedButton) {
        url += `&${selectedButton}=true`;
      }
      const response = await axios.get(url);
      setOrderHistoryData(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  const handleButtonClick = (value) => {
    if (selectedButton === value) {
      setSelectedButton('');
      return;
    }
    setSelectedButton(value);
  };
  function handleBack() {
    setCurrentView('order');
  }
  useEffect(() => {
    getHistoryData();
  }, [selectedButton]);

  return (
    <div className="bg-secondary relative min-h-screen pb-[4rem]">
      <div className="bg-secondary sticky top-0 z-10">
        <div className="flex items-center space-x-4 p-6">
          <button onClick={handleBack}>
            <BiLeftArrowAlt size={24} />
          </button>
          <Image className="mr-6" width={68} height={25} src={HiPalLogo} alt="Hi Table Logo" />
        </div>

        <div className="flex justify-between">
          <div className="text-base-content ml-6 font-bold capitalize">Orders History</div>
          <div className="mr-6 font-bold capitalize">{orderHistoryData?.length || 0} orders</div>
        </div>
        <div className="mx-6 flex items-center justify-between space-x-4 py-4">
          {headerButtons.map((button) => (
            <button
              type="button"
              key={button.value}
              className={`bg-base-100 border-secondary rounded-full border px-4 py-2 text-sm ${
                selectedButton === button.value ? 'bg-primary text-white' : ''
              }`}
              onClick={() => handleButtonClick(button.value)}
            >
              <button.Icon className={`mr-2 inline-block ${selectedButton === button.value ? 'text-white' : 'text-primary'} `} />
              {button.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mx-6 space-y-4">
        {orderHistoryData?.map((order, index) => {
          console.log(selectedButton);
          if (selectedButton === 'isReject' && order.isEdit) {
            return null;
          }
          let bgColor = 'bg-base-100/50';
          let person = 'Pending';

          if (order.isEdit) {
            bgColor = 'bg-[#FFF3D3]/50';
            person = `Edited by ${order.editedBy}`;
          } else if (order.isAccept) {
            bgColor = 'bg-[#E3EFFF]/50';
            person = `Accepted by ${order.acceptedBy}`;
          } else if (order.isReject) {
            bgColor = 'bg-red-100/20';
            person = `Rejected by ${order.rejectedBy}`;
          }

          return (
            <div key={index} className={`p-4 ${bgColor} rounded-2xl`}>
              <div className="flex justify-between">
                <div className="font-medium capitalize">{person}</div>
                <div className="font-medium capitalize">{order?.tableName}</div>
              </div>
              <div className="border-primary/50 flex justify-between border-b-4 py-2 text-sm">
                <div className="opacity-60">{order?.items?.[0]?.customerName}</div>
                <div className="text-primary">{order?.time}</div>
              </div>
              {order.items.map((item, itemIndex) => (
                <div key={itemIndex} className="mt-4 flex space-x-4">
                  <div>{item?.dish?.qty} x</div>
                  <div>{item?.dish?.name}</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default memo(History);
