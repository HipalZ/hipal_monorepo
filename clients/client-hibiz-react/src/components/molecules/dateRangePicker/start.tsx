import DatePicker from "react-datepicker";

interface StartDatePickerProps {
  startDate: Date;
  endDate: Date;
  setStartDate: (date: Date) => void;
  setValidationError: (error: string) => void;
}

const StartDatePicker: React.FC<StartDatePickerProps> = ({
  startDate,
  endDate,
  setStartDate,
  setValidationError,
}) => {
  return (
    <DatePicker
      selected={startDate}
      onChange={(date: Date) => {
        setStartDate(date);
        if (date > endDate) {
          setValidationError("Start date cannot be after end date.");
        } else {
          setValidationError("");
        }
      }}
      maxDate={endDate || new Date()}
      inline
      className="bg-black"
    />
  );
};

export default StartDatePicker;
