// biome-ignore lint/style/useImportType: <explanation>
import React, {  startTransition, useState } from "react";
import {
  MdHistory,
  MdMenuOpen,
  MdPerson,
} from "react-icons/md";
import { HiArrowLeft } from "react-icons/hi";
import ExtraModal from "@/components/atom/filterModal";
import { useMediaQuery } from "react-responsive";
import { PAGE_TYPES, singleRoute } from "@/components/utils/routes";
import { MdOutlineReceiptLong, MdOutlineSoupKitchen } from "react-icons/md";
import { useKotStore } from "@/components/store/useKot";
import { FiBox } from "react-icons/fi";
import { LuSettings2 } from "react-icons/lu";
import { BiBell, BiPhoneCall } from "react-icons/bi";
import FilterPopup from "@/components/atom/filterPopup";
import axios from '@/axios'
import { useUserLogin } from "@/components/store/useUserLogin";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  children: React.ReactNode;
  businessId: string | undefined;
}
interface User {
  _id: string;
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
      name: "Orders",
      Icon: MdOutlineReceiptLong,
    },
    {
      name: "Dishes",
      Icon: MdOutlineSoupKitchen,
    },
    {
      name: "History",
      Icon: MdHistory,
    },
    {
      name: "Inventory",
      Icon: FiBox,
    },
  ],
  filters: [
    {
      text: "Priority items",
      background: "bg-[#F04B4B]",
    },
    {
      text: "Deleted items",
      background: "bg-[#131540]",
    },
    {
      text: "No filters",
      background: "bg-transparent",
    },
  ],
  extraOptions: [
    {
      text: "filter",
      Icon: LuSettings2,
    },
    {
      text: "call",
      Icon: BiPhoneCall,
    },

    {
      text: "bell",
      Icon: BiBell,
    },
  ],
};

