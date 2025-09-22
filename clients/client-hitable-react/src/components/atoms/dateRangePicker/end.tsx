// EndDatePicker.tsx

import DatePicker from "react-datepicker";

interface EndDatePickerProps {
  startDate: Date;
  endDate: Date;
  setEndDate: (date: Date) => void;
  setValidationError: (error: string) => void;
}

const EndDatePicker: React.FC<EndDatePickerProps> = ({
  startDate,
  endDate,
  setEndDate,
  setValidationError,
}) => {
  return (
    <DatePicker
      selected={endDate}
      onChange={(date: Date) => {
        setEndDate(date);
        if (date < startDate) {
          setValidationError("End date cannot be before start date.");
        } else {
          setValidationError("");
        }
      }}
      minDate={startDate}
      maxDate={new Date()}
      inline
    />
  );
};

export default EndDatePicker;
