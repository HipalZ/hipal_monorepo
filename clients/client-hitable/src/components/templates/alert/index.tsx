import axios from '@/axios';
import HeaderButton from '@/components/atoms/buttons/headerButton';
import Loader from '@/components/atoms/loader';
import Assistance from '@/components/atoms/status/assistance';
import Clean from '@/components/atoms/status/clean';
import Cooked from '@/components/atoms/status/cooked';
import Kitchen from '@/components/atoms/status/kitchen';
import Paid from '@/components/atoms/status/paid';
import PaidOnline from '@/components/atoms/status/paidOnline';
import PaymentFail from '@/components/atoms/status/paymentFail';
import Settle from '@/components/atoms/status/settle';
import { useAlert } from '@/components/store/useAlert';
import { useLogin } from '@/components/store/useLogin';
import { useQuery } from '@tanstack/react-query';
import { Howl } from 'howler';
import { useRouter } from 'next/router';
import { memo, useState } from 'react';
import { BsFillCaretLeftFill, BsFillCaretRightFill } from 'react-icons/bs';
import { MdCreditCard } from 'react-icons/md';
import { SiGoogleassistant } from 'react-icons/si';
import { TbToolsKitchen2 } from 'react-icons/tb';
import { toast } from 'react-toastify';

const filterButtons = [
  {
    name: 'paid',
    Icon: MdCreditCard,
    text: 'Payments',
  },
  {
    name: 'cooked',
    Icon: TbToolsKitchen2,
    text: 'Kitchen',
  },
  {
    name: 'assist',
    Icon: SiGoogleassistant,
    text: 'Assistance',
  },
];

const STATUS_COMPONENT_MAP = {
  paid: Paid,
  paid_by_online: PaidOnline,
  fail: PaymentFail,
  cooked: Cooked,
  'need assistance': Assistance,
  'clean up': Clean,
  settle: Settle,
  kitchen: Kitchen,
  swiggy: Assistance,
};

