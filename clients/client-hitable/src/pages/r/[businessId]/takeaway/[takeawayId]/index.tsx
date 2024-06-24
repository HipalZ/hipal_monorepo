import axios from '@/axios';
import HeaderButton from '@/components/atoms/buttons/headerButton';
import Loader from '@/components/atoms/loader';
import PopUp from '@/components/atoms/popUp';
import Header from '@/components/molecules/header';
import { useLogin } from '@/components/store/useLogin';
import { useOrderStore } from '@/components/store/useOrderStore';
import { PAGE_TYPES, newRoutes } from '@/components/utils/routes';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { BiPlus } from 'react-icons/bi';
import { HiSearch, HiX } from 'react-icons/hi';
import { ImWarning } from 'react-icons/im';
import { MdAlarm, MdDinnerDining } from 'react-icons/md';
import { SiGoogleassistant } from 'react-icons/si';
import { TbToolsKitchen2 } from 'react-icons/tb';
import { toast } from 'react-toastify';
import HiPalLogo from '../../../../../assets/svg/hipalLogoNew.svg';

const filterButtons = [
  {
    name: 'Delay',
    Icon: MdAlarm,
    text: 'Delay',
  },
  {
    name: 'Cooked',
    Icon: TbToolsKitchen2,
    text: 'Cooked',
  },
  {
    name: 'Cooking',
    Icon: SiGoogleassistant,
    text: 'Cooking',
  },
];
interface Dish {
  dishId: string;
  name: string;
  price: number;
  qty: number;
  comments: string;
  extras: {
    name: string;
    price: string;
    qty: number;
  }[];
}

interface Order {
  kotTime: string;
  orderId: string;
  dishStatus: string;
  kots: {
    businessId: string;
    kitchenId: string;
    zoneId: string;
    staffId: string;
    startedAt: number;
    cookedAt: number;
    status: string;
    dish: Dish;
    customerName: string;
    customerPhone: string;
    dishStatus: string;
    kotTime: string;
    tableName: string;
    dishType: string;
    category: string;
    date: string;
    kotDate: string;
    priority: boolean;
    isDeleted: boolean;
    inventory: boolean;
    orderId: string;
    id: string;
    match: boolean;
  }[];
  totalDishes: number;
  cookedDishes: number;
  isMatch: boolean;
}

