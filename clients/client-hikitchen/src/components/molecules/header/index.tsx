// biome-ignore lint/style/useImportType: <explanation>
import axios from '@/axios';
import ExtraModal from '@/components/atom/filterModal';
import FilterPopup from '@/components/atom/filterPopup';
import { useKotStore } from '@/components/store/useKot';
import { useUserLogin } from '@/components/store/useUserLogin';
import { PAGE_TYPES, singleRoute } from '@/components/utils/routes';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { BiBell, BiPhoneCall } from 'react-icons/bi';
import { FiBox } from 'react-icons/fi';
import { HiArrowLeft } from 'react-icons/hi';
import { LuSettings2 } from 'react-icons/lu';
import { MdHistory, MdMenuOpen, MdOutlineReceiptLong, MdOutlineSoupKitchen, MdPerson } from 'react-icons/md';
import { useMediaQuery } from 'react-responsive';
import { toast } from 'react-toastify';

interface HeaderProps {
  children: React.ReactNode;
  businessId: string;
}
interface User {
  name: string;
  email: string;
  phone: string;
  role: string;
  customRole: Array<any>;
  password: string;
  id: string;
}

const mainArr = {
  headerButton: [
    {
      name: 'Orders',
      Icon: MdOutlineReceiptLong,
    },
    {
      name: 'Dishes',
      Icon: MdOutlineSoupKitchen,
    },
    {
      name: 'History',
      Icon: MdHistory,
    },
    {
      name: 'Inventory',
      Icon: FiBox,
    },
  ],
  filters: [
    {
      text: 'Priority items',
      background: 'bg-[#F04B4B]',
    },
    {
      text: 'Deleted items',
      background: 'bg-[#131540]',
    },
    {
      text: 'No filters',
      background: 'bg-transparent',
    },
  ],
  extraOptions: [
    {
      text: 'filter',
      Icon: LuSettings2,
    },
    {
      text: 'call',
      Icon: BiPhoneCall,
    },

    {
      text: 'bell',
      Icon: BiBell,
    },
  ],
};

