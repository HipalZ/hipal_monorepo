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
    const staffIds = selectedStaff.map((staff) => staff.id);
    const config = {
      businessId: businessId,
      kitchenName: kitchenName,
      description: kitchenName,
      staff: staffIds,
    };

    try {
      await axios.put(`/v1/kitchens/${data.kitchen.id}`, config);
      toast.success(`${kitchenName} has been edited`);
      startTransition(() => {
        navigate(`/app/business/${businessId}/kitchen?tab=Kitchen`);
      });
    } catch (error) {
      console.error('Error creating kitchen:', error);
    }
  };

  useEffect(() => {
    const staffMembers = data.staffs.filter((staff) => data.kitchen.staff.includes(staff.id));

    initializeKitchen(data.kitchen.kitchenName, staffMembers);
  }, [data.kitchen, data.staffs, initializeKitchen]);
  useEffect(() => {
    const getEditKitchenData = async () => {
      try {
        const staffs = await axios.get(paths.getAllStaff(businessId || ''));
        const allDishes = await axios.get(`/v1/dishes?businessId=${businessId}&queryDish=true`);
        const singleKitchen = await axios.get(`/v1/kitchens/${kitchenId}`);
        const data = {
          dishes: allDishes?.data,
          staffs: staffs?.data,
          kitchen: singleKitchen?.data,
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
      <div className="sticky top-0 z-20 bg-[#f5f5f5]">
        <Header title="Kitchen" leftIcon={<BsChevronLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={true} />
        <div className="mt-6 flex items-center justify-between border-b border-[#cacaca] px-6 pb-4">
          <div className="flex text-2xl">
            <span className="ml-2">Edit a Kitchen</span>
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
          <div onKeyDown={addStaff} onClick={addStaff}>
            <button type="button" className="on_active_bounce border-1 rounded-md border px-4 py-1 ">
              Add
            </button>
          </div>
        </div>
        {selectedStaff.length > 0 &&
          selectedStaff?.map((staff: IStaffs) => {
            return (
              <div key={staff?.id} className="border-1 my-4 rounded-md border p-3">
                <div className="flex items-center">
                  <BsFillPersonFill />
                  <h1 className="mx-2 text-base">{staff?.name}</h1>
                </div>
                <div className="mt-4 flex justify-between">
                  <p className="text-sm text-[#2B354D]/30">{staff?.customRole?.[0].roleName}</p>
                  <button type="button" onClick={() => deselectStaff(staff.id)} className="on_active_bounce text-[#2F80ED]">
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
      </div>
      <div className="border-1 mx-6 mt-6 rounded-lg border border-gray-200 px-4 pb-2 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold text-[#2B354D]">Dishes in kitchen</h1>
        </div>
        <div>
          {data.dishes
            ?.filter((ele: Dish) => ele.kitchenId === data.kitchen.id)
            .map((dish: Dish) => {
              return (
                <div key={dish?.id} className="my-5 flex justify-between rounded-md border border-[#cacaca] p-4">
                  <div className="flex space-x-4">
                    <FoodType type={dish?.dishType as FOOD_TYPES} />
                    <span className="ml-4">{dish?.name}</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      <div className="fixed bottom-6 z-20 w-full px-4">
        <button
          type="button"
          onClick={handleSubmit}
          className={`${isLoading ? 'pointer-events-none opacity-50' : ''} on_active_bounce w-full rounded-md bg-[#2B354D] py-2.5 text-white`}
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
