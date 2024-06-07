import axios from '@/axios';
import AddPeopleDine from '@/components/atoms/addPeopleDineIn';
import DayOutPopup from '@/components/atoms/dayoutPopup';
import AddTempDish from '@/components/molecules/addTempItem';
import { useTable } from '@/components/store/useTable';
import { PAGE_TYPES, routePaths } from '@/components/utils/routes';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { HiArrowLeft } from 'react-icons/hi';
import { toast } from 'react-toastify';

export default function KickUser({ setCurrentView }) {
  const router = useRouter();
  const { businessId, zoneId, tableId } = router.query as {
    businessId: string;
    zoneId: string;
    tableId: string;
  };
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
    const res = await axios.put(`/v1/zones/${zoneId}/tables/${tableId}/KickOutTable`);
    if (res.data) {
      router.push(routePaths[PAGE_TYPES.TABLES](businessId, zoneId));
    }
    setUserKicked(true);
    setIsModalOpen(false);
  };

  const reserveUser = async () => {
    try {
      const url = `/v1/zones/updateTableReserve/table?tableId=${tableId}${tableData?.status?.toLowerCase() === 'reserved' ? '&update=true' : ''}`;

      const res = await axios.put(url);
      if (res.data) {
        setTableData(res.data);
        router.push(routePaths[PAGE_TYPES.TABLES](businessId, zoneId));
      }
    } catch (error) {
      console.error('An error occurred while reserving the table:', error);
      toast.error('An error occurred while reserving the table');
    }
  };

  const addPeople = () => {
    setIsPeopleAdd(true);
  };

  const [isUnmergeChecked, setIsUnmergeChecked] = useState(false);
  const showPopup = () => {
    if (tableData?.mergeTables?.length === 0) return toast.error('Table is not merged');
    setIsMerge(true);
  };
  const closePopUp = () => {
    setIsMerge(false);
  };
  async function unMergeTable() {
    if (tableData?.mergeTables?.length === 0) return toast.error('Table is not merged');
    if (tableData?.status === 'empty') {
      try {
        let config = {
          method: 'put',
          url: '/v1/zones/:zoneId/settleMergeTables',
          data: {
            mergeTables: tableData?.mergeTables,
          },
        };
        const res = await axios(config);
        if (res.status === 200) {
          toast.success('Table Unmerged Successfully');
          setTableData({
            ...tableData,
            mergeTables: [],
            isMerge: false,
            hierarchy: '',
            parentTableId: '',
            parentZoneId: '',
          });
          setIsMerge(false);
          setCurrentView('pos');
        }
      } catch (err) {}
    } else {
      return toast.error('Table is not empty');
    }
  }
  return (
    <div className="bg-secondary relative min-h-screen pb-[5rem]">
      <div className="bg-secondary sticky top-0 z-20 ml-[1.5rem] flex items-center pt-[1.5rem] ">
        <HiArrowLeft onClick={() => setCurrentView('pos')} className="mr-[1.5rem] text-2xl" />

        <div className="text-base-content mr-4 text-xl font-bold capitalize">{tableData?.name}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div className="bg-base-100 mx-6 mt-6 flex justify-between rounded-2xl px-6 py-6">
          <div className="text-base-content font-[500] capitalize">HICODE</div>
          <div className="text-base-content/40 text-right font-medium capitalize">{tableData?.hiCode}</div>
        </div>
        <div className="bg-base-100 mx-6 mt-6 flex items-center justify-between rounded-2xl py-4">
          <div className="text-base-content ml-6 font-medium">Add people dining?</div>
          <div className="mr-6 mt-2">
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" value="" className="peer sr-only" />

              <div
                onClick={addPeople}
                className="peer-checked:after:border-base-100 after:bg-base-100 peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:transition-all after:content-[''] peer-checked:bg-[#F04B4B] peer-checked:after:translate-x-full peer-focus:outline-none dark:border-gray-600 dark:bg-gray-700"
              ></div>
            </label>
          </div>
        </div>
        <div onClick={() => setTempDishModal(true)} className="bg-base-100 mx-6 mt-6 flex items-center justify-between rounded-2xl py-4">
          <div className="text-base-content ml-6 font-medium">Add temp dish</div>
        </div>

        <div className="bg-base-100 mx-6 mt-6 flex items-center justify-between rounded-2xl py-6">
          <div className="text-base-content ml-6 font-medium">Switch tables?</div>
          <div className="mr-6 mt-2">
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" value="" className="peer sr-only" />

              <div
                onClick={() => setCurrentView('switch')}
                className="peer-checked:after:border-base-100 after:bg-base-100 peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:transition-all after:content-[''] peer-checked:bg-[#F04B4B] peer-checked:after:translate-x-full peer-focus:outline-none dark:border-gray-600 dark:bg-gray-700"
              ></div>
            </label>
          </div>
        </div>
        <div className="bg-base-100 mx-6 mt-6 flex justify-between rounded-2xl py-6">
          <div className="text-base-content ml-6 font-medium">
            Reserve the table?
            <div className="text-base-content/40 mt-2 text-sm">Blocks others to use table</div>
          </div>
          <div className="mr-6 mt-4">
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" value="" className="peer sr-only" checked={tableData?.status?.toLowerCase() === 'reserved' ? true : false} />

              <div
                onClick={reserveUser}
                className="peer-checked:after:border-base-100 after:bg-base-100 peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:transition-all after:content-[''] peer-checked:bg-[#F04B4B] peer-checked:after:translate-x-full peer-focus:outline-none dark:border-gray-600 dark:bg-gray-700"
              ></div>
            </label>
          </div>
        </div>
        <div className="bg-base-100 mx-6 mt-6 flex justify-between rounded-2xl px-6 py-6">
          <div className="text-base-content font-[500] capitalize">
            kick User
            <div className="text-base-content/40 mt-2 text-sm">Remove the User from the table</div>
          </div>

          <div className="mt-4">
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" value="" className="peer sr-only" checked={userKicked} />
              <div
                onClick={openModal}
                className="peer-checked:after:border-base-100 after:bg-base-100 peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:transition-all after:content-[''] peer-checked:bg-[#F04B4B] peer-checked:after:translate-x-full peer-focus:outline-none dark:border-gray-600 dark:bg-gray-700"
              ></div>
            </label>
          </div>
        </div>
        <div className="bg-base-100 mx-6 mt-6 flex items-center justify-between rounded-2xl py-6">
          <div className="text-base-content ml-6 font-medium">Merge Tables?</div>
          <div className="mr-6 mt-2">
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" disabled={tableData?.isMerge} className="peer sr-only" />
              <div
                onClick={() => setCurrentView('merge')}
                className="peer-checked:after:border-base-100 after:bg-base-100 peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:transition-all after:content-[''] peer-checked:bg-[#F04B4B] peer-checked:after:translate-x-full peer-focus:outline-none dark:border-gray-600 dark:bg-gray-700"
              ></div>
            </label>
          </div>
        </div>
        {tableData?.status === 'empty' && (
          <div className="bg-base-100 mx-6 mt-6 flex items-center justify-between rounded-2xl py-6">
            <div className="text-base-content ml-6 font-medium">UnMerge Tables?</div>
            <div className="mr-6 mt-2">
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  disabled={!tableData?.isMerge}
                  checked={isUnmergeChecked}
                  onChange={() => setIsUnmergeChecked(!isUnmergeChecked)}
                />
                <div
                  onClick={showPopup}
                  className="peer-checked:after:border-base-100 after:bg-base-100 peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:transition-all after:content-[''] peer-checked:bg-[#F04B4B] peer-checked:after:translate-x-full peer-focus:outline-none dark:border-gray-600 dark:bg-gray-700"
                ></div>
              </label>
            </div>
          </div>
        )}
      </div>
      <DayOutPopup show={isModalOpen} onClose={closeModal}>
        <div className="text-base-content ml-4 mt-4 text-xl font-bold capitalize">{tableData?.name}</div>
        <div className="ml-4 mt-4 font-semibold">Do you want to kick the user?</div>
        <div className="mx-12 mt-6 flex justify-between pb-9">
          <span onClick={closeModal} className="text-sm">
            Cancel
          </span>
          <button type="button" onClick={handleKickUser} className="bg-primary text-base-100 -mr-6 rounded-3xl px-6 py-2 text-sm">
            Kick Out
          </button>
        </div>
      </DayOutPopup>
      <DayOutPopup show={isMerge} onClose={closePopUp}>
        <div className="text-base-content ml-4 mt-4 text-xl font-bold capitalize">{tableData?.name}</div>
        <div className="ml-4 mt-2 font-semibold">Do you want to Unmerge the tables?</div>
        <div className="mx-4 mt-6 flex justify-between pb-4">
          <div onClick={closePopUp} className="text-base-100 w-[30%] rounded-3xl bg-red-500 px-6 py-2 text-center text-sm">
            Cancel
          </div>
          <button type="button" onClick={unMergeTable} className="bg-primary text-base-100 w-[50%] rounded-3xl px-6 py-2 text-sm">
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
