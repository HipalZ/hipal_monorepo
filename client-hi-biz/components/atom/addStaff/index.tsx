import React, { memo } from "react";
import { BsFillPersonFill } from "react-icons/bs";
import type { IStaffs } from "@/components/types/businessData";
import useKitchenStore from "@/components/store/useKitchenStore";

const AddStaff = ({
  staffs,
  closeModal,
}: {
  staffs: IStaffs[];
  closeModal: () => void;
}) => {
  const { selectedStaff, selectStaff, deselectStaff } = useKitchenStore();

  const handleStaffSelection = (staff: IStaffs) => {
    if (selectedStaff.some((s) => s._id === staff._id)) {
      deselectStaff(staff._id);
    } else {
      selectStaff(staff);
    }
  };

  return (
    <div className="bg-[#F5F5F5] rounded-t-[1.5rem]">
      <div className="px-6 py-5 overflow-y-auto max-h-[85vh]">
        <h1 className="text-2xl text-[#2B354D]">Add staff to the zone</h1>
        {staffs?.map((staff) => {
          const isSelected = selectedStaff.some(
            (selected) => selected._id === staff._id
          );

          return (
            <div
              key={staff._id}
              onClick={() => handleStaffSelection(staff)}
              className={`${
                isSelected
                  ? "border-[#2B354D] border-2"
                  : "border-1 border-[#CACACA]"
              } bg-white rounded-md my-5 p-3 border`}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  className="mr-2 rounded-sm"
                />
                <BsFillPersonFill />
                <h1 className="mx-2 text-base">{staff.name}</h1>
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-sm text-[#2B354D]/70">
                  {staff.customRole?.[0]?.roleName}
                </p>
              </div>
            </div>
          );
        })}
        <div className="sticky my-6 bottom-5">
          <button
            type="button"
            onClick={closeModal}
            className="on_active_bounce text-white rounded-md bg-[#2B354D] py-2.5 w-full"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(AddStaff);
