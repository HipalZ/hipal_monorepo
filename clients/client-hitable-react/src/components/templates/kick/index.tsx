import AddPeopleDine from "@/components/atoms/addPeopleDineIn";
import DayOutPopup from "@/components/atoms/dayoutPopup";
import { useTable } from "@/components/store/useTable";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import { startTransition, useState } from "react";
import { HiArrowLeft } from "react-icons/hi";
import { toast } from "react-toastify";
import AddTempDish from "@/components/molecules/addTempItem";
import { useNavigate, useParams } from "react-router-dom";
import axios from "@/components/utils/axios";

interface KickUserProps {
  setCurrentView: (view: string) => void;
}

export default function KickUser({setCurrentView}: KickUserProps) {
	const params = useParams<{
    businessId: string;
    zoneId: string;
		tableId: string;
	}>();
	const { tableId,businessId,zoneId } = params;
  const navigate = useNavigate();
  const [userKicked, setUserKicked] = useState(Boolean);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPeopleAdd, setIsPeopleAdd] = useState(false);
  const [tempDishModal, setTempDishModal] = useState(false);
  const [isMerge, setIsMerge] = useState(false);
  const { tableData, setTableData } = useTable();
  const openModal = () => {
    if (!userKicked) {
      setIsModalOpen(true);
    } else {
      setUserKicked(false);
    }
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleKickUser = async () => {
    const res = await axios.put(
      `/v1/zones/${zoneId}/tables/${tableId}/KickOutTable`
    );
    if (res.data.data) {
      startTransition(()=>{
        navigate(routePaths[PAGE_TYPES.TABLES](businessId || '', zoneId || ''));
      })
    }
    setUserKicked(true);
    setIsModalOpen(false);
  };

  const reserveUser = async () => {
    try {
      const url = `/v1/zones/updateTableReserve/table?tableId=${tableId}${tableData?.status?.toLowerCase() === "reserved" ? "&update=true" : ""}`;
  
      const res = await axios.put(url);
      if (res.data.data) {
        setTableData(res.data.data);
        startTransition(()=>{
          navigate(routePaths[PAGE_TYPES.TABLES](businessId || '', zoneId || ''));
        })
      }
    } catch (error) {
      if(error.response.status===400){
        toast.error(error.response.data.message);
      }
    }
  };



  const addPeople = () => {
    setIsPeopleAdd(true);
  };

  const [isUnmergeChecked, setIsUnmergeChecked] = useState(false)
  const showPopup = () => {
    if (tableData?.mergeTables?.length === 0) return toast.error("Table is not merged")
    setIsMerge(true)
  }
  const closePopUp = () => {
    setIsMerge(false)
  }
  async function unMergeTable() {
    if (tableData?.mergeTables?.length === 0) return toast.error("Table is not merged")
    if (tableData?.status === 'empty') {
      try {
        let config = {
          method: "put",
          url: "/v1/zones/:zoneId/settleMergeTables",
          data: {
            mergeTables: tableData?.mergeTables,
          },
        };
        const res = await axios(config);
        if (res.status === 200) {
          toast.success("Table Unmerged Successfully");
          setTableData({
            ...tableData,
            mergeTables: [],
            isMerge: false,
            hierarchy: "",
            parentTableId: "",
            parentZoneId: "",
          });
          setIsMerge(false);
          setCurrentView('pos')
        }
      } catch (err) { }
    } else {
      return toast.error("Table is not empty")
    }
  }
  return (
    <div className="bg-secondary min-h-screen relative pb-[5rem]">
      <div className="sticky z-20 top-0 bg-secondary flex items-center ml-[1.5rem] pt-[1.5rem] ">
      
          <HiArrowLeft onClick={()=>setCurrentView('pos')} className="mr-[1.5rem] text-2xl" />
        
        <div className="mr-4 text-xl font-bold capitalize text-base-content">
          {tableData?.name}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div className="flex justify-between px-6 py-6 mx-6 mt-6 bg-base-100 rounded-2xl">
          <div className="font-[500] capitalize text-base-content">HICODE</div>
          <div className="font-medium text-right capitalize text-base-content/40">
            {tableData?.hiCode}
          </div>
        </div>
        <div className="flex items-center justify-between py-4 mx-6 mt-6 bg-base-100 rounded-2xl">
          <div className="ml-6 font-medium text-base-content">
            Add people dining?
          </div>
          <div className="mt-2 mr-6">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" />

              <div
                onClick={addPeople}
                className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-base-100 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-base-100 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#F04B4B]"
              ></div>
            </label>
          </div>
        </div>
        <div
          onClick={() => setTempDishModal(true)}
          className="flex items-center justify-between py-4 mx-6 mt-6 bg-base-100 rounded-2xl"
        >
          <div className="ml-6 font-medium text-base-content">Add temp dish</div>
        </div>

        <div className="flex items-center justify-between py-6 mx-6 mt-6 bg-base-100 rounded-2xl">
          <div className="ml-6 font-medium text-base-content">Switch tables?</div>
          <div className="mt-2 mr-6">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" />

              <div
                onClick={()=>setCurrentView('switch')}
                className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-base-100 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-base-100 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#F04B4B]"
              ></div>
            </label>
          </div>
        </div>
        <div className="flex justify-between py-6 mx-6 mt-6 bg-base-100 rounded-2xl">
          <div className="ml-6 font-medium text-base-content">
            Reserve the table?
            <div className="mt-2 text-sm text-base-content/40">
              Blocks others to use table
            </div>
          </div>
          <div className="mt-4 mr-6">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                value=""
                className="sr-only peer"
                checked={
                  tableData?.status?.toLowerCase() === "reserved" ? true : false
                }
              />

              <div
                onClick={reserveUser}
                className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-base-100 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-base-100 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#F04B4B]"
              ></div>
            </label>
          </div>
        </div>
        <div className="flex justify-between px-6 py-6 mx-6 mt-6 bg-base-100 rounded-2xl">
          <div className="font-[500] capitalize text-base-content">
            kick User
            <div className="mt-2 text-sm text-base-content/40">
              Remove the User from the table
            </div>
          </div>

          <div className="mt-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                value=""
                className="sr-only peer"
                checked={userKicked}
              />
              <div
                onClick={openModal}
                className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-base-100 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-base-100 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#F04B4B]"
              ></div>
            </label>
          </div>
        </div>
        <div className="flex items-center justify-between py-6 mx-6 mt-6 bg-base-100 rounded-2xl">
          <div className="ml-6 font-medium text-base-content">Merge Tables?</div>
          <div className="mt-2 mr-6">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" disabled={tableData?.isMerge} className="sr-only peer" />
              <div
                onClick={()=>setCurrentView('merge')}
                className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-base-100 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-base-100 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#F04B4B]"
              ></div>
            </label>
          </div>
        </div>
        {tableData?.status === 'empty' && <div className="flex items-center justify-between py-6 mx-6 mt-6 bg-base-100 rounded-2xl">
          <div className="ml-6 font-medium text-base-content">UnMerge Tables?</div>
          <div className="mt-2 mr-6">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" disabled={!tableData?.isMerge} checked={isUnmergeChecked} onChange={() => setIsUnmergeChecked(!isUnmergeChecked)} />
              <div
                onClick={showPopup}
                className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-base-100 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-base-100 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#F04B4B]"
              ></div>
            </label>
          </div>
        </div>}
      </div>
      <DayOutPopup show={isModalOpen} onClose={closeModal}>
        <div className="mt-4 ml-4 text-xl font-bold capitalize text-base-content">
          {tableData?.name}
        </div>
        <div className="mt-4 ml-4 font-semibold">
          Do you want to kick the user?
        </div>
        <div className="flex justify-between mx-12 mt-6 pb-9">
          <span onClick={closeModal} className="text-sm">
            Cancel
          </span>
          <button
          type="button"
            onClick={handleKickUser}
            className="px-6 py-2 -mr-6 text-sm bg-primary text-base-100 rounded-3xl"
          >
            Kick Out
          </button>
        </div>
      </DayOutPopup>
      <DayOutPopup show={isMerge} onClose={closePopUp}>
        <div className="mt-4 ml-4 text-xl font-bold capitalize text-base-content">
          {tableData?.name}
        </div>
        <div className="mt-2 ml-4 font-semibold">
          Do you want to Unmerge the tables?
        </div>
        <div className="flex justify-between pb-4 mx-4 mt-6">
          <div onClick={closePopUp} className="w-[30%] px-6 py-2 text-sm bg-red-500 text-base-100 rounded-3xl text-center">
            Cancel
          </div>
          <button
          type="button"
            onClick={unMergeTable}
            className="w-[50%] px-6 py-2 text-sm bg-primary text-base-100 rounded-3xl"
          >
            Un Merge
          </button>
        </div>
      </DayOutPopup>
      <DayOutPopup show={isPeopleAdd} onClose={() => setIsPeopleAdd(false)}>
        <AddPeopleDine setCurrentView={setCurrentView} setIsPeopleAdd={setIsPeopleAdd} />
      </DayOutPopup>
      <DayOutPopup show={tempDishModal} onClose={() => setTempDishModal(false)}>
        <AddTempDish setCurrentView={setCurrentView} onClose={() => setTempDishModal(false)} />
      </DayOutPopup>
    </div>
  );
}
