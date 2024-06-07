import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import PopUp from '@/components/atom/popUp';
import Header from '@/components/molecules/header';
import useBusinessData from '@/components/store/useBusinessData';
import { useOwnerLogin } from '@/components/store/useOwnerLogin';
import { useSelectedIcon } from '@/components/store/useSelectedIcon';
import ExcelJS from 'exceljs';
import React, { ChangeEvent, memo, useRef, useState } from 'react';
import { BiDownload, BiUpload } from 'react-icons/bi';
import { BsChevronLeft } from 'react-icons/bs';
import { toast } from 'react-toastify';

type user = {
  userPhone: string | null;
  total: number | null;
  rewards: string | null;
  invoice: number | null;
};

const LoyaltyCSV: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setSelectedSubIcon = useSelectedIcon((s) => s.setSelectedSubIcon);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = React.useState<user[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const loyaltyData = useBusinessData((s) => s.existingLoyalty);
  const [payload, setPayload] = React.useState({});
  const userDetails = useOwnerLogin((s) => s.user);
  const openModal = () => {
    setIsModalOpen(true);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e: any) => {
        const buffer = e.target.result;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        // Assuming the data is in the first sheet; adjust if needed
        const worksheet = workbook.worksheets[0];
        const usersArray = extractAndTransformData(worksheet);
        setUsers(usersArray);

        setPayload({
          loyaltyId: loyaltyData.loyaltyId,
          usersArray: usersArray,
          password: null,
          businessId: loyaltyData.loyaltyId,
          uploadedBy: userDetails.name,
        });
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const extractAndTransformData = (worksheet: ExcelJS.Worksheet) => {
    let isDataSection = false; // Flag to indicate when to start extracting data
    const usersArray: any[] = [];

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      // Check if the current row is the start of the data section
      if (row.getCell(1).value === 'Customer Phone' && row.getCell(2).value === 'Customer Name') {
        isDataSection = true;
        return; // Skip the header row
      }

      if (isDataSection) {
        const phoneNumber = row.getCell(1).value?.toString().trim();
        const totalString = row.getCell(4).value?.toString().trim();
        const invoiceString = row.getCell(5).value?.toString().trim();

        const totalAmount = parseFloat(totalString);
        const invoiceNumber = parseInt(invoiceString);

        // Validate phone number length, total amount, and invoice number
        if (phoneNumber?.length >= 10 && !isNaN(totalAmount) && totalAmount > 0 && !isNaN(invoiceNumber)) {
          const rewardsAmount = totalAmount * (loyaltyData.setReward / 100);

          usersArray.push({
            userPhone: phoneNumber,
            total: totalAmount,
            rewards: rewardsAmount.toFixed(2),
            invoice: invoiceNumber,
          });
        }
      }
    });

    return usersArray;
  };

  const sendToApi = async (payload: any) => {
    try {
      await axios.post('/v1/users/addBulkCoins', payload);
      toast.success('Data uploaded successfully');
    } catch (error: any) {
      toast.error(error.response?.data || 'Error uploading data');
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
      setSelectedSubIcon('');
    }
  };

  return (
    <div className="pb-12">
      <div className="sticky top-0 z-20 bg-[#f5f5f5]">
        <Header
          title="Loyalty"
          onBack={() => {
            console.log('icon');
            setSelectedSubIcon('');
          }}
          leftIcon={<BsChevronLeft />}
          centerImage={Hi}
          rightImage={Hi}
          isIconBusinessShow={true}
        />
        <div className="mt-2 flex items-center justify-between border-b border-[#cacaca] px-6 pb-4">
          <div className="mt-4 flex text-2xl">
            <span className="ml-2">Coins</span>
          </div>
        </div>
      </div>
      {users.length < 0 && (
        <div className="flex w-full items-center justify-center px-6">
          <a
            href="/hipalFormate.csv"
            download
            className="on_active_bounce mt-4 w-full rounded-lg border border-[#2B354D] bg-white px-4 py-2 font-semibold text-[#2B354D]"
          >
            <div className="flex items-center justify-center">
              <BiDownload className="mr-2" />
              Download CSV
            </div>
          </a>
        </div>
      )}

      <div className="pb-12">
        {users.map((user, index) => (
          <div key={index.toString()} className="mx-6 mt-4 rounded-xl border border-[#cacaca] p-4">
            <div className="flex justify-between">
              <div className="flex flex-col space-x-2">
                <span>₹ {user?.rewards}</span>
                <span className="text-sm">{user?.userPhone}</span>
              </div>
              <div className="text-sm font-normal opacity-60">{user?.invoice}</div>
            </div>
          </div>
        ))}
      </div>

      {users.length > 0 ? (
        <div className="fixed bottom-6 flex w-full items-center justify-center px-6">
          <button
            type="button"
            className="on_active_bounce mt-4 w-full rounded-lg bg-[#2B354D] px-4 py-2 font-semibold text-white"
            onClick={openModal}
          >
            Add Credit
          </button>
        </div>
      ) : (
        <div className="fixed bottom-6 flex w-full items-center justify-center px-6">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx" style={{ display: 'none' }} />
          <button
            type="button"
            className="on_active_bounce mt-4 w-full rounded-lg bg-[#2B354D] px-4 py-2 font-semibold text-white"
            onClick={handleFileUpload}
          >
            <div className="flex items-center justify-center">
              <BiUpload className="mr-2" />
              Upload CSV
            </div>
          </button>
        </div>
      )}
      {isModalOpen && (
        <PopUp show={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <PasswordModal
            password={password}
            setPassword={setPassword}
            closeModal={() => setIsModalOpen(false)}
            isLoading={isLoading}
            onConfirm={async () => {
              const updatedPayload = { ...payload, password: password };
              await sendToApi(updatedPayload);
            }}
          />
        </PopUp>
      )}
    </div>
  );
};

export default memo(LoyaltyCSV);

interface PasswordModalProps {
  password: string;
  isLoading: boolean;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  closeModal: () => void;
  onConfirm: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ password, isLoading, setPassword, closeModal, onConfirm }) => {
  return (
    <div className="rounded-t-[1.5rem] bg-[#f5f5f5] p-6 ">
      <h3 className="mb-2 text-xl font-medium text-[#2B354D]">Enter your password to confirm</h3>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-4 w-full rounded border p-2"
        placeholder="Enter password..."
      />
      <div className="flex justify-between space-x-6">
        <button type="button" onClick={closeModal} className="rounded-lg border border-[#2B354D] bg-white px-6 py-2 text-[#2B354D]">
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            closeModal();
          }}
          className={`${isLoading ? 'pointer-events-none opacity-50' : ''} w-full rounded-lg bg-[#2B354D] px-4 py-2 text-white`}
        >
          {isLoading ? 'Loading...' : 'Confirm'}
        </button>
      </div>
    </div>
  );
};