function Alert() {
  const { paymentsData, alertData, setAlertData, setNewAlertsCount } = useAlert();
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeButton, setActiveButton] = useState('');
  const router = useRouter();
  const userDetail = useLogin((s) => s.userDetails);
  const [pageNumber, setPageNumber] = useState(1);

  const { businessId, zoneId } = router.query as {
    businessId: string;
    zoneId: string;
  };

  const handleOnclick = (str: string) => {
    const newActiveButton = activeButton === str ? '' : str;
    setActiveButton(newActiveButton);
  };

  const handleItemClick = async (alertId: string) => {
    try {
      const response = await axios.put(`/v1/kitchens/updateAlert/alert?alertId=${alertId}&businessId=${businessId}`);
      onAlertData();
    } catch (error) {
      toast.error('Error updating alert');
    }
  };

  async function onAlertData() {
    try {
      const response = await axios.get(
        `/v1/kitchens/get/AllAlertByWaiter?staffId=${userDetail?.id}&businessId=${businessId}&isAlertOn=true&zoneId=${zoneId}`,
      );
      const data = await response.data;
      setAlertData(data);
      setNewAlertsCount(data.length);
      return data;
    } catch (error) {
      toast.error('Error fetching alerts');
    }
  }

  const handlePrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const handleNextPage = () => {
    setPageNumber(pageNumber + 1);
  };

  const { isLoading, error, data } = useQuery({
    queryKey: ['fetchAlertData', businessId, pageNumber, userDetail?.id, zoneId],
    queryFn: onAlertData,
    enabled: !!businessId && !!pageNumber && !!userDetail?.id && !!zoneId,
  });

  const searchData = alertData.filter(
    (ele) =>
      ele?.message?.toLowerCase().includes(search.toLowerCase()) ||
      ele?.tableName?.toLowerCase().includes(search.toLowerCase()) ||
      ele?.status?.toLowerCase().includes(search.toLowerCase()),
  );

  async function clearAllAlerts() {
    try {
      const response = await axios.put(`/v1/kitchens/updateAlert/alert?businessId=${businessId}&clearAll=true`);
      if (response?.status === 200 || response?.status === 201) {
        const sound = new Howl({
          src: ['/sounds/trashSound.mp3'],
        });
        sound.play();
        onAlertData();
      }
    } catch (err) {
      console.log(err);
    }
  }
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }
  if (error) {
    <div className="flex h-screen items-center justify-center">
      <button onClick={onAlertData} className="btn" type="button">
        Retry
      </button>
    </div>;
  }
  return (
    <div className={' bg-secondary relative min-h-screen pb-20'}>
      <div className="bg-secondary sticky top-0 z-50">
        <div className="flex justify-between pb-6">
          <div className={`${searchOpen ? 'hidden' : ''} text-base-content ml-6 mt-8 text-[1rem] font-bold capitalize leading-[1.25rem]`}>Alerts</div>
          <div className="mr-6 flex items-center justify-end space-x-4">
            <div onClick={() => clearAllAlerts()} className={`${searchOpen ? 'hidden' : ''} mt-6`}>
              <button type="button" className="bg-base-100 on_active_bounce flex rounded-xl border px-5 py-2 text-sm">
                Clear All
              </button>
            </div>

            <div className={`${searchOpen ? 'mb-6 w-[100%] transition-all' : 'disabled w-[30%]'} mt-6 `}>
              <input
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                value={search}
                type="search"
                id="simple-search"
                className="focus:border-primary  block w-full rounded-xl border border-gray-300 p-1.5 pl-4 text-sm text-gray-900 focus:outline-none"
                placeholder="Search"
                required
              />
            </div>
          </div>
        </div>
        <div className={` sticky mx-6 flex justify-between pb-6 ${searchOpen ? 'hidden' : ''} `}>
          {filterButtons.map(({ name, Icon, text }, index) => (
            <HeaderButton
              className={activeButton === name ? 'focus:text-primary focus:bg-primary/10 bg-blue-500 focus:rounded-full focus:font-[500] ' : ''}
              onClick={() => handleOnclick(name)}
              key={index}
            >
              <Icon className="text-primary -ml-1 mr-1 mt-1" />
              {text}
            </HeaderButton>
          ))}
        </div>
      </div>

      <div className="bg-secondary space-y-4">
        <div className="bg-secondary space-y-4">
          {!searchOpen && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AlertList data={alertData} handleClick={handleItemClick} />
            </div>
          )}

          {searchOpen && search !== '' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AlertList data={searchData} handleClick={handleItemClick} />
            </div>
          )}
        </div>
        <div className="bg-secondary space-y-4">
          {!searchOpen && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AlertList data={paymentsData} handleClick={handleItemClick} />
            </div>
          )}

          {searchOpen && search !== '' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AlertList data={searchData} handleClick={handleItemClick} />
            </div>
          )}
        </div>
      </div>
      {!searchOpen && (
        <div className="bg-primary fixed bottom-0 z-20 w-full py-2 ">
          <div className="mx-[6rem] mt-2 flex justify-between pb-2">
            <button
              type="button"
              className={`bg-base-100 mr-2 rounded-full p-2 ${pageNumber === 1 ? 'disabled:cursor-not-allowed disabled:bg-gray-200' : ''}`}
              onClick={handlePrevPage}
            >
              <BsFillCaretLeftFill className="text-primary h-6 w-6" />
            </button>
            <div className="text-base-100 mt-1 text-[1.25rem]">{pageNumber}</div>

            <button
              type="button"
              className="bg-base-100 ml-2 rounded-full p-2 disabled:cursor-not-allowed disabled:bg-gray-200"
              onClick={handleNextPage}
            >
              <BsFillCaretRightFill className="text-primary h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(Alert);

const AlertList = ({ data, handleClick }) => {
  return data.map((ele, index) => {
    const Component = STATUS_COMPONENT_MAP[ele?.status?.toLowerCase()];
    return (
      <div key={`${ele?.status?.toLowerCase()}-${ele._id || index}`} onClick={() => handleClick(ele._id)}>
        {Component && <Component {...ele} />}
      </div>
    );
  });
};
