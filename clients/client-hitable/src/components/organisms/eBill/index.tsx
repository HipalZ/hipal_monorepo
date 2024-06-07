import { memo } from 'react';

function EBillComponent({
  billData,
  newPhoneNumber,
  setNewPhoneNumber,
  handleAddPhoneNumber,
  grouped_customers,
  handleCheckboxChange,
  selectedPhoneNumbers,
  formatPhoneNumber,
  sendBill,
  loading,
}) {
  return (
    <div className="relative max-h-[70vh] min-h-[70vh] overflow-auto">
      <div className="flex justify-between">
        <div className="text-base-content ml-6 mt-4 font-[500] capitalize">E-Bill</div>
        <div className="text-base-content mr-6 mt-3 font-[500] capitalize">₹ {billData.Total}</div>
      </div>
      <div className="ml-6 mt-4">
        <div className="mr-6 flex">
          <div className="bg-primary border-primary text-base-100 rounded-l-full border px-3">+91</div>
          <input
            type="number"
            value={newPhoneNumber}
            onChange={(e) => setNewPhoneNumber(e.target.value)}
            maxLength={10}
            minLength={10}
            placeholder="Enter Phone Number"
            className="border-b-primary w-full border-b pl-2 focus:outline-none"
          />
          <button type="button" onClick={handleAddPhoneNumber} className="text-primary border-primary rounded-lg border px-2">
            Add
          </button>
        </div>
        <div className="text-primary text-medium my-2">Sent to</div>
        {grouped_customers &&
          Object.values(grouped_customers)
            .filter((ele: any) => ele?.customerPhone?.toString().length >= 11)
            .map((customer: any) => (
              <div
                onKeyUp={() => handleCheckboxChange(customer?.customerPhone)}
                onClick={() => handleCheckboxChange(customer?.customerPhone)}
                key={customer?.customerPhone}
                className="mr-6 mt-2 flex items-center justify-between rounded-xl border border-[#cacaca] px-4 py-2"
              >
                <div>{customer?.customerNames}</div>
                <input type="checkbox" checked={selectedPhoneNumbers.includes(`91${customer?.customerPhone}`)} />
              </div>
            ))}

        <div className="overflow-auto pb-[5rem]">
          <div className="text-primary text-medium mt-4">Selected Numbers</div>
          {selectedPhoneNumbers.map((phone, i) => formatPhoneNumber(phone))}
        </div>
      </div>

      <div className="bg-primary shadow-base-100 fixed bottom-0 z-20 h-[4rem] w-full py-2 shadow-lg">
        <button type="button" className="text-base-100 bg-primary absolute bottom-3 left-6 mr-2  rounded-full px-4 py-2 text-base font-[500]">
          ₹ Bill
        </button>
        <button
          type="button"
          onClick={sendBill}
          disabled={loading}
          className="border-base-100 text-primary bg-base-100 absolute bottom-3 right-6 z-50 mr-2 rounded-full border px-4 py-2 text-sm font-[500]"
        >
          send
        </button>
      </div>
    </div>
  );
}

export default memo(EBillComponent);
