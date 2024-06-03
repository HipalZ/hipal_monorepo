import { Bill } from "@/components/types/businessData";
import { downloadCSV } from "@/components/utils/helper";
import React, { memo } from "react";

interface DownloadBillsProps {
  inTime: string;
  outTime: string;
  closeModal: () => void;
  billsData: Bill[];
}

const DownloadBills: React.FC<DownloadBillsProps> = ({
  inTime,
  outTime,
  closeModal,
  billsData,
}) => {
  return (
    <div className="bg-[#f5f5f5] p-6 rounded-t-[1.5rem] ">
      <h3 className="text-xl mb-2 font-medium text-[#2B354D]">
        Do you want to download the bills?
      </h3>
      <p className="text-sm mb-4 opacity-80 text-[#2B354D] pb-12">
        from {inTime} to {outTime}
      </p>

      <div className="flex justify-between space-x-6">
        <button
          type="button"
          onClick={closeModal}
          className="bg-white  border border-[#2B354D] text-[#2B354D] px-6 py-2 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            closeModal();
            downloadCSV(billsData);
          }}
          className="bg-[#2B354D] w-full text-white px-4 py-2 rounded-lg"
        >
          Download
        </button>
      </div>
    </div>
  );
};

export default memo(DownloadBills);