function Header({ children, businessId }: HeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 1080 });
  const filter = useKotStore((s) => s.filter);
  const setFilter = useKotStore((s) => s.setFilter);
  const updatedFilters = useKotStore((s) => s.updatedFilters);
  const setUpdatedFilters = useKotStore((s) => s.setUpdatedFilters);
  const [modalType, setModalType] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userList, setUserList] = useState<User[]>([]);
  const kitchenName = useUserLogin((s) => s.kitchenName);
  const navigate = useNavigate()
  const handleTableClick = () => {
    startTransition(()=>{
      navigate(singleRoute[PAGE_TYPES.KITCHENS](businessId || ''));
    })
  };

  const openModal = (type: string) => {
    if(type === 'call'){
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
      toast.error("No user ID selected");
      return;
    }

    try {
      await axios.post(
        "/v1/kitchens/User/WaiterCalling",
        { businessId: businessId },
        {
          params: {
            kitchen: true,
            staffId: userId,
            kitchenName: kitchenName,
          },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      closeModal();
      setSelectedUser(null);
    } catch (error) {
      closeModal();
      toast.error("Can not alert the staff");
      console.log(error);
    }
  };
  const fetchUsers = async () => {
    try {
      const response = await axios(
        `/v1/users/${businessId}`
      );
      const data: User[] = await response.data;
      setUserList(data);
    } catch (error) {
      console.error("Error fetching user list:", error);
    }
  };


  return (
    <div className="relative pb-4">
      <div className="flex justify-between mx-[1.5rem] pt-[1rem] sticky top-0 z-50 bg-[#f5f5f5]">
        <div className="flex items-center justify-center">
          <HiArrowLeft
            onClick={handleTableClick}
            className="mr-[1.5rem] text-2xl"
          />
          {children}
          {isMobile ? (
            ""
          ) : (
            <div className="flex items-center text-[#143F40] ml-12 space-x-6">
              {mainArr.extraOptions.map((item, index) => (
                <div
                  onKeyDown={() => openModal(item.text)}
                  key={index.toString()}
                  onClick={() => openModal(item.text)}
                  onKeyUp={() => openModal(item.text)}
                  className={`relative ${
                    item.text === "filter" && updatedFilters !== "No filters"
                      ? "border border-[#143F40] rounded-2xl pr-2 pl-6 py-1"
                      : ""
                  }`}
                >
                  <item.Icon className="text-2xl" />
                  {item.text === "filter" &&
                    updatedFilters !== "No filters" && (
                      <span
                        className={`absolute top-2 left-2 w-4 h-4 rounded-full ${
                          updatedFilters === "Priority items"
                            ? "bg-[#F04B4B]"
                            : updatedFilters === "Deleted items"
                            ? "bg-[#131540]"
                            : ""
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
                  item.text === "filter" && updatedFilters !== "No filters"
                    ? "border border-[#143F40] rounded-2xl pr-2 pl-6 py-1"
                    : ""
                }`}
              >
                <item.Icon className="text-xl" />
                {item.text === "filter" && updatedFilters !== "No filters" && (
                  <span
                    className={`absolute top-1.5 left-2 w-4 h-4 rounded-full ${
                      updatedFilters === "Priority items"
                        ? "bg-[#F04B4B]"
                        : updatedFilters === "Deleted items"
                        ? "bg-[#131540]"
                        : ""
                    }`}
                  />
                )}
              </div>
            ))}
            <MdMenuOpen
              onClick={() => openModal("extra")}
              className="text-2xl "
            />
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-4">
            {mainArr.headerButton.map((item, index) => (
              <div
              key={index.toString()}
                onKeyDown={() => {
                  if (item.name !== "Inventory") {
                    handleNavigation(item.name);
                  }
                }}
                onClick={() => {
                  if (item.name !== "Inventory") {
                    handleNavigation(item.name);
                  }
                }}
                className={`px-4 py-2 text-xl flex items-center justify-center rounded-2xl ${
                  filter === item.name
                    ? "bg-[#143F40] text-white"
                    : "bg-white text-[#143F40]"
                }  ${
                  item.name === "Inventory"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <button
                type="button"
                  disabled={item.name === "Inventory"}
                  className="flex items-center justify-center"
                >
                  <item.Icon className="mr-2 text-xl" />
                  {item.name}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {isModalOpen && modalType === "extra" && (
        <ExtraModal show={isModalOpen} onClose={closeModal}>
          <div>
            <div className="flex justify-center font-semibold text-lg mr-6 ml-[1.5rem] pt-[2rem]">
              Navigation
            </div>
            {mainArr.headerButton.map((item, index) => (
              <div
                onClick={() => {
                  if (item.name !== "Inventory") {
                    handleNavigation(item.name);
                  }
                }}
                onKeyDown={() => {
                  if (item.name !== "Inventory") {
                    handleNavigation(item.name);
                  }
                }}
                key={index.toString()}
                className={`flex space-x-2 ml-[1.5rem] mt-4 pb-2 pt-1 mx-4 rounded-xl ${
                  filter === item.name ? " bg-[#50A466]/10" : ""
                } ${
                  item.name === "Inventory"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <item.Icon className="mt-1 ml-4 text-xl" />
                <button
                type="button"
                  disabled={item.name === "Inventory"}
                  className="mt-1 text-sm font-normal"
                >
                  {item.name}
                </button>
              </div>
            ))}
          </div>
        </ExtraModal>
      )}
      {isModalOpen && modalType === "call" && (
        <FilterPopup show={isModalOpen} onClose={closeModal}>
          <div className="relative pb-4">
            <div className="mx-4 mt-4 font-semibold">Call Staff</div>
            <div className="relative px-4 space-y-4 overflow-y-auto max-h-[50vh]">
              {userList.map((user) => (
                <div
                onKeyUp={() => setSelectedUser(user._id)}
                  key={user._id}
                  className={`px-2 py-2 flex items-center justify-start border border-[#143F40] cursor-pointer rounded-2xl mt-4 
             ${
               selectedUser === user._id
                 ? "bg-[#143F40]/100 text-white transition duration-500"
                 : "hover:bg-[#143F40]/10 text-[#143F40]"
             }`}
                  onClick={() => setSelectedUser(user._id)}
                >
                  <MdPerson className="mt-[0.125rem]" />
                  <span className="ml-2 capitalize">{user.name}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between w-full px-4 mt-4">
              <button
              type="button"
                onClick={() => callWaiter(selectedUser)}
                className="bg-[#FBA736] w-full text-black px-4 py-2 rounded-3xl on_active_bounce"
              >
                Call Staff
              </button>
            </div>
          </div>
        </FilterPopup>
      )}
      {isModalOpen && modalType == "filter" && (
        <FilterPopup show={isModalOpen} onClose={closeModal}>
          <div className="pb-6">
            <div className="mt-6 mb-2 ml-6 text-lg font-semibold md:text-xl lg:text-2xl xl:text-3xl">
              Filters
            </div>
            {mainArr.filters.map((item, index) => (
              <div
              key={'item'+index}
                onKeyDown={() => handleFilters(item.text)}
                onClick={() => handleFilters(item.text)}
                className={`grid items-center justify-start grid-cols-[3fr,1fr] py-2 transition-colors duration-500 rounded-2xl px-2 ml-4 mr-2 text-sm md:text-lg lg:text-xl xl:text-2xl ${
                  updatedFilters === item.text
                    ? " bg-[#50A466]/10 text-[#143F40]/80"
                    : "text-[#143F40]"
                }`}
              >
                <div className="">{item.text}</div>
                <div
                  className={`${item.background} text-center w-5 h-5 rounded-full`}
                />
              </div>
            ))}
          </div>
        </FilterPopup>
      )}
    </div>
  );
}

export default Header;
