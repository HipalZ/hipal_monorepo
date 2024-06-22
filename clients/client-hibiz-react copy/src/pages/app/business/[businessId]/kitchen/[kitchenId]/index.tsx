import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import AddStaff from '@/components/atom/addStaff';
import FoodType, { type FOOD_TYPES } from '@/components/atom/foodType';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import PopUp from '@/components/atom/popUp';
import Header from '@/components/molecules/header';
import useKitchenStore from '@/components/store/useKitchenStore';
import type { Dish, IKitchen, IStaffs } from '@/components/types/businessData';
import { paths } from '@/components/utils/paths';
import type React from 'react';
import { memo, startTransition, useEffect, useState } from 'react';
import { BsChevronLeft, BsFillPersonFill } from 'react-icons/bs';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

interface IData {
  dishes: Dish[];
  staffs: IStaffs[];
  kitchen: IKitchen;
}

const EditKitchen = memo(() => {
  const [data, setData] = useState<IData>({
    dishes: [],
    staffs: [],
    kitchen: {
      businessId: '',
      kitchenName: '',
      description: '',
      staff: [],
      id: '',
    },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { selectedStaff, deselectStaff, kitchenName, setKitchenName, initializeKitchen } = useKitchenStore();
  const [isNameError, setIsNameError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { businessId, kitchenId } = useParams<{ businessId: string; kitchenId: string }>();

  const closeModal = () => {
    setIsModalOpen(false);
  };

  function addStaff() {
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
      await axios.put(`/v1/kitchens/${data.kitchen._id}`, config);
      toast.success(`${kitchenName} has been edited`);
      startTransition(() => {
        navigate(`/app/business/${businessId}/kitchen?tab=Kitchen`);
      });
    } catch (error) {
      console.error('Error creating kitchen:', error);
    }
  };

  useEffect(() => {
    const staffMembers = data.staffs.filter((staff) => data.kitchen.staff.includes(staff._id));

    initializeKitchen(data.kitchen.kitchenName, staffMembers);
  }, [data.kitchen, data.staffs, initializeKitchen]);
  useEffect(() => {
    const getEditKitchenData = async () => {
      try {
        const staffs = await axios.get(paths.getAllStaff(businessId || ''));
        const allDishes = await axios.get(`/v1/dishes?businessId=${businessId}&queryDish=true`);
        const singleKitchen = await axios.get(`/v1/kitchens/${kitchenId}`);
        const data = {
          dishes: allDishes?.data.data,
          staffs: staffs?.data.data,
          kitchen: singleKitchen?.data.data,
        };
        setData(data);
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    };
    setIsLoading(true);
    getEditKitchenData();
  }, [businessId, kitchenId]);

  return (
    <>
      <div className="sticky top-0 z-20 linear_gradient_background">
        <Header title="Kitchen" leftIcon={<FaArrowLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={true} />
        <div className="flex items-center justify-between px-6 pb-4 mt-6">
          <div className="flex text-2xl">
            <span className="ml-2">Edit a Kitchen</span>
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
          <div onKeyDown={addStaff} onClick={addStaff}>
            <button type="button" className="px-4 py-1 border rounded-md on_active_bounce border-1 ">
              Add
            </button>
          </div>
        </div>
        {selectedStaff.length > 0 &&
          selectedStaff?.map((staff: IStaffs) => {
            return (
              <div key={staff?._id} className="p-3 my-4 border rounded-md border-1">
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
      <div className="px-4 pt-4 pb-2 mx-6 mt-6 border border-gray-200 rounded-lg border-1">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold text-[#000000]">Dishes in kitchen</h1>
        </div>
        <div>
          {data.dishes
            ?.filter((ele: Dish) => ele.kitchenId === data.kitchen._id)
            .map((dish: Dish) => {
              return (
                <div key={dish?._id} className="my-5 flex justify-between rounded-md border border-[#cacaca] p-4">
                  <div className="flex space-x-4">
                    <FoodType type={dish?.dishType as FOOD_TYPES} />
                    <span className="ml-4">{dish?.name}</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      <div className="fixed z-20 w-full px-4 bottom-6">
        <button
          type="button"
          onClick={handleSubmit}
          className={`${isLoading ? 'pointer-events-none opacity-50' : ''} on_active_bounce w-full rounded-md bg-[#000000] py-2.5 text-white`}
        >
          Save
        </button>
      </div>

      {isModalOpen && (
        <PopUp show={isModalOpen} onClose={closeModal}>
          <AddStaff closeModal={closeModal} staffs={data.staffs} />
        </PopUp>
      )}
      {isLoading && <LoadingSpinner />}
    </>
  );
});

export default EditKitchen;
