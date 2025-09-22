import BottomButton from "@/components/atom/bottomButton";
import { DatePickerEnum } from "@/components/types/businessData";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import { cn } from "@/components/utils/helper";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { memo } from "react";

const MemoDateRangePicker = () => {
  const dateRange = useHiPeopleStore((state) => state.dateRange);
  const setDateRange = useHiPeopleStore((state) => state.setDateRange);
  const selectedOption = useHiPeopleStore((state) => state.selectedOption);
  const setSelectedOption = useHiPeopleStore(
    (state) => state.setSelectedOption,
  );
  const setDateInTimeStamp = useHiPeopleStore(
    (state) => state.setDateInTimeStamp,
  );
  const setOpenDatePickerModal = useHiPeopleStore(
    (state) => state.setOpenDatePickerModal,
  );

  const [startDate, endDate] = dateRange;

  const handleOptionClick = (option) => {
    const today = new Date();
    let start = null;
    let end = null;

    switch (option) {
      case DatePickerEnum.TODAY:
        start = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          0,
          0,
          0,
          0,
        );
        end = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59,
          999,
        );
        break;
      case DatePickerEnum.YESTERDAY: {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        start = new Date(
          yesterday.getFullYear(),
          yesterday.getMonth(),
          yesterday.getDate(),
          0,
          0,
          0,
          0,
        );
        end = new Date(
          yesterday.getFullYear(),
          yesterday.getMonth(),
          yesterday.getDate(),
          23,
          59,
          59,
          999,
        );
        break;
      }
      case DatePickerEnum.ONE_MONTH: {
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(today.getMonth() - 1);
        start = new Date(
          oneMonthAgo.getFullYear(),
          oneMonthAgo.getMonth(),
          oneMonthAgo.getDate(),
          0,
          0,
          0,
          0,
        );
        end = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59,
          999,
        );
        break;
      }
      case DatePickerEnum.CUSTOM_DATE:
        break;
      default:
        break;
    }

    if (option !== DatePickerEnum.CUSTOM_DATE) {
      setDateRange([start, end]);
    }

    setSelectedOption(option);
  };

  const handleDateChange = (update) => {
    setDateRange(update); // Update the date range in the store
  };

  const handleSave = () => {
    if (startDate && endDate) {
      setDateInTimeStamp({
        from: startDate.getTime(),
        to: endDate.getTime(),
      });
      console.log("Saved Timestamp Range:", {
        from: startDate.getTime(),
        to: endDate.getTime(),
      });
      setOpenDatePickerModal(false);
    } else {
      alert("Please select a valid date range.");
    }
  };

  const defaultButtonStyle = "px-4 py-2 mt-4 text-xs rounded-full";

  return (
    <div>
      <article className="flex flex-wrap mx-4 space-x-4">
        <button
          className={cn(
            defaultButtonStyle,
            selectedOption === DatePickerEnum.TODAY
              ? "bg-black text-white"
              : "text-black bg-white",
          )}
          type="button"
          onClick={() => handleOptionClick(DatePickerEnum.TODAY)}
        >
          Today
        </button>
        <button
          className={cn(
            defaultButtonStyle,
            selectedOption === DatePickerEnum.YESTERDAY
              ? "bg-black text-white"
              : "text-black bg-white",
          )}
          type="button"
          onClick={() => handleOptionClick(DatePickerEnum.YESTERDAY)}
        >
          Yesterday
        </button>
        <button
          className={cn(
            defaultButtonStyle,
            selectedOption === DatePickerEnum.ONE_MONTH
              ? "bg-black text-white"
              : "text-black bg-white",
          )}
          type="button"
          onClick={() => handleOptionClick(DatePickerEnum.ONE_MONTH)}
        >
          One Month
        </button>
        <button
          className={cn(
            defaultButtonStyle,
            selectedOption === DatePickerEnum.CUSTOM_DATE
              ? "bg-black text-white"
              : "text-black bg-white",
          )}
          type="button"
          onClick={() => handleOptionClick(DatePickerEnum.CUSTOM_DATE)}
        >
          Custom Date
        </button>
      </article>

      {DatePickerEnum.CUSTOM_DATE === selectedOption && (
        <section className="mx-4 mt-6 w-[62%] lg:w-[48%] ">
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            withPortal
            isClearable
            icon={null}
            className="rounded-full"
          />
        </section>
      )}

      <BottomButton
        buttons={[
          {
            text: "Save",
            onClick: handleSave,
            type: "button",
          },
        ]}
      />
    </div>
  );
};

const DateRangePicker = memo(MemoDateRangePicker);
export default DateRangePicker;
