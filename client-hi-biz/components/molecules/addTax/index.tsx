import type { IAddTax } from "@/components/templates/swiggy";
import type React from "react";
import { memo, useEffect } from "react";

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
      setCommissionName("");
      setCommissionType("");
      setTypeOfValue("percentage");
    }
  }, [edit, editTax, setCommissionName, setCommissionType, setTypeOfValue]);


  return (
    <div className="bg-[#f5f5f5] rounded-t-3xl p-6">
      <h3 className="text-xl mb-2 font-medium text-[#2B354D]">{heading}</h3>
      <p className="text-sm">
        Adding charges to menu adds value to the total taxable amount, which add
        total charges before taxes.
      </p>

      <div className="bg-white px-4 rounded-md border border-[#cacaca] mt-4 pb-4">
        <div className="mt-4">
          <label className="block mb-2 font-medium">Charge name</label>
          <input
            type="text"
            maxLength={20}
            value={commissionName || ""}
            onChange={(e) => setCommissionName(e.target.value)}
            className="border p-2 w-full rounded-md focus:border-[#2B354D] focus:ring-0 focus:outline-none"
            placeholder="Name"
          />
        </div>
        <div className="mt-4">
          <label className="block mb-2">Charge type</label>
          <select
            value={commissionType || ""}
            onChange={(e) => setCommissionType(e.target.value)}
            className="border p-2 w-full rounded-md focus:border-[#2B354D] focus:ring-0 focus:outline-none"
          >
            <option value="">Select charge type</option>
            <option value="on the dish">On the Dish</option>
            <option value="on the bill">On the Bill</option>
          </select>
        </div>
        <div className="mt-4">
          <div>
            <label className="block mb-2">Value of the charge</label>
            <div className="flex space-x-4">
              <input
                type="text"
                maxLength={6}
                value={value?.toString() || editTax?.value}
                onChange={handleValueChange}
                className="border p-2 rounded-md focus:border-[#2B354D] focus:ring-0 focus:outline-none"
                placeholder="Value"
              />
              <select
                value={typeOfValue || "percentage"}
                onChange={(e) => setTypeOfValue(e.target.value || "percentage")}
                className="border p-2 w-full rounded-md focus:border-[#2B354D] focus:ring-0 focus:outline-none"
              >
                <option value="percentage">%</option>
                <option value="rupess">₹</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {edit ? (
        <div className="flex mt-4 space-x-4">
          <button
            type="button"
            onClick={() => handleEdit("delete", editTax?.id || "")}
            className="min-h-[3rem] w-[40%] font-semibold text-[#2B354D] border border-[#2B354D] bg-white text-[1rem] rounded-lg  py-2"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => handleEdit("save", editTax?.id || "")}
            className="min-h-[3rem] font-semibold bg-[#2B354D] text-white text-[1rem] rounded-lg w-[60%] py-2"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => handleCreate("create")}
            className="min-h-[3rem] font-semibold bg-[#2B354D] text-white text-[1rem] rounded-lg w-full py-2"
          >
            Create
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(AddTax);