function Header({ children, businessId }: HeaderProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 1080 });
  const filter = useKotStore((s) => s.filter);
  const setFilter = useKotStore((s) => s.setFilter);
  const updatedFilters = useKotStore((s) => s.updatedFilters);
  const setUpdatedFilters = useKotStore((s) => s.setUpdatedFilters);
  const [modalType, setModalType] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userList, setUserList] = useState<User[]>([]);
  const kitchenName = useUserLogin((s) => s.kitchenName);

  const handleTableClick = () => {
    router.push(singleRoute[PAGE_TYPES.KITCHENS](businessId));
  };

  const openModal = (type: string) => {
    if (type === 'call') {
      fetchUsers();
    }
    setModalType(type);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFilters = (name: string) => {
    setUpdatedFilters(name);
    setTimeout(() => {
      closeModal();
    }, 200);
  };

  const handleNavigation = (name: string) => {
    setFilter(name);
    setTimeout(() => {
      closeModal();
    }, 250);
  };

  const callWaiter = async (userId: string | null) => {
    if (!userId) {
      toast.error('No user ID selected');
      return;
    }

    try {
      const response = await axios.post(
        '/v1/kitchens/User/WaiterCalling',
        { businessId: businessId },
        {
          params: {
            kitchen: true,
            staffId: userId,
            kitchenName: kitchenName,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      closeModal();
      setSelectedUser(null);
    } catch (error) {
      closeModal();
      toast.error('Can not alert the staff');
      console.log(error);
    }
  };
  const fetchUsers = async () => {
    try {
      const response = await axios(`/v1/users/${businessId}`);
      const data: User[] = await response.data;
      setUserList(data);
    } catch (error) {
      console.error('Error fetching user list:', error);
    }
  };

  return (
    <div className="relative pb-4">
      <div className="sticky top-0 z-50 mx-[1.5rem] flex justify-between bg-[#f5f5f5] pt-[1rem]">
        <div className="flex items-center justify-center">
          <HiArrowLeft onClick={handleTableClick} className="mr-[1.5rem] text-2xl" />
          {children}
          {isMobile ? (
            ''
          ) : (
            <div className="ml-12 flex items-center space-x-6 text-[#143F40]">
              {mainArr.extraOptions.map((item, index) => (
                <div
                  onKeyDown={() => openModal(item.text)}
                  key={index.toString()}
                  onClick={() => openModal(item.text)}
                  onKeyUp={() => openModal(item.text)}
                  className={`relative ${
                    item.text === 'filter' && updatedFilters !== 'No filters' ? 'rounded-2xl border border-[#143F40] py-1 pl-6 pr-2' : ''
                  }`}
                >
                  <item.Icon className="text-2xl" />
                  {item.text === 'filter' && updatedFilters !== 'No filters' && (
                    <span
                      className={`absolute left-2 top-2 h-4 w-4 rounded-full ${
                        updatedFilters === 'Priority items' ? 'bg-[#F04B4B]' : updatedFilters === 'Deleted items' ? 'bg-[#131540]' : ''
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {isMobile ? (
          <div className="flex items-center justify-center space-x-4">
            {mainArr.extraOptions.map((item, index) => (
              <div
                onKeyDown={() => openModal(item.text)}
                key={index.toString()}
                onClick={() => openModal(item.text)}
                className={`relative ${
                  item.text === 'filter' && updatedFilters !== 'No filters' ? 'rounded-2xl border border-[#143F40] py-1 pl-6 pr-2' : ''
                }`}
              >
                <item.Icon className="text-xl" />
                {item.text === 'filter' && updatedFilters !== 'No filters' && (
                  <span
                    className={`absolute left-2 top-1.5 h-4 w-4 rounded-full ${
                      updatedFilters === 'Priority items' ? 'bg-[#F04B4B]' : updatedFilters === 'Deleted items' ? 'bg-[#131540]' : ''
                    }`}
                  />
                )}
              </div>
            ))}
            <MdMenuOpen onClick={() => openModal('extra')} className="text-2xl " />
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-4">
            {mainArr.headerButton.map((item, index) => (
              <div
                key={index.toString()}
                onKeyDown={() => {
                  if (item.name !== 'Inventory') {
                    handleNavigation(item.name);
                  }
                }}
                onClick={() => {
                  if (item.name !== 'Inventory') {
                    handleNavigation(item.name);
                  }
                }}
                className={`flex items-center justify-center rounded-2xl px-4 py-2 text-xl ${
                  filter === item.name ? 'bg-[#143F40] text-white' : 'bg-white text-[#143F40]'
                }  ${item.name === 'Inventory' ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <button type="button" disabled={item.name === 'Inventory'} className="flex items-center justify-center">
                  <item.Icon className="mr-2 text-xl" />
                  {item.name}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {isModalOpen && modalType === 'extra' && (
        <ExtraModal show={isModalOpen} onClose={closeModal}>
          <div>
            <div className="ml-[1.5rem] mr-6 flex justify-center pt-[2rem] text-lg font-semibold">Navigation</div>
            {mainArr.headerButton.map((item, index) => (
              <div
                onClick={() => {
                  if (item.name !== 'Inventory') {
                    handleNavigation(item.name);
                  }
                }}
                onKeyDown={() => {
                  if (item.name !== 'Inventory') {
                    handleNavigation(item.name);
                  }
                }}
                key={index.toString()}
                className={`mx-4 ml-[1.5rem] mt-4 flex space-x-2 rounded-xl pb-2 pt-1 ${filter === item.name ? ' bg-[#50A466]/10' : ''} ${
                  item.name === 'Inventory' ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                <item.Icon className="ml-4 mt-1 text-xl" />
                <button type="button" disabled={item.name === 'Inventory'} className="mt-1 text-sm font-normal">
                  {item.name}
                </button>
              </div>
            ))}
          </div>
        </ExtraModal>
      )}
      {isModalOpen && modalType === 'call' && (
        <FilterPopup show={isModalOpen} onClose={closeModal}>
          <div className="relative pb-4">
            <div className="mx-4 mt-4 font-semibold">Call Staff</div>
            <div className="relative max-h-[50vh] space-y-4 overflow-y-auto px-4">
              {userList.map((user) => (
                <div
                  onKeyUp={() => setSelectedUser(user.id)}
                  key={user.id}
                  className={`mt-4 flex cursor-pointer items-center justify-start rounded-2xl border border-[#143F40] px-2 py-2 
             ${selectedUser === user.id ? 'bg-[#143F40]/100 text-white transition duration-500' : 'text-[#143F40] hover:bg-[#143F40]/10'}`}
                  onClick={() => setSelectedUser(user.id)}
                >
                  <MdPerson className="mt-[0.125rem]" />
                  <span className="ml-2 capitalize">{user.name}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex w-full items-center justify-between px-4">
              <button
                type="button"
                onClick={() => callWaiter(selectedUser)}
                className="on_active_bounce w-full rounded-3xl bg-[#FBA736] px-4 py-2 text-black"
              >
                Call Staff
              </button>
            </div>
          </div>
        </FilterPopup>
      )}
      {isModalOpen && modalType == 'filter' && (
        <FilterPopup show={isModalOpen} onClose={closeModal}>
          <div className="pb-6">
            <div className="mb-2 ml-6 mt-6 text-lg font-semibold md:text-xl lg:text-2xl xl:text-3xl">Filters</div>
            {mainArr.filters.map((item, index) => (
              <div
                key={index.toString()}
                onKeyDown={() => handleFilters(item.text)}
                onClick={() => handleFilters(item.text)}
                className={`ml-4 mr-2 grid grid-cols-[3fr,1fr] items-center justify-start rounded-2xl px-2 py-2 text-sm transition-colors duration-500 md:text-lg lg:text-xl xl:text-2xl ${
                  updatedFilters === item.text ? ' bg-[#50A466]/10 text-[#143F40]/80' : 'text-[#143F40]'
                }`}
              >
                <div className="">{item.text}</div>
                <div className={`${item.background} h-5 w-5 rounded-full text-center`} />
              </div>
            ))}
          </div>
        </FilterPopup>
      )}
    </div>
  );
}

export default Header;
