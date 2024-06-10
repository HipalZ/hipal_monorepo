import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import AddStaff from '@/components/atom/addStaff';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import PopUp from '@/components/atom/popUp';
import Header from '@/components/molecules/header';
import useKitchenStore from '@/components/store/useKitchenStore';
import { useSelectedIcon } from '@/components/store/useSelectedIcon';
import type { IStaffs } from '@/components/types/businessData';
import { paths } from '@/components/utils/paths';
import type React from 'react';
import { memo, startTransition, useEffect, useState } from 'react';
import { BsChevronLeft, BsFillPersonFill } from 'react-icons/bs';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

type IProps = {
  setSelectedButton: (value: string) => void;
};
const AddKitchen = memo(({ setSelectedButton }: IProps) => {
  const navigate = useNavigate();
  const { setSelectedSubIcon } = useSelectedIcon();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffs, setStaffs] = useState<IStaffs[]>([]);
  const { selectedStaff, deselectStaff, kitchenName, setKitchenName, reset } = useKitchenStore();
  const [isNameError, setIsNameError] = useState(false);
  const { businessId } = useParams<{ businessId: string }>();
  const [loading, setLoading] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  function addStaff() {
    if (staffs?.length === 0) {
      setLoading(true);
      getStaffData();
    }
    setIsModalOpen(true);
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKitchenName(e.target.value);
    if (e.target.value.trim() !== '') {
      setIsNameError(false);
    }
  };

  const handleSubmit = async () => {
    if (kitchenName.trim() === '') {
      setIsNameError(true);
      return;
    }
    setLoading(true);
    const staffIds = selectedStaff.map((staff) => staff._id);
    const config = {
      businessId: businessId,
      kitchenName: kitchenName,
      description: kitchenName,
      staff: staffIds,
    };

    try {
      await axios.post('/v1/kitchens', config);
      toast.success(`${kitchenName} has been created`);
      startTransition(() => {
        navigate(`/app/business/${businessId}/kitchen?tab=kitchen`);
      });
      setSelectedSubIcon('kitchen');
    } catch (error) {
      console.error('Error creating kitchen:', error);
    }
    setLoading(false);
  };
  useEffect(() => {
    reset();
  }, [reset]);

  const getStaffData = async () => {
    try {
      const staffs = await axios.get(paths.getAllStaff(businessId || ''));
      setStaffs(staffs?.data);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleKitchenBack = () => {
    setSelectedButton('Kitchen');
    startTransition(() => {
      navigate(`/app/business/${businessId}/kitchen?tab=kitchen`);
    });
  };

  return (
    <div className="relative pb-[5rem]">
      <div className="sticky top-0 z-20 bg-[#f5f5f5]">
        <Header title="Kitchen" onBack={handleKitchenBack} leftIcon={<BsChevronLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={true} />
        <div className="mt-6 flex items-center justify-between border-b border-[#cacaca] px-6 pb-4">
          <div className="flex text-2xl">
            <span className="ml-2">Add a Kitchen</span>
          </div>
        </div>
      </div>
      <div className="border-1 mx-6 my-6 rounded-lg border border-[#CACACA] px-4">
        <div className="my-4">
          <h1 className="my-4 text-base font-semibold text-[#2B354D]">
            Name of the Kitchen {isNameError && <span className="text-red-500">*</span>}
          </h1>
          <input
            className={`w-full rounded-md ${isNameError ? 'border-red-500' : ''}`}
            type="text"
            placeholder="Name"
            value={kitchenName}
            onChange={handleNameChange}
          />
        </div>
      </div>
      <div className="border-1 mx-6 my-6 rounded-lg border border-[#CACACA] px-4">
        <div className="my-4 flex items-center justify-between">
          <h1 className="font-semibold text-[#2B354D]">Staff in the kitchen</h1>
          <div onClick={addStaff}>
            <button type="button" className="on_active_bounce border-1 rounded-md border px-4 py-1 ">
              Add
            </button>
          </div>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : (
          selectedStaff.length > 0 &&
          selectedStaff?.map((staff: IStaffs, index: number) => (
            <div key={index.toString()} className="border-1 my-4 rounded-md border p-3">
              <div className="flex items-center">
                <BsFillPersonFill />
                <h1 className="mx-2 text-base">{staff?.name}</h1>
              </div>
              <div className="mt-4 flex justify-between">
                <p className="text-sm text-[#2B354D]/30">{staff?.customRole?.[0].roleName}</p>
                <button type="button" onClick={() => deselectStaff(staff._id)} className="on_active_bounce text-[#2F80ED]">
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="fixed bottom-5 w-full px-6">
        <button
          type="button"
          onClick={handleSubmit}
          className={`${loading ? 'pointer-events-none opacity-50' : ''} on_active_bounce w-full rounded-md bg-[#2B354D] py-2.5 text-white`}
        >
          {loading ? 'Loading...' : 'Create'}
        </button>
      </div>

      {isModalOpen && (
        <PopUp show={isModalOpen} onClose={closeModal}>
          {loading ? <LoadingSpinner /> : ''}
          <AddStaff closeModal={closeModal} staffs={staffs} />
        </PopUp>
      )}
    </div>
  );
});

export default AddKitchen;
