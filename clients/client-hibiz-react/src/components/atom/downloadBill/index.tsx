import { Bill } from '@/components/types/businessData';
import { downloadCSV } from '@/components/utils/helper';
import React, { memo } from 'react';

interface DownloadBillsProps {
  inTime: string;
  outTime: string;
  closeModal: () => void;
  billsData: Bill[];
}

const DownloadBills: React.FC<DownloadBillsProps> = ({ inTime, outTime, closeModal, billsData }) => {
  return (
    <div className="rounded-t-[1.5rem] bg-[#f5f5f5] p-6 ">
      <h3 className="mb-2 text-xl font-medium text-[#2B354D]">Do you want to download the bills?</h3>
      <p className="mb-4 pb-12 text-sm text-[#2B354D] opacity-80">
        from {inTime} to {outTime}
      </p>

      <div className="flex justify-between space-x-6">
        <button type="button" onClick={closeModal} className="rounded-lg  border border-[#2B354D] bg-white px-6 py-2 text-[#2B354D]">
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            closeModal();
            downloadCSV(billsData);
          }}
          className="w-full rounded-lg bg-[#2B354D] px-4 py-2 text-white"
        >
          Download
        </button>
      </div>
    </div>
  );
};

export default memo(DownloadBills);
