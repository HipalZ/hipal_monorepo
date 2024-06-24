import axios from '@/axios';
import TransferItem from '@/components/molecules/transferItem';
import { useLogin } from '@/components/store/useLogin';
import { IStatus } from '@/components/types/hiTableData';
import React, { useRef, useState } from 'react';
import { toast } from 'react-toastify';

interface TransferMultipleProps {
  statusData: IStatus[][];
  onClose: () => void;
  refetch: () => void;
}
export interface TransferData {
  toZoneId: string;
  toTableId: string;
  name: string;
}
const TransferMultipleDishes: React.FC<TransferMultipleProps> = ({ statusData, onClose, refetch }) => {
  const [selectedDishes, setSelectedDishes] = useState<IStatus[]>([]);
  const [step, setStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [transferData, setTransferData] = useState<TransferData>({
    toZoneId: '',
    toTableId: '',
    name: '',
  });

  const user = useLogin((s) => s.userDetails);

  const transferREf = useRef(transferData);
  const handleUpdateTransferData = (newValues: Partial<TransferData>) => {
    transferREf.current = transferData;
    setTransferData((prevValues) => ({
      ...prevValues,
      ...newValues,
    }));
  };

  const handleCheckboxChange = (dish: IStatus) => {
    setSelectedDishes((prevSelectedDishes) =>
      prevSelectedDishes.find((selectedDish) => selectedDish._id === dish._id)
        ? prevSelectedDishes.filter((selectedDish) => selectedDish._id !== dish._id)
        : [...prevSelectedDishes, dish],
    );
  };
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSelectAll = () => {
    const allDishes = statusData.flat().filter((status) => !status.isDeleted && status.dishStatus.toLowerCase() !== 'delivered');

    if (selectedDishes.length === allDishes.length) {
      setSelectedDishes([]);
    } else {
      setSelectedDishes(allDishes);
    }
  };
  const filteredStatusData = statusData.map((tableData) =>
    tableData.filter(
      (status) =>
        !status.isDeleted &&
        (status.dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          status.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          status.tableName.toLowerCase().includes(searchQuery.toLowerCase())),
    ),
  );

  const transferItem = async () => {
    console.log(selectedDishes);
    try {
      const config = {
        toZoneId: transferData?.toZoneId,
        toTableId: transferData?.toTableId,
        transferBy: user.name,
        customerName: user?.name,
        customerPhone: user?.phone,
        kotObjectArray: selectedDishes,
      };
      const res = await axios.post('/v1/kitchens/:id/transferKot', config);
      if (res.status === 200) {
        toast.success('Dishes transferred successfully');
        refetch();
        onClose();
      }
    } catch (error: any) {
      console.log(error);
    }
  };
  const handleNextStep = () => {
    if (step === 2) {
      transferItem();
    } else {
      setStep(step + 1);
    }
  };

  const handleGoBack = () => {
    setStep(step - 1);
  };

  const renderUi = () => {
    switch (step) {
      case 0:
        return (
          <div className="bg-secondary relative max-h-[80vh] min-h-[20vh] overflow-auto rounded-t-2xl px-4 pb-[3rem]">
            <section className="bg-secondary sticky top-0 z-20 py-4">
              <h3 className="text-xl font-medium ">Transfer Multiple Dishes</h3>
              <article className="flex items-center justify-between">
                <input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="mt-2 w-[60%] rounded-md bg-white px-4 py-2"
                />
                <button onClick={handleSelectAll} className="bg-primary mt-2 h-10 rounded-2xl px-8 text-white ">
                  {selectedDishes.length === statusData.flat().filter((status) => !status.isDeleted).length ? 'Deselect All' : 'Select All'}
                </button>
              </article>
            </section>
            {filteredStatusData.map((tableData, tableIndex) => {
              if (tableData.length === 0) {
                return null;
              }
              return (
                <div key={tableIndex} className="bg-base-100 mb-4 space-y-2 rounded-xl p-4">
                  <article className="flex justify-between border-b">
                    <h3 className="mb-2 text-lg">Table</h3>
                    <h3 className="mb-2 text-lg">{tableData[0]?.tableName || 'Unknown'}</h3>
                  </article>
                  {tableData
                    .filter((dish) => dish?.dishStatus?.toLowerCase() !== 'delivered')
                    .map((status: IStatus) => (
                      <div key={status._id} className="flex items-start justify-between">
                        <div>
                          <span>{status.dish.name}</span>
                          <div className="text-base-content/40 mt-1 text-sm font-semibold capitalize">{status?.dish?.portions?.name}</div>
                          <div className="text-base-content/40 mb-2 mt-1 text-xs font-normal capitalize">
                            {status?.dish?.extras?.map((extra) => extra?.name + ', ')}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4"
                          checked={selectedDishes.some((dish) => dish._id === status._id)}
                          onChange={() => handleCheckboxChange(status)}
                        />
                      </div>
                    ))}
                </div>
              );
            })}
          </div>
        );
      case 1:
        return (
          <>
            <TransferItem handleNextStep={handleNextStep} handleUpdateTransferData={handleUpdateTransferData} />
          </>
        );
      case 2:
        return (
          <section className="h-48">
            <div className="p-4">
              Transfer Dishes from {selectedDishes[0]?.tableName} to {transferData.name}
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  const renderButtons = () => {
    switch (step) {
      case 0:
        return (
          <div className="fixed bottom-4 flex w-full max-w-[27rem] gap-4 px-4">
            <button onClick={onClose} className="text-primary border-primary bg-base-100 w-full rounded-2xl border px-4 py-2">
              Cancel
            </button>
            <button
              onClick={handleNextStep}
              disabled={selectedDishes.length === 0}
              className={`w-full rounded-2xl px-4 py-2 text-white ${selectedDishes.length === 0 ? 'bg-gray-400' : 'bg-primary'}`}
            >
              Next
            </button>
          </div>
        );
      case 1:
        return (
          <div className="fixed bottom-4 flex w-full max-w-[27rem] gap-4 px-4">
            <button onClick={handleGoBack} className="text-primary border-primary bg-base-100 w-full rounded-2xl border px-4 py-2">
              Back
            </button>
          </div>
        );
      case 2:
        return (
          <div className="fixed bottom-4 flex w-full max-w-[27rem] gap-4 px-4">
            <button onClick={handleGoBack} className="text-primary border-primary bg-base-100 w-full rounded-2xl border px-4 py-2">
              Go Back
            </button>
            <button onClick={handleNextStep} className="bg-primary w-full rounded-2xl px-4 py-2 text-white">
              Confirm
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {renderUi()}
      {renderButtons()}
    </div>
  );
};

export default TransferMultipleDishes;
