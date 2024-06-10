import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import ACCharges from '@/components/atom/acCharges';
import AddTables from '@/components/atom/addTable';
import AddZoneStaffs from '@/components/atom/addZoneStaffs';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import PopUp from '@/components/atom/popUp';
import Header from '@/components/molecules/header';
import { useSelectedIcon } from '@/components/store/useSelectedIcon';
import type { ICharges, IDineIn, IStaffs, IZones } from '@/components/types/businessData';
import { zoneType } from '@/components/utils/helper';
import { paths } from '@/components/utils/paths';
import type React from 'react';
import { memo, startTransition, useState } from 'react';
import { BsChevronLeft, BsFillPersonFill } from 'react-icons/bs';
import { RiExchangeDollarLine } from 'react-icons/ri';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

export const classCard = {
  text: 'text-xl',
  background: 'bg-[#2B354D]',
  font: 'text-4xl',
  bg: 'bg-[#2F80ED]/10',
  color: 'text-white',
};
const AddZone = memo(({ refetchZoneData }: any) => {
  const navigate = useNavigate();
  const { setSelectedSubIcon } = useSelectedIcon();
  const [loading, setLoading] = useState(false);
  const { businessId } = useParams<{ businessId: string }>();
  const [zoneData, setZoneData] = useState<IZones>({
    businessId: businessId || '',
    zoneName: '',
    zoneType: 'select a zone type',
    startTime: '10:00',
    endTime: '10:00',
    staff: [],
    tables: [],
    Occupied: 0,
    charges: [],
  });
  const [staffs, setStaffs] = useState<IStaffs[]>([]);
  const [postStaffs, setPostStaffs] = useState<IStaffs[]>([]);
  const [postCharges, setPostCharges] = useState<ICharges[]>([]);
  const [acCharge, setAcCharge] = useState<ICharges[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [tableModal, setTableModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<IDineIn | any>({
    tables: [],
    zones: [],
    staffs: [],
    charges: [],
  });
  const fetchChargesData = async () => {
    try {
      const charges = await axios.get(paths.getChargesApi(businessId || ''));
      setAcCharge(charges?.data || []);
      setData({ charges: charges?.data });
    } catch (err) {
      console.log(err);
    }
    setIsLoading(false);
  };
  const fetchStaffData = async () => {
    try {
      const staffs = await axios.get(paths.getStaffApi(businessId || ''));
      setStaffs(staffs?.data || []);
      setData({ staffs: staffs?.data });
    } catch (err) {
      console.log(err);
    }
    setIsLoading(false);
  };

  const postZoneData = async () => {
    if (zoneData?.zoneType === 'select a zone type' || zoneData?.zoneName === '') {
      return toast.error('Please fill the details');
    }
    setLoading(true);
    try {
      const config = {
        url: paths.postZonesApi(),
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        data: zoneData,
      };
      const response = await axios(config);
      if (response?.status === 201 || response?.status === 200) {
        setZoneData(response?.data);
        toast.success('zone successfully created');
        refetchZoneData();
        startTransition(() => {
          navigate(`/app/business/${businessId}?tab=zone`);
        });
        setSelectedSubIcon('zone');
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const closeACModal = () => {
    setAddModalOpen(false);
  };
  async function addStaff() {
    setIsModalOpen(true);
    if (data?.staffs?.length > 0) return;
    setIsLoading(true);
    fetchStaffData();
  }
  async function createZone() {
    await postZoneData();
  }

  async function addACCharges() {
    setAddModalOpen(true);
    if (data?.charges?.length > 0) return;
    setIsLoading(true);
    fetchChargesData();
  }
  function closeTableModal() {
    setTableModal(false);
  }
  function handleAddStaff(activeClick: IStaffs[]) {
    const staffIds = activeClick?.map((staff: IStaffs) => staff._id);
    setZoneData((prevZone) => {
      return {
        ...prevZone,
        staff: staffIds,
      };
    });
    setPostStaffs(activeClick);
    setIsModalOpen(false);
  }

  function removeStaff(indexToRemove: number) {
    setPostStaffs((prev: IStaffs[]) => prev.filter((_, index: number) => index !== indexToRemove));
  }
  function handleACCharges(activeClick: ICharges[]) {
    setPostCharges(activeClick);
    setZoneData((prevZone) => {
      return {
        ...prevZone,
        charges: activeClick,
      };
    });
    setAddModalOpen(false);
  }
  function removeACCharges(indexToRemove: number) {
    setPostCharges((prev: ICharges[]) => prev.filter((_, index: number) => index !== indexToRemove));
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
  return (
    <>
      <div className="sticky top-0 z-20 bg-[#f5f5f5]">
        <Header
          title="Zone"
          onBack={() => {
            setSelectedSubIcon('');
          }}
          leftIcon={<BsChevronLeft />}
          centerImage={Hi}
          rightImage={Hi}
          isIconBusinessShow={true}
        />
        <div className="mt-6 flex items-center justify-between border-b border-[#cacaca] px-6 pb-4">
          <div className="flex text-2xl">
            <span className="ml-2">Add a Zone</span>
          </div>
        </div>
      </div>
      <div className="pb-[10rem]">
        <div className="border-1 mx-6 my-6 rounded-lg border border-[#CACACA] px-4">
          <div className="my-4">
            <h1 className="my-4 text-base">
              Name of the zone <span className="text-red-500">*</span>
            </h1>
            <input onChange={(e) => handleAddZone(e)} value={zoneData?.zoneName} className="w-full rounded-md" type="text" placeholder="Name" />
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
                Add
              </button>
            </div>
          </div>
          {postStaffs?.map((staff: IStaffs, index: number) => {
            return (
              <div key={staff?._id} className="border-1 my-4 rounded-md border p-3">
                <div className="flex items-center">
                  <BsFillPersonFill />
                  <h1 className="mx-2 text-base">{staff?.name}</h1>
                </div>
                <div className="mt-4 flex justify-between">
                  <p className="text-sm text-[#2B354D]/70">{staff?.customRole?.[0]?.roleName}</p>
                  <button type="button" onClick={() => removeStaff(index)} className="on_active_bounce text-[#2F80ED]">
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="border-1 mx-6 my-6 rounded-lg border border-[#CACACA] px-4">
          <div className="my-4 flex justify-between">
            <h1 className="text-base text-[#2B354D]">Add Charges</h1>
            <div>
              <button type="button" onClick={addACCharges} className="on_active_bounce border-1 rounded-md border px-4 py-1 ">
                Add
              </button>
            </div>
          </div>
          {postCharges?.map((acChar: ICharges, index: number) => {
            return (
              <div key={acChar?._id} className="border-1 my-4 rounded-md border p-3">
                <div className="flex items-center">
                  <RiExchangeDollarLine />
                  <h1 className="mx-2 capitalize">{acChar?.chargeName}</h1>
                </div>
                <div className="mt-4 flex justify-between">
                  <p className="text-sm text-[#2B354D]/70">{acChar?.value}% on billing</p>
                  <button type="button" onClick={() => removeACCharges(index)} className="text-[#2F80ED]">
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="fixed bottom-5 w-full px-6">
          <button
            type="button"
            onClick={createZone}
            className={`${loading ? 'pointer-events-none opacity-50' : ''} on_active_bounce w-full rounded-md bg-[#2B354D] py-2.5 text-white`}
          >
            {loading ? 'Loading...' : 'Save'}
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
        {tableModal && (
          <PopUp show={tableModal} onClose={closeTableModal}>
            <AddTables
              zoneId={zoneData?._id}
              closeModal={closeTableModal}
              postStaffs={postStaffs}
              setTableModal={setTableModal}
              tableModal={tableModal}
            />
          </PopUp>
        )}
      </div>
      {isLoading && <LoadingSpinner />}
    </>
  );
});

export default AddZone;
