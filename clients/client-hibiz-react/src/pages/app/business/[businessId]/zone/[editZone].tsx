import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import ACCharges from '@/components/atom/acCharges';
import AddZoneStaffs from '@/components/atom/addZoneStaffs';
import DeleteConfirmationModal from '@/components/atom/deleteUser';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import PopUp from '@/components/atom/popUp';
import ErrorComponent from '@/components/errorComponent';
import Header from '@/components/molecules/header';
import type { ICharges, IEditZone, IStaffs, ITables, IZones } from '@/components/types/businessData';
import { zoneType } from '@/components/utils/helper';
import { paths } from '@/components/utils/paths';
import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { memo, startTransition, useEffect, useState } from 'react';
import { BsChevronLeft, BsFillPersonFill } from 'react-icons/bs';
import { MdOutlineTableBar } from 'react-icons/md';
import { RiExchangeDollarLine } from 'react-icons/ri';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { classCard } from '.';

const EditZone = () => {
  const navigate = useNavigate();
  const [zoneData, setZoneData] = useState<IZones>({});
  const [createdTable, setCreatedTable] = useState<ITables[]>([]);
  const [staffs, setStaffs] = useState<IStaffs[]>([]);
  const [postStaffs, setPostStaffs] = useState<IStaffs[]>([]);
  const [postCharges, setPostCharges] = useState<ICharges[]>([]);
  const [acCharge, setAcCharge] = useState<ICharges[]>([]);
  const [existingTable, setExistingTable] = useState<ITables[]>([]);
  const { businessId, editZone } = useParams<{
    businessId: string;
    editZone: string;
  }>();
  const [data, setData] = useState<IEditZone>({
    zone: {
      businessId: '',
      zoneName: '',
      zoneType: '',
      startTime: '',
      endTime: '',
      staff: [],
      tables: [],
      Occupied: 2,
      charges: [],
      id: '',
    },
    staff: [],
    tables: [],
    charges: [],
  });

  const fetchData = async () => {
    try {
      const zone = await axios.get(paths.getZoneById(editZone || ''));
      const staff = await axios.get(paths.getStaffApi(businessId || ''));
      const tables = await axios.get(paths.getTablesApi(businessId || ''));
      // const charges = await axios.get(paths.getChargesApi(businessId || ''));
      setData({
        zone: zone.data,
        staff: staff.data,
        tables: tables.data,
        // charges: charges.data,
      });
      return {
        zone: zone.data,
        staff: staff.data,
        tables: tables.data,
        // charges: charges.data,
      };
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const {
    isLoading,
    error,
    data: zonesData,
    refetch,
  } = useQuery({
    queryKey: ['zones', businessId, editZone],
    queryFn: fetchData,
    enabled: !!businessId && !!editZone,
  });

  useEffect(() => {
    setZoneData(data?.zone);
    const filteredTables = data?.tables?.filter((table: ITables) => table.zoneId === data?.zone?._id && data?.zone?.tables?.includes(table._id));
    setExistingTable(filteredTables);
    setStaffs(data?.staff);
    setAcCharge(data?.charges);
    const filteredStaffs = data?.staff?.filter((filStaff: IStaffs) => data?.zone?.staff?.includes(filStaff._id));
    setPostStaffs(filteredStaffs);
    const filteredCharges = data?.charges?.filter((charge: ICharges) =>
      data?.zone?.charges?.some((zoneCharge: ICharges) => zoneCharge._id === charge._id),
    );
    setPostCharges(filteredCharges);
  }, [data]);
  function handleAddStaff(activeClick: IStaffs[]) {
    setPostStaffs(activeClick);
    const staffIds = activeClick.map((staff: IStaffs) => staff._id);
    setZoneData((prevZone) => {
      return {
        ...prevZone,
        staff: staffIds,
      };
    });
    closeModal();
  }

  function handleACCharges(activeClick: any) {
    setPostCharges(activeClick);
    setZoneData((prevZone) => {
      return {
        ...prevZone,
        charges: activeClick,
      };
    });
    closeACModal();
  }
  function handleAddZone(e: React.ChangeEvent<HTMLInputElement>) {
    setZoneData((prevZone) => {
      return {
        ...prevZone,
        zoneName: e.target.value,
      };
    });
  }
  function handleAddType(e: React.ChangeEvent<HTMLSelectElement>) {
    setZoneData((prevZone) => {
      return {
        ...prevZone,
        zoneType: e.target.value,
      };
    });
  }
  function removeACCharges(idToRemove: string) {
    setPostCharges((prev: any) => prev.filter((charge: any) => charge._id !== idToRemove));
  }

  function removeStaff(idToRemove: string) {
    setPostStaffs((prev: any) => prev.filter((staff: any) => staff._id !== idToRemove));
  }

  const closeACModal = () => {
    setAddModalOpen(false);
  };
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };
  function addStaff() {
    setIsModalOpen(true);
  }
  const createTable = async () => {
    try {
      const config = {
        url: paths.postBulkTableApi(editZone || ''),
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          tables: createdTable,
        },
      };
      const response = await axios(config);
      return response?.data;
    } catch (err) {
      console.log(err);
    }
  };
  async function saveZone() {
    await createTable();
    try {
      const config = {
        url: paths.updateZonesApi(editZone || ''),
        method: 'PUT',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          ...zoneData,
          charges: postCharges,
          staff: postStaffs.map((staff) => staff._id),
          tables: existingTable.map((table) => table?._id),
        },
      };

      const response = await axios(config);
      if (response?.status === 201 || response?.status === 200) {
        setZoneData(response?.data);
        toast.success('zone successfully created');
        startTransition(() => {
          navigate(`/app/business/${businessId}`);
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  function addACCharges() {
    setAddModalOpen(true);
  }
  const [removePopup, setRemovePopup] = useState(false);

  const [selectedTableForDeletion, setSelectedTableForDeletion] = useState<ITables>({});

  function removeTable() {
    if (selectedTableForDeletion) {
      setExistingTable((existingTable) => existingTable?.filter((table) => table?._id !== selectedTableForDeletion?._id));
      setSelectedTableForDeletion({});
      setRemovePopup(false);
    }
  }

  function closePopUpModal() {
    setRemovePopup(false);
    setSelectedTableForDeletion({});
  }

  if (error) return <ErrorComponent refetch={refetch} />;
  if (isLoading) return <LoadingSpinner />;
  return (
    <>
      <div className="sticky top-0 z-20 bg-[#f5f5f5]">
        <Header leftIcon={<BsChevronLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={true} />
        <div className="mt-6 flex items-center justify-between border-b border-[#cacaca] px-6 pb-4">
          <div className="flex text-2xl">
            <span className="ml-2">Edit Zone</span>
          </div>
        </div>
      </div>
      <div className="pb-[10rem]">
        <div className="border-1 mx-6 my-6 rounded-lg border border-[#CACACA] px-4">
          <div className="my-4">
            <h1 className="my-2 text-base">
              Name of the zone <span className="text-red-500">*</span>
            </h1>
            <input className="w-full rounded-md" onChange={(e) => handleAddZone(e)} type="text" value={zoneData?.zoneName} />
            <div className="mt-4 font-medium">
              Zone Type <span className="text-red-500">*</span>
            </div>
            <div className="relative w-full">
              <select onChange={(e) => handleAddType(e)} value={zoneData?.zoneType} className="my-2 w-full rounded-md border p-2">
                {zoneType?.map((zone: any) => (
                  <option className="!bg-white !text-[#2B354D]" key={zone?._id} value={zone?.type}>
                    {zone?.type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="border-1 mx-6 my-6 rounded-lg border border-[#CACACA] px-4">
          <div className="my-4 flex justify-between">
            <h1>Staff in the zone</h1>
            <div onKeyDown={addStaff} onClick={addStaff}>
              <button type="button" className="on_active_bounce border-1 rounded-md border px-4 py-1 ">
                Edit
              </button>
            </div>
          </div>
          {postStaffs?.map((staff: IStaffs) => {
            return (
              <div key={staff?._id} className="border-1 my-4 rounded-md border p-3">
                <div className="flex items-center">
                  <BsFillPersonFill />
                  <h1 className="mx-2 text-base">{staff.name}</h1>
                </div>
                <div className="mt-4 flex justify-between">
                  <p className="text-sm text-[#2B354D]/70">{staff?.customRole[0]?.roleName}</p>
                  <button type="button" onClick={() => removeStaff(staff?._id)} className="on_active_bounce text-[#2F80ED]">
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="border-1 mx-6 my-6 rounded-lg border border-[#CACACA] px-4">
          <div className="my-4 flex justify-between">
            <h1 className="text-base text-[#2B354D]">Edit Charges</h1>
            <div>
              <button type="button" onClick={addACCharges} className="on_active_bounce border-1 rounded-md border px-4 py-1 ">
                Edit
              </button>
            </div>
          </div>
          {postCharges?.map((acChar: ICharges) => {
            return (
              <div key={acChar?._id} className="border-1 my-4 rounded-md border p-3">
                <div className="flex items-center">
                  <RiExchangeDollarLine />
                  <h1 className="mx-2 capitalize">{acChar?.chargeName}</h1>
                </div>
                <div className="mt-4 flex justify-between">
                  <p className="text-sm text-[#2B354D]/70">{acChar?.value}% on billing</p>
                  <button type="button" onClick={() => removeACCharges(acChar?._id || '')} className="text-[#2F80ED]">
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="border-1 mx-6 mt-6 rounded-lg border border-gray-200 p-4 ">
          <h1 className="text-base font-semibold text-[#2B354D]">Tables</h1>
          <div className="mt-3 space-y-3">
            {existingTable?.map((table) => {
              return (
                <div key={table?._id}>
                  <div className="on_active_bounce flex w-full items-center justify-between rounded-lg border border-[#CACACA] p-2">
                    <div className="on_active_bounce flex items-center space-x-1">
                      <MdOutlineTableBar className={`${classCard.font} ${classCard.bg} rounded-full px-2`} />
                      <div className="px-2 text-base font-medium">{table?.name}</div>
                    </div>
                  </div>
                  {removePopup && (
                    <PopUp show={removePopup} onClose={closePopUpModal}>
                      <DeleteConfirmationModal
                        text={`Are you sure you want to remove ${selectedTableForDeletion?.name} from zone ?`}
                        closeModal={() => setRemovePopup(false)}
                        onDelete={removeTable}
                      />
                    </PopUp>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4">
            {createdTable?.map((table) => {
              return (
                <div key={table?._id} className="on_active_bounce space-y-6 rounded-lg border border-[#CACACA] p-2">
                  <div className="on_active_bounce">
                    <MdOutlineTableBar className={` ${classCard.font} ${classCard.bg} rounded-full px-2`} />
                  </div>
                  <div className={`${classCard.text} px-2 font-medium`}>{table?.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="sticky bottom-5 mx-6 my-6">
        <button type="button" onClick={saveZone} className="on_active_bounce w-full rounded-md bg-[#2B354D] py-2.5 text-white">
          Save
        </button>
      </div>
      {isModalOpen && (
        <PopUp show={isModalOpen} onClose={closeModal}>
          <AddZoneStaffs handleData={handleAddStaff} Data={staffs} selectedData={postStaffs} />
        </PopUp>
      )}
      {addModalOpen && (
        <PopUp show={addModalOpen} onClose={closeACModal}>
          <ACCharges handleACCharges={handleACCharges} acCharges={acCharge} selectedData={postCharges} />
        </PopUp>
      )}
    </>
  );
};

export default memo(EditZone);
