import useKitchenStore from '@/components/store/useKitchenStore';
import type { IStaffs } from '@/components/types/businessData';
import { memo } from 'react';
import { BsFillPersonFill } from 'react-icons/bs';

const AddStaff = memo(({ staffs, closeModal }: { staffs: IStaffs[]; closeModal: () => void }) => {
  const { selectedStaff, selectStaff, deselectStaff } = useKitchenStore();

  const handleStaffSelection = (staff: IStaffs) => {
    if (selectedStaff.some((s) => s._id === staff._id)) {
      deselectStaff(staff._id);
    } else {
      selectStaff(staff);
    }
  };

  return (
    <div className="rounded-t-[1.5rem] bg-[#F5F5F5]">
      <div className="max-h-[85vh] overflow-y-auto px-6 py-5">
        <h1 className="text-2xl text-[#2B354D]">Add staff to the zone</h1>
        {staffs?.map((staff) => {
          const isSelected = selectedStaff.some((selected) => selected._id === staff._id);

          return (
            <div
              key={staff._id}
              onClick={() => handleStaffSelection(staff)}
              className={`${isSelected ? 'border-2 border-[#2B354D]' : 'border-1 border-[#CACACA]'} my-5 rounded-md border bg-white p-3`}
            >
              <div className="flex items-center">
                <input type="checkbox" checked={isSelected} readOnly className="mr-2 rounded-sm" />
                <BsFillPersonFill />
                <h1 className="mx-2 text-base">{staff.name}</h1>
              </div>
              <div className="mt-2 flex justify-between">
                <p className="text-sm text-[#2B354D]/70">{staff.customRole?.[0]?.roleName}</p>
              </div>
            </div>
          );
        })}
        <div className="sticky bottom-5 my-6">
          <button type="button" onClick={closeModal} className="on_active_bounce w-full rounded-md bg-[#2B354D] py-2.5 text-white">
            Add
          </button>
        </div>
      </div>
    </div>
  );
});

export default AddStaff;
