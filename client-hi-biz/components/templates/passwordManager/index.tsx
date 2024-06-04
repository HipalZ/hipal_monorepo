import Header from "@/components/molecules/header";
import React, { memo, useEffect, useState } from "react";
import { BsChevronLeft } from "react-icons/bs";
import HipeopleLogo from "@/assets/svg/hi.svg";
import PopUp from "@/components/atom/popUp";
import ChangePassword from "@/components/atom/editPopUp";
import axios from "@/axios";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import ErrorComponent from "@/components/errorComponent";

interface IPassword {
  setSettings: (arg: string) => void;
}
const PasswordManager = ({ setSettings }: IPassword) => {
  const router = useRouter();

  const { businessId } = router.query as { businessId: string };
  const getPasswords = async () => {
    try {
      const response = await axios.get(
        `/v1/businesses/${businessId}/passwordManager`
      );
      const kotResponse = await axios.get(
        `/v1/kitchens/:id/passwordManager/${businessId}`
      );
      let result = { ...response?.data, ...kotResponse?.data };
      const responseData = result;
      const updatedPasswordArr = passwordArr.map((passwordObj) => {
        if (responseData?.hasOwnProperty(passwordObj.key)) {
          return { ...passwordObj, password: responseData[passwordObj.key] };
        }
        return passwordObj;
      });
      setPasswordArr(updatedPasswordArr);
      return responseData;
    } catch (err) {
      console.log(err);
    }
  };

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["passwordManager", businessId],
    queryFn: getPasswords,
    enabled: !!businessId,
  });

  const [openPopUp, setOpenPopUp] = useState(false);
  const [passwordKey, setPasswordKey] = useState<string>("");
  const [passwordArr, setPasswordArr] = useState<Array<Record<string, any>>>([
    {
      id: "0",
      text: "Password for Service Charges",
      key: "serviceChargePassword",
      password: null,
    },
    {
      id: "1",
      text: "Password for Discount",
      key: "discountPassword",
      password: null,
    },
    {
      id: "2",
      text: "Password for Delete KOT",
      key: "deleteKotPassword",
      password: null,
    },
    {
      id: "3",
      text: "Password for Loyalty bulk upload",
      key: "loyaltyPassword",
      password: null,
    },
  ]);

  function closePopUpModal() {
    setOpenPopUp(false);
  }
  function updatePasswordApi(key: any) {
    setPasswordKey(key);
    setOpenPopUp(true);
  }
  async function handlePasswordUpdate(newPassword: string, key: string) {
    if (key === "deleteKotPassword") {
      const config = {
        method: "PUT",
        mode: "cors",
        url: ``,
        data: {
          password: newPassword,
        },
      };
      try {
        const response = await axios(config);
        if (response.status === 200) {
          toast.success("kot password set successfully");
          const updatedPasswords = passwordArr.map((password) => {
            if (password.key === key) {
              return { ...password, password: newPassword };
            }
            return password;
          });
          setPasswordArr(updatedPasswords);
        }
      } catch (err) {
        console.log(err);
      }
    } else if (key === "loyaltyPassword") {
      const config = {
        method: "PUT",
        mode: "cors",
        url: `/v1/businesses/${businessId}/updateLoyalty`,
        data: {
          password: newPassword,
        },
      };
      try {
        const response = await axios(config);
        if (response.status === 200) {
          toast.success("loyalty password set successfully");
          const updatedPasswords = passwordArr.map((password) => {
            if (password.key === key) {
              return { ...password, password: newPassword };
            }
            return password;
          });
          setPasswordArr(updatedPasswords);
        }
      } catch (err) {
        console.log(err);
      }
    } else if (key === "serviceChargePassword") {
      const config = {
        method: "PUT",
        mode: "cors",
        url: `/v1/businesses/${businessId}`,
        data: {
          serviceChargeRemovalPass: newPassword,
        },
      };
      try {
        const response = await axios(config);
        if (response.status === 200) {
          toast.success("service charge password set successfully");
          const updatedPasswords = passwordArr.map((password) => {
            if (password.key === key) {
              return { ...password, password: newPassword };
            }
            return password;
          });
          setPasswordArr(updatedPasswords);
        }
      } catch (err) {
        console.log(err);
      }
    } else if (key === "discountPassword") {
      const config = {
        method: "PUT",
        mode: "cors",
        url: `/v1/businesses/${businessId}`,
        data: {
          serviceControl: {
            discountPassword: newPassword,
          },
        },
      };
      try {
        const response = await axios(config);
        if (response.status === 200) {
          toast.success("discount password set successfully");
          const updatedPasswords = passwordArr.map((password) => {
            if (password.key === key) {
              return { ...password, password: newPassword };
            }
            return password;
          });
          setPasswordArr(updatedPasswords);
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorComponent refetch={refetch} />;

  return (
    <div className="relative">
      <div className="bg-[#f5f5f5]">
        <Header
          title="Manager"
          onBack={() => setSettings("")}
          isIconBusinessShow={false}
          leftIcon={<BsChevronLeft />}
          centerImage={HipeopleLogo}
          rightImage={HipeopleLogo}
        />
        <div className="px-6 text-left text-2xl mt-4 pb-4 border-b border-[#cacaca]">
          <h1>Password Manager</h1>
        </div>
      </div>
      {passwordArr.map((eachPassword) => {
        return (
          <div
            key={eachPassword?.id}
            onClick={() => updatePasswordApi(eachPassword?.key)}
            className={`${
              eachPassword?.key === "deleteKotPassword"
                ? "pointer-events-none opacity-50"
                : ""
            } border on_active_bounce border-[#cacaca] rounded-lg px-4 py-2 text-[#2B354D] my-5 mx-5`}
          >
            <div>
              <h1>{eachPassword?.text}</h1>
            </div>
            <div className="flex justify-between">
              <p>{eachPassword?.password}</p>
              <button type="button" className="text-[#2F80ED]">
                Edit
              </button>
            </div>
          </div>
        );
      })}
      <PopUp show={openPopUp} onClose={closePopUpModal}>
        <ChangePassword
          updatePassword={(newPassword) =>
            handlePasswordUpdate(newPassword, passwordKey)
          }
          closeModal={closePopUpModal}
        />
      </PopUp>
    </div>
  );
};

export default memo(PasswordManager);
