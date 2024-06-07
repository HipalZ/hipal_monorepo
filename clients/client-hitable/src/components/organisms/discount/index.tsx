import { memo } from 'react';

function DiscountComponent({
  billData,
  discountMode,
  handleDiscountModeChange,
  discountValue,
  handleDiscountChange,
  discountDescription,
  setDiscountDescription,
  setDiscount,
  removeDiscount,
  setIsModalOpen,
  applyDiscount,
}) {
  return (
    <div className="relative min-h-[40vh]">
      <div className="mx-6 flex justify-between">
        <div className="text-base-content mt-4 font-[500] capitalize">Discount</div>
        <div className="text-base-content mt-3 font-[500] capitalize">₹ {billData.Total}</div>
      </div>
      <div className="ml-6 mt-4 flex items-center">
        <select value={discountMode} onChange={handleDiscountModeChange} className="custom-select rounded-l-full focus:outline-none focus:ring-0">
          <option value="rupees">₹</option>
          <option value="percent">%</option>
        </select>
        <input
          className="focus:border-primary border-primary h-[32px] min-w-[75%] max-w-full rounded-r-full border pl-4 text-sm font-[500] focus:outline-none focus:ring-0"
          type="number"
          value={discountValue}
          onChange={handleDiscountChange}
        />
      </div>
      <div className="mx-6 mt-4">
        <label htmlFor="discountDescription" className="block text-sm font-medium text-gray-700">
          Enter comment for discount
        </label>
        <input
          id="discountDescription"
          type="text"
          value={discountDescription}
          onChange={(e) => setDiscountDescription(e.target.value)}
          className="mt-2 block min-w-full rounded-lg border border-[#79747E] px-2 py-1 focus:outline-none focus:ring-0"
          placeholder="Enter reason for discount"
          required
        />
      </div>
      <div
        className={`${
          billData.subTotal > 0 ? '' : 'hidden'
        } bg-primary shadow-base-100 fixed bottom-0 z-20 flex h-[4rem] w-full items-center justify-evenly py-2 shadow-lg`}
      >
        <button type="button" className="text-base-100 bg-primary mr-2 rounded-full px-4 py-2 text-base font-[500]">
          ₹ Discount
        </button>
        <button
          type="button"
          onClick={removeDiscount}
          className="border-base-100 text-primary bg-base-100 z-50 mr-2 rounded-full border px-4 py-2 text-sm font-[500]"
        >
          Remove
        </button>
        <button
          type="button"
          onClick={applyDiscount}
          className="border-base-100 text-primary bg-base-100 z-50 mr-2 rounded-full border px-4 py-2 text-sm font-[500]"
        >
          Apply Discount
        </button>
      </div>
    </div>
  );
}

export default memo(DiscountComponent);
