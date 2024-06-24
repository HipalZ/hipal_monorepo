import useDiscountStore from '@/components/store/useDiscountStore';
import { useState } from 'react';
import { toast } from 'react-toastify';

function AddPeopleDine({ setIsPeopleAdd, setCurrentView }) {
  const [numberOfPeople, setNumberOfPeople] = useState('');

  const setDineInUser = useDiscountStore((state) => state.setDineInUser);

  const handleSave = () => {
    const count = parseInt(numberOfPeople, 10);
    if (!isNaN(count) && count >= 0) {
      setDineInUser(count);
      setIsPeopleAdd(false);
      toast.success(`${count} of people added successfully`);
      setCurrentView('pos');
    } else {
      toast.error('Please add count');
    }
  };

  return (
    <div className="p-6">
      <div className="font-semibold">Number of people dining</div>
      <span className="opacity-50">Number</span>
      <input
        type="number"
        className="mt-4 w-full rounded-xl border border-[#cacaca] p-2 focus:outline-none focus:ring-0"
        placeholder=""
        value={numberOfPeople}
        onChange={(e) => setNumberOfPeople(e.target.value)}
      />
      <div className="mt-6 flex justify-between">
        <button type="button" onClick={handleSave} className="bg-primary text-base-100 w-full rounded-3xl px-6 py-3 text-sm">
          Save
        </button>
      </div>
    </div>
  );
}

export default AddPeopleDine;
