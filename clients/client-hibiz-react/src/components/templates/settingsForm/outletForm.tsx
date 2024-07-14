import { apiRpc } from "@hi/common";
import { useState, useCallback, type FormEvent, memo } from "react";

export const convertTo12HourFormat = (time: string): string => {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const adjustedHours = hours % 12 || 12;
  return `${adjustedHours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")} ${period}`;
};

const MemoOutletForm: React.FC = () => {
  const [billingStartTime, setBillingStartTime] = useState<string>("");
  const [billingEndTime, setBillingEndTime] = useState<string>("");
  const [brandName, setBrandName] = useState<string>("");
  const [branchName, setBranchName] = useState<string>("");
  const [url, setUrl] = useState<string>("");

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      // const res = apiRpc.businesses.outletInfo.
    },
    [billingStartTime, billingEndTime, brandName, branchName, url],
  );

  const handleStartTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBillingStartTime(e.target.value);
    },
    [],
  );

  const handleEndTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBillingEndTime(e.target.value);
    },
    [],
  );
  const handleBrandNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBrandName(e.target.value);
    },
    [],
  );

  const handleBranchNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBranchName(e.target.value);
    },
    [],
  );

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUrl(e.target.value);
    },
    [],
  );

  return (
    <section>
      <form
        onSubmit={handleSubmit}
        className="pb-[5rem] grid grid-cols-1 md:grid-cols-2"
      >
        <section className="mx-4 mt-6 space-y-2">
          <h2>Outlet Billing Settings</h2>
          <section className="p-4 space-y-4 bg-white rounded-xl">
            <div className="flex items-center justify-between">
              <label htmlFor="billingStartTime">Billing Start Time:</label>
              <input
                type="time"
                id="billingStartTime"
                value={billingStartTime}
                onChange={handleStartTimeChange}
                className="rounded-full w-[12rem]"
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="billingEndTime">Billing End Time:</label>
              <input
                type="time"
                id="billingEndTime"
                value={billingEndTime}
                onChange={handleEndTimeChange}
                className="rounded-full w-[12rem]"
              />
            </div>
            {(billingStartTime || billingEndTime) && (
              <div className="px-4 py-1 text-sm text-[#8C63FF] bg-[#8C63FF20] rounded-full">
                Billing time from {convertTo12HourFormat(billingStartTime)} to{" "}
                {convertTo12HourFormat(billingEndTime)}
              </div>
            )}
          </section>
        </section>
        <section className="mx-4 mt-6 space-y-2">
          <h3>Outlet Name</h3>
          <section className="p-4 bg-white rounded-2xl">
            <div className="relative">
              <input
                type="text"
                id="brandName"
                value={brandName}
                onChange={handleBrandNameChange}
                className="block w-full pt-2 pb-4 pl-4 pr-4 mb-0 ml-0 mr-0 text-base border border-gray-800 rounded-2xl text-base-content bg-base-100 dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
                placeholder=" "
                required
              />
              <label
                htmlFor="brandName"
                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-base-100 dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
              >
                Brand Name
              </label>
            </div>
            <div className="relative mt-4">
              <input
                type="text"
                id="branchName"
                value={branchName}
                onChange={handleBranchNameChange}
                className="block w-full pt-2 pb-4 pl-4 pr-4 mb-0 ml-0 mr-0 text-base border border-gray-800 rounded-2xl text-base-content bg-base-100 dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
                placeholder=" "
                required
              />
              <label
                htmlFor="branchName"
                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-base-100 dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
              >
                Branch Name
              </label>
            </div>
          </section>
        </section>
        <section className="mx-4 mt-6 space-y-2">
          <h3>Url</h3>
          <section className="p-4 bg-white rounded-2xl">
            <div className="relative">
              <input
                type="text"
                id="url"
                value={url}
                onChange={handleUrlChange}
                className="block w-full pt-2 pb-4 pl-4 pr-4 mb-0 ml-0 mr-0 text-base border border-gray-800 rounded-2xl text-base-content bg-base-100 dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
                placeholder=" "
                required
              />
              <label
                htmlFor="url"
                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-base-100 dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
              >
                hipalz.com/
              </label>
            </div>
          </section>
        </section>
        <button className="bottom_btn" type="submit">
          Save
        </button>
      </form>
    </section>
  );
};

const OutletForm = memo(MemoOutletForm);
export default OutletForm;
