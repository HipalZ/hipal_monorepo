import { memo } from 'react';

function BillDetails({ billData }) {
  if (billData.length === 0) return null;

  return (
    <>
      {billData[0] && (
        <div className="bg-primary overflow-auto rounded-t-2xl py-4">
          <div className="mx-4 flex justify-between">
            <div className="flex flex-col">
              <div className="text-base-100 font-[500] capitalize">{billData[0]?.tableName}</div>
              <div className="text-base-100 mt-1 font-normal capitalize">{billData[0]?.customerName}</div>
            </div>
            <div className="flex flex-col">
              <div className="text-md text-base-100 text-right font-[500]">{billData[0]?.kotTime?.slice(0, 5)}</div>
              <div className="text-base-100 mt-1 font-normal capitalize">{billData[0]?.kotDate?.slice(0, 10)}</div>
            </div>
          </div>
        </div>
      )}
      {billData && billData.length > 0 && (
        <>
          <div className="text-base-content mx-4 my-4 flex justify-between font-[500] capitalize">
            <div className="w-[50%]">Items</div>
            <div>Quantity</div>
            <div>Cost</div>
          </div>
          <div className="hide-scrollbar max-h-[40vh] overflow-auto pb-4">
            {billData.map((bill, index) => (
              <div
                key={bill.Total}
                className={`text-base-content hide-scrollbar mx-4 mt-4 flex justify-between font-[500] capitalize ${
                  index !== billData.length - 1 ? 'border-b border-dashed pb-4' : ''
                }`}
              >
                <div className="w-[60%] font-[500]">
                  {bill?.dish?.name}
                  <div className="text-base-content/40 mt-1 font-normal capitalize">{bill?.dish?.portions?.name}</div>
                  <div className="text-base-content/40 mt-1 font-normal capitalize">
                    {bill?.dish?.extras?.map((extra, index) => (
                      <span key={`${extra.name}-${index}`} className="text-sm">
                        {extra?.quantity} x {extra?.name},{' '}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center">{bill?.dish?.qty}</div>
                <div className="">₹ {bill?.dish?.price}</div>
              </div>
            ))}
          </div>
          <div className="mx-4 pb-2">
            <hr className="border-gray-500" />
          </div>
        </>
      )}
    </>
  );
}

export default memo(BillDetails);
