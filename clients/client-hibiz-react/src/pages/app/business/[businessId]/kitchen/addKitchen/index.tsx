import Header from "@/components/molecules/header";
import type React from "react";
import { memo, startTransition, useEffect, useState } from "react";
import { BsChevronLeft, BsFillPersonFill } from "react-icons/bs";
import Hi from "@/assets/svg/hi.svg";
import PopUp from "@/components/atom/popUp";
import AddStaff from "@/components/atom/addStaff";
import axios from "@/axios";
import { paths } from "@/components/utils/paths";
import type { IStaffs } from "@/components/types/businessData";
import useKitchenStore from "@/components/store/useKitchenStore";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

const AddKitchen = memo(() => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffs, setStaffs] = useState<IStaffs[]>([])
  const { selectedStaff, deselectStaff, kitchenName, setKitchenName, reset } =
    useKitchenStore();
  const [isNameError, setIsNameError] = useState(false);
  const navigate = useNavigate()
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
    if (e.target.value.trim() !== "") {
      setIsNameError(false);
    }
  };

  const handleSubmit = async () => {
    if (kitchenName.trim() === "") {
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
      const response = await axios.post("/v1/kitchens", config);
      if(response.status===200){
        toast.success(`${kitchenName} has been created`);
        startTransition(()=>{
          navigate(`/app/business/${businessId}/kitchen?tab=Kitchen`);
        })
      }
    } catch (error) {
      console.error("Error creating kitchen:", error);
    }
  };
  useEffect(() => {
    reset();
  }, [reset]);

  const getStaffData = async () => {
    try {
      const staffs = await axios.get(paths.getAllStaff(businessId || ''));
      setStaffs(staffs?.data)
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="relative pb-[5rem]">
      <div className="bg-[#f5f5f5] sticky z-20 top-0">
        <Header
          leftIcon={<BsChevronLeft />}
          centerImage={Hi}
          rightImage={Hi}
          isIconBusinessShow={true}
        />
        <div className="flex justify-between items-center mt-6 px-6 pb-4 border-b border-[#cacaca]">
          <div className="flex text-2xl">
            <span className="ml-2">Add a Kitchen</span>
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
          <div onKeyDown={()=>addStaff()} onClick={() => addStaff()}>
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
                  <p className="text-sm text-[#2B354D]/30">
                    {staff?.customRole?.[0].roleName}
                  </p>
                  <button type="button"
                    onClick={() => deselectStaff(staff.id)}
                    className="on_active_bounce text-[#2F80ED]"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      <div className="fixed w-full px-6 bottom-5">
        <button
          type="button"
          onClick={handleSubmit}
          className="on_active_bounce text-white rounded-md bg-[#2B354D] py-2.5 w-full"
        >
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

export default AddKitchen