const TakeAway = () => {
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const searchRef = useRef(null);
  const zoneName = useLogin((s) => s.zoneName);
  const [activeButton, setActiveButton] = useState('');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderId, setOrderId] = useState('');
  const setCurrentOrder = useOrderStore((state) => state.setCurrentOrder);
  const [loading, setLoading] = useState(false);

  const handleOnclick = (str: any) => {
    str = activeButton.length === 0 ? str : '';
    setActiveButton(str);
  };
  const router = useRouter();

  const { businessId, takeawayId } = router.query as {
    businessId: string;
    takeawayId: string;
  };

  const popOver = (search = '') => {
    if (search.length > 0) {
      if (!searchOpen) {
        setSearchOpen(true);
      }
    } else {
      setSearchOpen(false);
    }
  };

  const searchClick = () => {
    setSearchOpen(!searchOpen);
    setSearch('');
  };

  const handleOrderId = (e) => {
    setOrderId(e.target.value);
  };

  const handleClick = () => {
    const orderExists = orders.some((order) => order.orderId === orderId);
    if (orderExists) {
      toast.error('Order already exists');
    } else {
      router.push(newRoutes[PAGE_TYPES.TAKE_AWAY_ID](businessId, takeawayId, orderId));
    }
  };

  const getTakeAwayOrders = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const url = `/v1/kitchens/:id/orderBySwiggy?businessId?businessId=${businessId}&zoneId=${takeawayId}`;

      const response = await axios(url);
      const orders: Order[] = await response.data;
      console.log(orders);
      setOrders(orders);
    } catch (error) {
      console.log('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (takeawayId) {
      getTakeAwayOrders();
    }
  }, []);

  if (loading)
    return (
      <div>
        <Loader />
      </div>
    );

  const goBack = () => {
    console.log('goBack');
    router.push(`/r/${businessId}/zone`);
  };

  return (
    <div className="bg-secondary min-h-screen pb-[7rem]">
      {' '}
      <Header goBack={goBack}>
        <Image className="mr-6" width={68} height={25} src={HiPalLogo} alt="Hi Table Logo" />
      </Header>
      <div className="bg-secondary sticky top-0 z-50">
        <div className="flex justify-between">
          <div className={`${searchOpen ? 'hidden' : ''} text-base-content ml-6 mt-8 text-[1rem] font-bold capitalize leading-[1.25rem]`}>
            {zoneName}
          </div>
          <div ref={searchRef} onClick={searchClick} className={`${searchOpen ? 'mb-6 w-[100%]' : 'disabled w-[30%]'} mx-6 mt-6 `}>
            <label htmlFor="simple-search" className="sr-only">
              Search
            </label>
            <div className="relative">
              {searchOpen ? (
                <HiX className="text-primary/80 dark:text-primary pointer-events-none absolute inset-y-0 right-2 top-[0.625rem] flex h-4 w-4 items-center" />
              ) : (
                <HiSearch className="text-primary/80 dark:text-primary pointer-events-none absolute inset-y-0 right-2 top-[0.625rem] flex h-4 w-4 items-center" />
              )}
              <input
                onChange={(e) => {
                  setSearch(e.target.value);
                  popOver(e.target.value);
                }}
                value={search}
                type="text"
                id="simple-search"
                className="focus:border-primary  block w-full rounded-xl border border-gray-300 p-1.5 pl-4 text-sm text-gray-900 focus:outline-none"
                placeholder="Search"
                required
              />
            </div>
          </div>
        </div>
        <div className={`${searchOpen ? 'hidden' : ''} sticky mx-6 mt-6 flex justify-between pb-6`}>
          {filterButtons.map(({ name, Icon, text }, index) => (
            <HeaderButton
              onClick={() => handleOnclick(name)}
              key={`${index}${name}`}
              className={activeButton === name ? 'focus:text-primary focus:bg-primary/10 bg-blue-500 focus:rounded-full focus:font-semibold ' : ''}
            >
              <Icon className="text-primary -ml-1 mr-1 mt-1" />
              {text}
            </HeaderButton>
          ))}
        </div>
      </div>
      <div className="masonry-layout mx-6 mt-6">
        {orders.length === 0 ? (
          <p className="text-center text-gray-500">No orders found.</p>
        ) : (
          <div className="masonry-item">
            {orders?.map((order) => (
              <div
                onClick={() => {
                  setCurrentOrder(order);
                  router.push(newRoutes[PAGE_TYPES.TAKE_AWAY_ID](businessId, takeawayId, order?.orderId));
                }}
                key={order?.orderId}
                className={`flex-col-2 mb-4 flex items-center justify-between rounded-xl border p-4 ${
                  order.dishStatus === 'cooking' ? 'bg-primary/10' : ''
                }`}
              >
                <div>
                  <div className="text-primary">{order?.kotTime?.slice(0, 5)}</div>
                  <div className="font-semibold">{order?.orderId}</div>
                  {!order.isMatch ? (
                    <div className="flex items-center text-sm text-[#AA1821]">
                      <ImWarning className="mr-2" /> Action Required!
                    </div>
                  ) : (
                    <div className="opacity-60">{order?.dishStatus}</div>
                  )}
                </div>
                <div className="mr-6 flex flex-col items-center justify-center space-y-4">
                  <MdDinnerDining className="opacity-50" />
                  <div className="text-primary">
                    {' '}
                    {order?.totalDishes}/{order?.totalDishes}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div onClick={() => setIsOrderModalOpen(true)} className="on_active_bounce fixed bottom-6 left-0 right-0 flex justify-center">
        <button type="button" className="text-base-100 bg-primary flex items-center rounded-xl px-4 py-2 text-sm">
          <BiPlus className="mr-2 text-xl" /> Add new order
        </button>
      </div>
      {isOrderModalOpen && (
        <PopUp show={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)}>
          <div className="mx-6 mt-6">
            <div className="font-semibold">Please add order id</div>
            <div className="text-sm opacity-60 ">
              Add order id from <span className="text-primary">{zoneName}</span>{' '}
            </div>
            <div className="mt-4 flex items-center">
              <div className="text-base-100 bg-primary rounded-l-3xl px-4 py-2">NO</div>
              <input
                type="number"
                placeholder="Enter order number.."
                className="border-primary flex-grow rounded-r-3xl border px-3 py-[0.45rem] focus:outline-none"
                onChange={handleOrderId}
              />
            </div>
            <div className="flex items-end justify-end pb-6">
              <button type="button" onClick={handleClick} className="text-base-100 bg-primary on_active_bounce mt-6 rounded-full px-8 py-2">
                Confirm
              </button>
            </div>
          </div>
        </PopUp>
      )}
    </div>
  );
};

export default TakeAway;
