import BottomButton from "@/components/atom/bottomButton";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateRangePicker = () => {
  const {
    dateRange,
    setDateRange,
    selectedOption,
    setSelectedOption,
    setDateInTimeStamp,
    dateInTimeStamp,
  } = useHiPeopleStore((state) => ({
    dateRange: state.dateRange,
    setDateRange: state.setDateRange,
    selectedOption: state.selectedOption,
    setSelectedOption: state.setSelectedOption,
    setDateInTimeStamp: state.setDateInTimeStamp,
    dateInTimeStamp: state.dateInTimeStamp,
  }));

  const [startDate, endDate] = dateRange;

  console.log(dateInTimeStamp);

  const handleOptionClick = (option) => {
    const today = new Date();
    let start = null;
    let end = null;

    switch (option) {
      case "Today":
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
      case "Yesterday": {
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
      case "One Month": {
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
      case "Custom Date":
        break;
      default:
        break;
    }

    if (option !== "Custom Date") {
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
    } else {
      alert("Please select a valid date range.");
    }
  };

  return (
    <div>
      <article className="flex flex-wrap mx-4 space-x-4">
        <button
          className="px-4 py-2 mt-4 text-xs text-white bg-black rounded-full"
          type="button"
          onClick={() => handleOptionClick("Today")}
        >
          Today
        </button>
        <button
          className="px-4 py-2 mt-4 text-xs text-white bg-black rounded-full"
          type="button"
          onClick={() => handleOptionClick("Yesterday")}
        >
          Yesterday
        </button>
        <button
          className="px-4 py-2 mt-4 text-xs text-white bg-black rounded-full"
          type="button"
          onClick={() => handleOptionClick("One Month")}
        >
          One Month
        </button>
        <button
          className="px-4 py-2 mt-4 text-xs text-white bg-black rounded-full"
          type="button"
          onClick={() => handleOptionClick("Custom Date")}
        >
          Custom Date
        </button>
      </article>

      {/* {selectedOption === "Custom Date" && ( */}
        <section className="mt-6 text-center">
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
            // allowSameDay={true}
            isClearable
            icon={null}
          />
        </section>
      {/* )} */}
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

export default DateRangePicker;
