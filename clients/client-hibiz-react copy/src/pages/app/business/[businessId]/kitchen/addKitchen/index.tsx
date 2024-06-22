import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import AddStaff from '@/components/atom/addStaff';
import PopUp from '@/components/atom/popUp';
import Header from '@/components/molecules/header';
import useKitchenStore from '@/components/store/useKitchenStore';
import type { IStaffs } from '@/components/types/businessData';
import { paths } from '@/components/utils/paths';
import type React from 'react';
import { memo, startTransition, useEffect, useState } from 'react';
import { BsChevronLeft, BsFillPersonFill } from 'react-icons/bs';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const AddKitchen = memo(() => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffs, setStaffs] = useState<IStaffs[]>([]);
  const { selectedStaff, deselectStaff, kitchenName, setKitchenName, reset } = useKitchenStore();
  const [isNameError, setIsNameError] = useState(false);
  const navigate = useNavigate();
  const { businessId } = useParams<{ businessId: string }>();

  const closeModal = () => {
    setIsModalOpen(false);
  };

  function addStaff() {
    if (staffs?.length === 0) {
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
    const staffIds = selectedStaff.map((staff) => staff._id);
    const config = {
      businessId: businessId,
      kitchenName: kitchenName,
      description: kitchenName,
      staff: staffIds,
    };

    try {
      const response = await axios.post('/v1/kitchens', config);
      if (response.status === 200) {
        toast.success(`${kitchenName} has been created`);
        startTransition(() => {
          navigate(`/app/business/${businessId}/kitchen?tab=Kitchen`);
        });
      }
    } catch (error) {
      console.error('Error creating kitchen:', error);
    }
  };
  useEffect(() => {
    reset();
  }, [reset]);

  const getStaffData = async () => {
    try {
      const staffs = await axios.get(paths.getAllStaff(businessId || ''));
      setStaffs(staffs?.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="relative pb-[5rem]">
      <div className="sticky top-0 z-20 linear_gradient_background">
        <Header leftIcon={<FaArrowLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={true} />
        <div className="flex items-center justify-between px-6 pb-4 mt-6">
          <div className="flex text-2xl">
            <span className="ml-2">Add a Kitchen</span>
          </div>
        </div>
      </div>
      <div className="border-1 mx-6 my-6 rounded-lg border border-[#CACACA] px-4">
        <div className="my-4">
          <h1 className="my-4 text-base font-semibold text-[#000000]">
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
        <div className="flex items-center justify-between my-4">
          <h1 className="font-semibold text-[#000000]">Staff in the kitchen</h1>
          <div onKeyDown={() => addStaff()} onClick={() => addStaff()}>
            <button type="button" className="px-4 py-1 border rounded-md on_active_bounce border-1 ">
              Add
            </button>
          </div>
        </div>
        {selectedStaff.length > 0 &&
          selectedStaff?.map((staff: IStaffs, index: number) => {
            return (
              <div key={index.toString()} className="p-3 my-4 border rounded-md border-1">
                <div className="flex items-center">
                  <BsFillPersonFill />
                  <h1 className="mx-2 text-base">{staff?.name}</h1>
                </div>
                <div className="flex justify-between mt-4">
                  <p className="text-sm text-[#000000]/30">{staff?.customRole?.[0].roleName}</p>
                  <button type="button" onClick={() => deselectStaff(staff._id)} className="on_active_bounce text-[#2F80ED]">
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      <div className="fixed w-full px-6 bottom-5">
        <button type="button" onClick={handleSubmit} className="on_active_bounce w-full rounded-md bg-[#000000] py-2.5 text-white">
          Create
        </button>
      </div>

      {isModalOpen && (
        <PopUp show={isModalOpen} onClose={closeModal}>
          <AddStaff closeModal={closeModal} staffs={staffs} />
        </PopUp>
      )}
    </div>
  );
});

export default AddKitchen;
