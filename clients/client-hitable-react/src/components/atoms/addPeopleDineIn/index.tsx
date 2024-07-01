import useDiscountStore from "@/components/store/useDiscountStore";
import { useState } from "react";
import { toast } from "react-toastify";

interface AddPeopleDineProps {
  setIsPeopleAdd: (value: boolean) => void;
  setCurrentView: (value: string) => void;
}
function AddPeopleDine({ setIsPeopleAdd ,setCurrentView}:AddPeopleDineProps) {
  const [numberOfPeople, setNumberOfPeople] = useState("");

  const setDineInUser = useDiscountStore((state) => state.setDineInUser);

  const handleSave = () => {
    const count = parseInt(numberOfPeople, 10);
    if (!isNaN(count) && count >= 0) {
      setDineInUser(count);
      setIsPeopleAdd(false);
      toast.success(`${count} of people added successfully`);
      setCurrentView("pos");
    } else {
      toast.error("Please add count");
    }
  };

  return (
    <div className="p-6">
      <div className="font-semibold">Number of people dining</div>
      <span className="opacity-50">Number</span>
      <input
        type="number"
        className="w-full p-2 mt-4 border border-[#cacaca] rounded-xl focus:outline-none focus:ring-0"
        placeholder=""
        value={numberOfPeople}
        onChange={(e) => setNumberOfPeople(e.target.value)}
      />
      <div className="flex justify-between mt-6">
        <button
        type="button"
          onClick={handleSave}
          className="w-full px-6 py-3 text-sm bg-primary text-base-100 rounded-3xl"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default AddPeopleDine;
