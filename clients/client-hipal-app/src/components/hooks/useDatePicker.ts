import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const useDatePicker = (currentYear, currentMonth, currentDay, pickerRef) => {
  const [date, setDate] = useState({
    day: currentDay.toString(),
    month: currentMonth.toString(),
    year: currentYear.toString(),
  });

  const [optionGroups, setOptionGroups] = useState({
    day: Array.from({ length: 31 }, (_, i) => ({
      value: `${i + 1}`,
      label: `${i + 1}`,
    })),
    month: Array.from({ length: 12 }, (_, i) => ({
      value: `${i + 1}`,
      label: new Date(0, i).toLocaleString("default", { month: "short" }),
    })),
    year: Array.from({ length: 200 }, (_, i) => ({
      value: `${currentYear - i}`,
      label: `${currentYear - i}`,
    })),
  });

  useEffect(() => {
    const selectedYear = Number.parseInt(date.year);
    const selectedMonth = Number.parseInt(date.month);
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

    setOptionGroups((prev) => ({
      ...prev,
      day: Array.from({ length: daysInMonth }, (_, i) => ({
        value: `${i + 1}`,
        label: `${i + 1}`,
      })),
    }));
  }, [date.year, date.month]);

  const handleDateChange = (name, value) => {
    setDate((prev) => {
      let newState = { ...prev, [name]: value };
      const selectedDate = new Date(
        Number.parseInt(newState.year),
        Number.parseInt(newState.month) - 1,
        Number.parseInt(newState.day),
      ).getTime();
      const today = new Date(
        currentYear,
        currentMonth - 1,
        currentDay,
      ).getTime();

      if (selectedDate > today) {
        toast.error("You cannot select a date in the future.");
        return prev;
      }
      const daysInMonth = new Date(
        Number.parseInt(newState.year),
        Number.parseInt(newState.month),
        0,
      ).getDate();

      if (Number.parseInt(prev.day) > daysInMonth) {
        newState.day = `${daysInMonth}`;
      }

      setOptionGroups((prev) => ({
        ...prev,
        day: Array.from({ length: daysInMonth }, (_, i) => ({
          value: `${i + 1}`,
          label: `${i + 1}`,
        })),
      }));

      return newState;
    });
  };

  useEffect(() => {
    const preventDefault = (e: TouchEvent) => e.preventDefault();

    const pickerElement = pickerRef.current;
    if (pickerElement) {
      pickerElement.addEventListener("touchmove", preventDefault, {
        passive: false,
      });
    }

    return () => {
      if (pickerElement) {
        pickerElement.removeEventListener("touchmove", preventDefault);
      }
    };
  }, [pickerRef]);

  return { date, optionGroups, handleDateChange };
};

export default useDatePicker;
