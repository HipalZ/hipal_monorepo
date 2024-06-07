import type { IAddTax } from '@/components/templates/swiggy';
import type React from 'react';
import { memo, useEffect } from 'react';

interface Props {
  heading: string;
  commissionName: string | null;
  commissionType: string | null;
  value: number | null;
  typeOfValue: string;
  edit: boolean;
  editTax: IAddTax | null;
  handleValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setCommissionName: (name: string) => void;
  setCommissionType: (type: string) => void;
  setTypeOfValue: (value: string) => void;
  handleCreate: (str: string) => void;
  handleEdit: (str: string, id: string) => void;
}

const AddTax: React.FC<Props> = ({
  heading,
  commissionName,
  commissionType,
  value,
  typeOfValue,
  edit,
  editTax,
  handleValueChange,
  setCommissionName,
  setCommissionType,
  setTypeOfValue,
  handleCreate,
  handleEdit,
}) => {
  useEffect(() => {
    if (editTax && edit) {
      setCommissionName(editTax.chargeName);
      setCommissionType(editTax.chargeType);
      setTypeOfValue(editTax.typeOfValue);
    } else {
      setCommissionName('');
      setCommissionType('');
      setTypeOfValue('percentage');
    }
  }, [edit, editTax, setCommissionName, setCommissionType, setTypeOfValue]);

  return (
    <div className="rounded-t-3xl bg-[#f5f5f5] p-6">
      <h3 className="mb-2 text-xl font-medium text-[#2B354D]">{heading}</h3>
      <p className="text-sm">Adding charges to menu adds value to the total taxable amount, which add total charges before taxes.</p>

      <div className="mt-4 rounded-md border border-[#cacaca] bg-white px-4 pb-4">
        <div className="mt-4">
          <label className="mb-2 block font-medium">Charge name</label>
          <input
            type="text"
            maxLength={20}
            value={commissionName || ''}
            onChange={(e) => setCommissionName(e.target.value)}
            className="w-full rounded-md border p-2 focus:border-[#2B354D] focus:outline-none focus:ring-0"
            placeholder="Name"
          />
        </div>
        <div className="mt-4">
          <label className="mb-2 block">Charge type</label>
          <select
            value={commissionType || ''}
            onChange={(e) => setCommissionType(e.target.value)}
            className="w-full rounded-md border p-2 focus:border-[#2B354D] focus:outline-none focus:ring-0"
          >
            <option value="">Select charge type</option>
            <option value="on the dish">On the Dish</option>
            <option value="on the bill">On the Bill</option>
          </select>
        </div>
        <div className="mt-4">
          <div>
            <label className="mb-2 block">Value of the charge</label>
            <div className="flex space-x-4">
              <input
                type="text"
                maxLength={6}
                value={value?.toString() || editTax?.value}
                onChange={handleValueChange}
                className="rounded-md border p-2 focus:border-[#2B354D] focus:outline-none focus:ring-0"
                placeholder="Value"
              />
              <select
                value={typeOfValue || 'percentage'}
                onChange={(e) => setTypeOfValue(e.target.value || 'percentage')}
                className="w-full rounded-md border p-2 focus:border-[#2B354D] focus:outline-none focus:ring-0"
              >
                <option value="percentage">%</option>
                <option value="rupess">₹</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {edit ? (
        <div className="mt-4 flex space-x-4">
          <button
            type="button"
            onClick={() => handleEdit('delete', editTax?._id || '')}
            className="min-h-[3rem] w-[40%] rounded-lg border border-[#2B354D] bg-white py-2 text-[1rem] font-semibold  text-[#2B354D]"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => handleEdit('save', editTax?._id || '')}
            className="min-h-[3rem] w-[60%] rounded-lg bg-[#2B354D] py-2 text-[1rem] font-semibold text-white"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => handleCreate('create')}
            className="min-h-[3rem] w-full rounded-lg bg-[#2B354D] py-2 text-[1rem] font-semibold text-white"
          >
            Create
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(AddTax);
