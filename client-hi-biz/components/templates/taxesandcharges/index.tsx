import Header from "@/components/molecules/header";
import type React from "react";
import { memo, useState } from "react";
import { BsChevronLeft } from "react-icons/bs";
import Hi from "@/assets/svg/hi.svg";
import { MdCardMembership, MdCurrencyExchange } from "react-icons/md";
import Switch from "react-switch";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import axios from "@/axios";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import useBusinessData from "@/components/store/useBusinessData";
import PopUp from "@/components/atom/popUp";
import AddTax from "@/components/molecules/addTax";
import type { IAddTax } from "../swiggy";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/atom/loadingSpinner";

function TaxAndCharges() {
  const router = useRouter();
  const setSelectedIcon = useSelectedIcon((s) => s.setSelectedIcon);
  const { businessId } = router.query as { businessId: string };
  const businessData = useBusinessData((s) => s.businessData);
  const setBusinessData = useBusinessData((s) => s.setBusinessData);
  const [toggleSwitch, setToggleSwitch] = useState(
    businessData?.serviceCharge || false
  );
  const [isModified, setIsModified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [percentage, setPercentage] = useState(
    businessData?.serviceChargePercentage || 0
  );
  const [password, setPassword] = useState(
    businessData?.serviceChargeRemovalPass || ""
  );
  const [isExtraChargesModalOpen, setExtraChargesIsModalOpen] = useState(false);
  const [isEditModalOpen, setEditIsModalOpen] = useState(false);
  const [editTax, setEditTax] = useState<IAddTax | null>(null);
  const [commissionName, setCommissionName] = useState<string | null>(null);
  const [commissionType, setCommissionType] = useState<string | null>(null);
  const [value, setValue] = useState<number | null>(null);
  const [typeOfValue, setTypeOfValue] = useState<string | null>("percentage");
  const [addCharges, setAddCharges] = useState<IAddTax[]>([]);

  function toggleLoyality() {
    setToggleSwitch(!toggleSwitch);
  }

  function togglePasswordVisibility() {
    setShowPassword(!showPassword);
  }
  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPercentage(Number(e.target.value));
    setIsModified(true);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setIsModified(true);
  };

  const handleSave = async () => {
    if (
      !percentage ||
      percentage === null ||
      percentage === undefined ||
      percentage === 0
    ) {
      toast.error("please enter Percentage");
      return;
    }
    if (!password || password === null || password === undefined) {
      toast.error("Password is required.");
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_HOST}/v1/businesses/${businessId}`,
        {
          serviceCharge: true,
          serviceChargePercentage: Number(percentage),
          serviceChargeRemovalPass:
            password || businessData?.serviceChargeRemovalPass,
        }
      );
      setBusinessData(response.data);
      toast.success("Service Charges added successfully");
    } catch (error) {
      console.error("API Request Error:", error);
      toast.error("Failed to add service charges. Please try again.");
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enteredValue = Number(e.target.value);

    if (typeOfValue === "percentage" && enteredValue <= 100) {
      setValue(enteredValue);
    } else if (typeOfValue === "rupess" && enteredValue <= 500) {
      setValue(enteredValue);
    } else {
      toast.error(
        `The max value for ${
          typeOfValue === "percentage" ? "percentage" : "rupees"
        } is ${typeOfValue === "percentage" ? 100 : 500}`
      );
    }
  };

  async function handleCreate(str: string) {
    if (!commissionName || !commissionType || !value || !typeOfValue) {
      toast.error("Please fill in all mandatory fields.");
      return;
    }
    if (typeOfValue === "percentage" && value > 100) {
      toast.error("Percentage value should be less than or equal to 100%");
      return;
    }
    const body = {
      businessId: businessId,
      chargeName: commissionName,
      chargeType: commissionType,
      value: value,
      typeOfValue: typeOfValue,
    };

    try {
      const response = await axios.post("/v1/dishes/charges", body);
      if (response.status === 200 || response.status === 201) {
        getAllTaxes();
        setCommissionName("");
        setCommissionType("");
        setValue(null);
        setExtraChargesIsModalOpen(false);
        toast.success("Successfully added!");
      } else {
        toast.error("There was an issue with your request.");
      }
    } catch (error) {
      console.error(error);
      toast.error("There was an error processing your request.");
    }
  }
  async function handleEdit(str: string, chargeId: string) {
    if (str.toLowerCase() === "save") {
      if (editTax) {
        if (
          typeOfValue === "percentage" &&
          (value ? value : editTax.value) > 100
        ) {
          toast.error("Percentage value should be less than or equal to 100%");
          return;
        }
      }
      const body = {
        chargeName: commissionName ? commissionName : editTax?.chargeName,
        chargeType: commissionType ? commissionType : editTax?.chargeType,
        value: value ? value : editTax?.value,
        typeOfValue: typeOfValue ? typeOfValue : editTax?.typeOfValue,
      };
      try {
        const response = await axios.put(
          `/v1/dishes/:id/getCharges/${chargeId}`,
          body
        );

        if (response.status === 200 || response.status === 201) {
          getAllTaxes();
          setEditIsModalOpen(false);
          toast.success(`Successfully ${body?.chargeName} edited!`);
        } else {
          toast.error("There was an issue with your request.");
        }
      } catch (error) {
        console.error(error);
        toast.error("There was an error processing your request.");
      }
    } else {
      try {
        const response = await axios.delete(
          `/v1/dishes/:id/getCharges/${chargeId}`
        ); 

        if (response.status === 200 || response.status === 201) {
          getAllTaxes();
          setEditIsModalOpen(false);
          toast.success(`Successfully ${editTax?.chargeName} deleted`);
        } else {
          toast.error("There was an issue with your request.");
        }
      } catch (error) {
        console.error(error);
        toast.error("There was an error processing your request.");
      }
    }
  }

  const getAllTaxes = async () => {
    try {
      const response = await axios.get(
        `/v1/dishes/:id/getCharges?businessId=${businessId}`
      );
      setAddCharges(response.data);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  const {isLoading, error, data} = useQuery({
    queryKey:["getCharges", businessId],
    queryFn:getAllTaxes,
    enabled: !! businessId,
  })

  if(isLoading) return <LoadingSpinner />
  if(error) return <div>Error: {error.message}</div>

  return (
    <div className="relative bg-white">
      <div className="bg-[#f5f5f5] sticky top-0 z-50 w-full border-b border-[#CACACA]">
        <Header
          title="Charges"
          onBack={()=>setSelectedIcon("")}
          leftIcon={<BsChevronLeft />}
          centerImage={Hi}
          rightImage={Hi}
          isIconBusinessShow={true}
        />
        <div className="flex items-center space-x-2 mx-6 mt-6 text-2xl font-normal text-[#2B354D] pb-4 rounded-lg">
          <MdCardMembership /> <span>Charges</span>
        </div>
      </div>
      <div className="px-4 mx-6 mt-6 py-4 rounded-md border border-[#CACACA]">
        <div
          className={`flex items-center justify-between ${
            toggleSwitch ? "border-b border-[#CACACA] pb-4" : ""
          } `}
        >
          <h1 className="text-base font-semibold">Service charges</h1>
          <div className="flex items-center ">
            <Switch
              uncheckedIcon={false}
              checkedIcon={false}
              onChange={toggleLoyality}
              checked={toggleSwitch}
              offColor="#CACACA"
            />
          </div>
        </div>
        {toggleSwitch && (
          <>
            <div className="my-4 text-sm opacity-70">
              Set the percentage on the for service charge
            </div>
            <div className="relative">
              <input
                type="number"
                onChange={handlePercentageChange}
                value={percentage}
                className={" w-full px-2.5 rounded-md pr-6"}
                placeholder="Percentage"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-lg">
                %
              </span>
            </div>
          </>
        )}
      </div>
      {toggleSwitch && (
        <div className="mx-6 border border-[#cacaca] mt-6 rounded-lg px-4">
          <div className="my-4 text-sm">
            Password for removing service charges
          </div>
          <div className="relative pb-4">
            <input
              type={showPassword ? "text" : "password"}
              onChange={handlePasswordChange}
              value={password}
              className="w-full px-2.5 rounded-md"
              placeholder="Enter Password"
            />
            <span
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
            >
              {showPassword ? (
                <AiFillEyeInvisible className="mb-4" />
              ) : (
                <AiFillEye className="mb-4" />
              )}
            </span>
          </div>
        </div>
      )}
      <div className="fixed w-full px-6 bottom-6">
        <button
          type="button"
          disabled={!isModified}
          onClick={handleSave}
          className={`${
            !isModified ? "opacity-50" : ""
          } w-full text-white bg-[#2B354D] py-2 rounded-md`}
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default memo(TaxAndCharges);
