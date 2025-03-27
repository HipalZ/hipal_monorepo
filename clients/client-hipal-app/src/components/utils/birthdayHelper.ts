import { usePathname } from "next/navigation";
import { _useAllBusiness } from "../store/useAllBusiness";
import { useLogin } from "../store/useLogin";
import { useBirthday } from "../store/useBirthday";
import { apiRpc } from "@hi/common";
import { useCallback } from "react";
import { usePaymentStore } from "../store/usePaymentStore";

export const useBirthdayConditions = () => {
  const { subscribeModal, userDetails } = useLogin();
  const { openBlastModal } = usePaymentStore();
  const outletInfo = _useAllBusiness((s) => s.data?.outletInfo);
  const pathName = usePathname();
  const checkConditions = () => {
    return (
      userDetails?._id &&
      outletInfo?.birthdayCampaign &&
      !userDetails?.dob &&
      !subscribeModal &&
      pathName.includes("/explore") &&
      (userDetails?.birthdayTriggerCount ?? 0) === 0 &&
      !openBlastModal
    );
  };

  const checkCardConditions = () => {
    return (
      userDetails?._id && outletInfo?.birthdayCampaign && !userDetails?.dob
    );
  };

  return { checkConditions, checkCardConditions };
};

export const useBirthdayApi = () => {
  const { setUserDetails } = useLogin();
  const updateBirthday = async (data) => {
    const { timestamp, userId, birthdayTriggerCount } = data;
    const response = await apiRpc.users.updateUserInfo[":userId"].$put({
      param: {
        userId,
      },
      json: {
        dob: timestamp,
        birthdayTriggerCount,
      },
    });
    const res = await response.json();
    if (response.status === 200 || response.status === 201) {
      setUserDetails(res?.data);
    }
  };
  return {
    updateBirthday,
  };
};

export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const useValidateDate = () => {
  const { day, month, year, setIsValid, setErrorMessage } = useBirthday();
  const validateDate = useCallback(() => {
    if (!day || !month || !year) {
      setIsValid(false);
      setErrorMessage("Please fill in all date fields");
      return false;
    }

    const monthIndex = months.indexOf(month);

    if (Number.isNaN(day) || day < 1 || day > 31) {
      setIsValid(false);
      setErrorMessage("Please enter a valid day (1-31)");
      return false;
    }

    if (monthIndex === -1) {
      setIsValid(false);
      setErrorMessage("Please select a month");
      return false;
    }

    if (Number.isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
      setIsValid(false);
      setErrorMessage("Please enter a valid year");
      return false;
    }

    // Check if the date is valid (e.g., no February 30)
    const date = new Date(year, monthIndex, day);
    console.log(date.getDate(), day, date.getMonth(), monthIndex);
    if (date.getDate() !== Number(day) || date.getMonth() !== monthIndex) {
      setIsValid(false);
      setErrorMessage("Please enter a valid date");
      return false;
    }

    setIsValid(true);
    setErrorMessage("");
    return true;
  }, [day, month, year, setIsValid, setErrorMessage]);
  return { validateDate };
};
