import useBusinessData from "@/components/store/useBusinessData";
import { useOutletFormStore } from "@/components/store/useOutlet";
import { useUserToken } from "@hi/common/src/useUserToken";
import { apiRpc } from "@hi/common";
import { memo, type FormEvent } from "react";
import toast from "react-hot-toast";

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
  const { formData, setFormData } = useOutletFormStore((s) => ({
    formData: s.formData,
    setFormData: s.setFormData,
  }));

  const businessData = useBusinessData((s) => s.businessData);

  const handleInputChange = (key: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(key, e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const requestBody = {
      billingStartTime: formData.billingStartTime || "",
      billingEndTime: formData.billingEndTime || "",
      branchName: formData.branchName || "",
      brandName: formData.brandName || "",
      businessId: businessData?._id || "",
      name: businessData?.name || "",
    };

    let res;
    try {
      if (formData._id) {
        res = await apiRpc.businesses.outletInfo.update[":businessId"].$put({
          param: {
            businessId: businessData?._id,
          },
          json: requestBody,
        });
      } else {
        res = await apiRpc.businesses.outletInfo.$post({
          json: requestBody,
        });
      }

      if (res.status === 201 || res.status === 200) {
        toast.success("Outlet information saved successfully");
      } else {
        toast.error("Failed to save outlet information");
      }
    } catch (error) {
      toast.error("Error saving outlet information");
      console.error("Error saving outlet information:", error);
    }
  };

  return (
    <section>
      <form onSubmit={handleSubmit} className="pb-[5rem] grid grid-cols-1 md:grid-cols-2">
        <section className="mx-4 mt-6 space-y-2">
          <h2>Outlet Billing Timings</h2>
          <section className="p-4 space-y-4 bg-white rounded-xl">
            <div className="flex items-center justify-between">
              <label htmlFor="billingStartTime">Billing Start Time:</label>
              <input
                type="time"
                id="billingStartTime"
                value={formData.billingStartTime}
                onChange={handleInputChange("billingStartTime")}
                className="rounded-full w-[12rem]"
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="billingEndTime">Billing End Time:</label>
              <input
                type="time"
                id="billingEndTime"
                value={formData.billingEndTime}
                onChange={handleInputChange("billingEndTime")}
                className="rounded-full w-[12rem]"
              />
            </div>
            {(formData.billingStartTime || formData.billingEndTime) && (
              <div className="px-4 py-1 text-sm text-[#8C63FF] bg-[#8C63FF20] rounded-full">
                Billing time from {convertTo12HourFormat(formData.billingStartTime)} to{" "}
                {convertTo12HourFormat(formData.billingEndTime)}
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
                value={formData.brandName}
                onChange={handleInputChange("brandName")}
                className="block w-full pt-2 pb-4 pl-4 pr-4 mb-0 ml-0 mr-0 text-base border border-gray-800 rounded-2xl text-base-content bg-base-100 dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
                maxLength={21}
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
                value={formData.branchName}
                onChange={handleInputChange("branchName")}
                className="block w-full pt-2 pb-4 pl-4 pr-4 mb-0 ml-0 mr-0 text-base border border-gray-800 rounded-2xl text-base-content bg-base-100 dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
                maxLength={21}
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
        <button className="bottom_btn" type="submit">
          Save
        </button>
      </form>
    </section>
  );
};

const OutletForm = memo(MemoOutletForm);
export default OutletForm;
