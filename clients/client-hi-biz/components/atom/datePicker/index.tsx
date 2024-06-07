// components/DatePicker.tsx
import useTimings from '@/components/store/useTimings';
import { memo, useState } from 'react';
import { AiFillCaretDown } from 'react-icons/ai';

const DatePicker: React.FC = () => {
  // Function to format the date to "DD-MM-YYYY"
  const formatDate = (date: Date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yyyy = date.getFullYear();

    return `${dd}-${mm}-${yyyy}`;
  };

  const setDate = useTimings((s) => s.setPickDate);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return formatDate(today);
  });

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(event.target.value);
    setSelectedDate(formatDate(date));
    setDate(formatDate(date));
  };

  return (
    <div className="relative flex flex-col">
      <input
        type="date"
        id="date"
        name="date"
        className="mt-2 rounded-md border py-0 pl-0 pr-8"
        value={selectedDate.split('-').reverse().join('-')} // Input type date expects "YYYY-MM-DD"
        onChange={handleDateChange}
      />
      <div className="absolute right-2 top-3.5 cursor-pointer text-[1.5rem]">
        <AiFillCaretDown className="text-sm" />
      </div>
    </div>
  );
};

export default memo(DatePicker);
