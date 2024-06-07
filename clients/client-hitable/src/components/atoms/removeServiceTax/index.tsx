import { IFinalBill } from '@/components/organisms/settle/type';
import React, { useState } from 'react';

type RemoveServiceTaxProps = {
  removeServiceTax: (password: string, action: boolean) => void;
  updatedBillData: IFinalBill;
};

const RemoveServiceTax: React.FC<RemoveServiceTaxProps> = ({ removeServiceTax, updatedBillData }) => {
  const [password, setPassword] = useState('');

  return (
    <div className="mx-6">
      <div className="mt-4 font-semibold">
        Please enter password for {updatedBillData && !updatedBillData.serviceCharge ? 'Add' : 'remove'} service charge
      </div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mt-4 w-full rounded-md border p-2"
        placeholder="Enter Password"
      />
      <div className="mt-6 flex justify-between gap-4 pb-4">
        {updatedBillData && !updatedBillData.serviceCharge ? (
          <button
            type="button"
            onClick={() => {
              removeServiceTax(password, false);
              setPassword('');
            }}
            className="bg-primary text-base-100 w-full rounded-3xl px-6 py-3 text-sm"
          >
            Add
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              removeServiceTax(password, true);
              setPassword('');
            }}
            className="bg-primary text-base-100 w-full rounded-3xl px-6 py-3 text-sm"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

export default RemoveServiceTax;
