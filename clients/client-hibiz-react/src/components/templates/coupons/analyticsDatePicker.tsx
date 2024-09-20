import { useCallback, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import { cn } from "@hi/common";
import { formatDate } from "@/components/utils/helper";
import useCouponsStore from "@/components/store/useCouponsStore";

enum DatePickerEnum {
  WEEK = "WEEK",
  THIS_MONTH = "THIS_MONTH",
  LAST_3_MONTHS = "LAST_3_MONTHS",
  CUSTOM_DATE = "CUSTOM_DATE",
}

type DateRange = [Date | null, Date | null];

const AnalyticsDatePicker = () => {
  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);

  const {
    couponStartDate,
    setCouponStartDate,
    couponEndDate,
    setCouponEndDate,
  } = useCouponsStore();

  const [selectedOption, setSelectedOption] = useState<DatePickerEnum>(
    DatePickerEnum.WEEK,
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleOptionChange = useCallback(
    (option: DatePickerEnum) => {
      setSelectedOption(option);
      setShowDatePicker(option === DatePickerEnum.CUSTOM_DATE);

      const currentDate = new Date();
      let start: Date | null = null;
      let end: Date | null = null;

      if (option === DatePickerEnum.WEEK) {
        start = new Date(currentDate);
        start.setDate(currentDate.getDate() - 7);
        end = currentDate;
      } else if (option === DatePickerEnum.THIS_MONTH) {
        start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        end = currentDate;
      } else if (option === DatePickerEnum.LAST_3_MONTHS) {
        start = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 2,
          1,
        );
        end = currentDate;
      } else if (option === DatePickerEnum.CUSTOM_DATE) {
        start = null;
        end = null;
      }

      // Update the dates in the store
      setCouponStartDate(start ? start.getTime() : null);
      setCouponEndDate(end ? end.getTime() : null);
    },
    [
      setSelectedOption,
      setShowDatePicker,
      setCouponStartDate,
      setCouponEndDate,
    ],
  );

  const handleDateChange = useCallback(
    (dates: DateRange) => {
      const [start, end] = dates;
      setCouponStartDate(start ? start.getTime() : null);
      setCouponEndDate(end ? end.getTime() : null);

      if (start && end) {
        setShowDatePicker(false);
      }
    },
    [setCouponStartDate, setCouponEndDate, setShowDatePicker],
  );

  const dateRangeDisplay = useMemo(() => {
    if (couponStartDate && couponEndDate) {
      return (
        <center className="font-semibold text-[#8C63FF] bg-[#8C63FF30] text-sm py-1">
          Selected Date Range: {formatDate(new Date(couponStartDate))} -{" "}
          {formatDate(new Date(couponEndDate))}
        </center>
      );
    } else {
      return (
        <center className="py-1 text-sm font-semibold">
          No date range selected
        </center>
      );
    }
  }, [couponStartDate, couponEndDate]);

  return (
    <section>
      <h3 className="mt-6 ml-6 font-semibold opacity-50 lg:ml-0">
        Performance
      </h3>
      <div className="flex gap-2 mt-4 mb-4 ml-4 text-xs lg:ml-0">
        <button
          type="button"
          className={cn(
            `rounded-3xl px-4 py-2 ${
              selectedOption === DatePickerEnum.WEEK
                ? "bg-[#E3CDFE] text-[#8C63FF]"
                : "bg-white text-gray-600"
            }`,
          )}
          onClick={() => handleOptionChange(DatePickerEnum.WEEK)}
        >
          Week
        </button>
        <button
          type="button"
          className={cn(
            `rounded-3xl px-4 py-2 ${
              selectedOption === DatePickerEnum.THIS_MONTH
                ? "bg-[#E3CDFE] text-[#8C63FF]"
                : "bg-white text-gray-600"
            }`,
          )}
          onClick={() => handleOptionChange(DatePickerEnum.THIS_MONTH)}
        >
          Month
        </button>
        <button
          type="button"
          className={cn(
            `rounded-3xl px-4 py-2 ${
              selectedOption === DatePickerEnum.LAST_3_MONTHS
                ? "bg-[#E3CDFE] text-[#8C63FF]"
                : "bg-white text-gray-600"
            }`,
          )}
          onClick={() => handleOptionChange(DatePickerEnum.LAST_3_MONTHS)}
        >
          Last 3 Months
        </button>
        <button
          type="button"
          className={cn(
            `rounded-3xl px-4 py-2 ${
              selectedOption === DatePickerEnum.CUSTOM_DATE
                ? "bg-[#E3CDFE] text-[#8C63FF]"
                : "bg-white text-gray-600"
            }`,
          )}
          onClick={() => handleOptionChange(DatePickerEnum.CUSTOM_DATE)}
        >
          Custom
        </button>
      </div>

      {DatePickerEnum.CUSTOM_DATE === selectedOption && showDatePicker && (
        <section className="w-full mx-4 mt-6">
          <DatePicker
            selectsRange={true}
            startDate={couponStartDate ? new Date(couponStartDate) : null}
            endDate={couponEndDate ? new Date(couponEndDate) : null}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            isClearable={true}
            className="rounded-full"
            maxDate={new Date()}
            inline
          />
        </section>
      )}

      <div className="mt-4 w-full max-w-[28rem]">{dateRangeDisplay}</div>
    </section>
  );
};

export default AnalyticsDatePicker;
