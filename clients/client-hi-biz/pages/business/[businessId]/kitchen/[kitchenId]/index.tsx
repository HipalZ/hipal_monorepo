import Header from "@/components/molecules/header";
import type React from "react";
import { memo, useEffect, useState } from "react";
import { BsChevronLeft, BsFillPersonFill } from "react-icons/bs";
import Hi from "@/assets/svg/hi.svg";
import PopUp from "@/components/atom/popUp";
import AddStaff from "@/components/atom/addStaff";
import axios from "@/axios";
import { paths } from "@/components/utils/paths";
import type { Dish, IKitchen, IStaffs } from "@/components/types/businessData";
import useKitchenStore from "@/components/store/useKitchenStore";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import FoodType, { type FOOD_TYPES } from "@/components/atom/foodType";
import LoadingSpinner from "@/components/atom/loadingSpinner";

interface IData {
  dishes: Dish[];
  staffs: IStaffs[];
  kitchen: IKitchen;
}

const EditKitchen = () => {
  const [data, setData] = useState<IData>({
    dishes: [],
    staffs: [],
    kitchen: {
      businessId: "",
      kitchenName: "",
      description: "",
      staff: [],
      _id: ""
    },
  })
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    selectedStaff,
    deselectStaff,
    kitchenName,
    setKitchenName,
    initializeKitchen,
  } = useKitchenStore();
  const [isNameError, setIsNameError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { businessId, kitchenId } = router.query as { businessId: string, kitchenId: string };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  function addStaff() {
    setIsModalOpen(true);
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKitchenName(e.target.value);
    if (e.target.value.trim() !== "") {
      setIsNameError(false);
    }
  };

  const handleSubmit = async () => {
    if (kitchenName.trim() === "") {
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
      await axios.put(
        `/v1/kitchens/${data.kitchen._id}`,
        config
      );
      toast.success(`${kitchenName} has been edited`);
      router.push(`/business/${businessId}?tab=Kitchen`);
    } catch (error) {
      console.error("Error creating kitchen:", error);
    }
  };

  useEffect(() => {
    const staffMembers = data.staffs.filter((staff) =>
      data.kitchen.staff.includes(staff._id)
    );

    initializeKitchen(data.kitchen.kitchenName, staffMembers);
  }, [data.kitchen, data.staffs, initializeKitchen]);
  useEffect(() => {
    const getEditKitchenData = async () => {
      try {
        const staffs = await axios.get(paths.getAllStaff(businessId));
        const allDishes = await axios.get(
          `/v1/dishes?businessId=${businessId}&queryDish=true`,
        )
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
    }
    setIsLoading(true);
    getEditKitchenData()
  }, [businessId, kitchenId])

  return (
    <>
      <div className="bg-[#f5f5f5] sticky z-20 top-0">
        <Header
          title="Kitchen"
          leftIcon={<BsChevronLeft />}
          centerImage={Hi}
          rightImage={Hi}
          isIconBusinessShow={true}
        />
        <div className="flex justify-between items-center mt-6 px-6 pb-4 border-b border-[#cacaca]">
          <div className="flex text-2xl">
            <span className="ml-2">Edit a Kitchen</span>
          </div>
        </div>
      </div>
      <div className="rounded-lg mx-6 my-6 border border-1 border-[#CACACA] px-4">
        <div className="my-4">
          <h1 className="my-4 text-[#2B354D] font-semibold text-base">
            Name of the Kitchen{" "}
            {isNameError && <span className="text-red-500">*</span>}
          </h1>
          <input
            className={`w-full rounded-md ${isNameError ? "border-red-500" : ""
              }`}
            type="text"
            placeholder="Name"
            value={kitchenName}
            onChange={handleNameChange}
          />
        </div>
      </div>
      <div className="rounded-lg mx-6 my-6 border border-1 border-[#CACACA] px-4">
        <div className="flex items-center justify-between my-4">
          <h1 className="text-[#2B354D] font-semibold">Staff in the kitchen</h1>
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
                  <p className="text-sm text-[#2B354D]/30">
                    {staff?.customRole?.[0].roleName}
                  </p>
                  <button type="button"
                    onClick={() => deselectStaff(staff._id)}
                    className="on_active_bounce text-[#2F80ED]"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
      </div>
      <div className="px-4 pt-4 pb-2 mx-6 mt-6 border border-gray-200 rounded-lg border-1">
        <div className="flex items-center justify-between">
          <h1 className="text-base text-[#2B354D] font-semibold">
            Dishes in kitchen
          </h1>
        </div>
        <div>
          {data.dishes
            ?.filter((ele: Dish) => ele.kitchenId === data.kitchen._id)
            .map((dish: Dish) => {
              return (
                <div
                  key={dish?._id}
                  className="flex justify-between p-4 border border-[#cacaca] rounded-md my-5"
                >
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
        <button type="button"
          onClick={handleSubmit}
          className={`${isLoading ? 'pointer-events-none opacity-50' : ''} text-white bg-[#2B354D] rounded-md py-2.5 w-full on_active_bounce`}
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
};

export default memo(EditKitchen);
