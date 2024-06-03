import React, { memo } from "react";

function BillDetails({ billData }) {
  if (billData.length === 0) return null;

  return (
    <>
      {billData[0] && (
        <div className="py-4 overflow-auto bg-primary rounded-t-2xl">
          <div className="flex justify-between mx-4">
            <div className="flex flex-col">
              <div className="font-[500] text-base-100 capitalize">
                {billData[0]?.tableName}
              </div>
              <div className="mt-1 font-normal capitalize text-base-100">
                {billData[0]?.customerName}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-right text-md font-[500] text-base-100">
                {billData[0]?.kotTime?.slice(0, 5)}
              </div>
              <div className="mt-1 font-normal capitalize text-base-100">
                {billData[0]?.kotDate?.slice(0, 10)}
              </div>
            </div>
          </div>
        </div>
      )}
      {billData && billData.length > 0 && (
        <>
          <div className="flex justify-between capitalize font-[500] mx-4 my-4 text-base-content">
            <div className="w-[50%]">Items</div>
            <div>Quantity</div>
            <div>Cost</div>
          </div>
          <div className="overflow-auto pb-4 max-h-[40vh] hide-scrollbar">
            {billData.map((bill, index) => (
              <div
                key={bill.Total}
                className={`flex justify-between capitalize font-[500] mx-4 mt-4 text-base-content hide-scrollbar ${
                  index !== billData.length - 1
                    ? "pb-4 border-b border-dashed"
                    : ""
                }`}
              >
                <div className="w-[60%] font-[500]">
                  {bill?.dish?.name}
                  <div className="mt-1 font-normal capitalize text-base-content/40">
                    {bill?.dish?.portions?.name}
                  </div>
                  <div className="mt-1 font-normal capitalize text-base-content/40">
                    {bill?.dish?.extras?.map((extra, index) => (
                      <span key={`${extra.name}-${index}`} className="text-sm">
                        {extra?.quantity} x {extra?.name},{" "}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center">{bill?.dish?.qty}</div>
                <div className="">₹ {bill?.dish?.price}</div>
              </div>
            ))}
          </div>
          <div className="pb-2 mx-4">
            <hr className="border-gray-500" />
          </div>
        </>
      )}
    </>
  );
}

export default memo(BillDetails);
