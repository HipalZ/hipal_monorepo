export interface ISalesResponse {
  grossSale: number;
  totalSale: ISaleMode[];
  charges: ICharge[];
  discounts: IDiscount[];
  tips: ITip[];
  dues: IDue[];
}

interface ISaleMode {
  mode: string;
  totalSale: number;
  commissionPercent: number;
  totalCommissionSale: number;
}

interface ICharge {
  mode: string;
  totalSale: number;
  commissionPercent: number;
  totalCommissionSale: number;
}

interface IDiscount {
  mode: string;
  totalSale: number;
  commissionPercent: number;
  totalCommissionSale: number;
}

interface ITip {
  waiterName: string;
  tips: number;
}

interface IDue {
  customerName: string;
  dues: number;
}

interface SalesComponentProps {
  salesData: ISalesResponse | null;
  runCost: number;
}

const SalesComponent: React.FC<SalesComponentProps> = ({ salesData, runCost }) => {
  return (
    <div className="relative pb-[5rem]">
      {salesData?.grossSale !== 0 ? (
        <>
          <div className="bg-primary text-base-100 mx-6 mt-2 rounded-lg p-4">
            <div className="pb-2 text-xs">
              Gross Sales
              {/* {inTime && outTime && (
                <>
                  ( {inTime.slice(0, 5)} to {outTime.slice(0, 5)} )
                </>
              )} */}
            </div>
            <div className="text-3xl font-medium">₹ {salesData?.grossSale}</div>
          </div>
          <div className="masonry-layout mt-4">
            <div className="masonry-item">
              <div className="ml-6">Total Sales</div>
              <div className="bg-base-100 mx-6 mt-4 rounded-md border border-[#cacaca]">
                {salesData?.totalSale
                  ?.filter((ele) => ele?.totalSale > 0)
                  ?.map((ele, index, array) => (
                    <div
                      key={ele.totalSale}
                      className={`${
                        index < array.length - 1 ? 'bg-base-100 border-b border-[#cacaca]' : ''
                      } mx-4 flex items-center justify-between py-4 text-sm`}
                    >
                      {ele.totalSale > 0 && (
                        <>
                          <span> {ele?.mode}</span>
                          <span>₹ {ele?.totalSale}</span>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            </div>
            {runCost > 0 && (
              <div className="masonry-item mx-6">
                <div>Running Table</div>
                <div className="bg-base-100 mt-4 flex items-center justify-between rounded-md border border-[#cacaca] p-4">
                  <div>Cost</div>
                  <div>₹ {runCost}</div>
                </div>
              </div>
            )}
            <div className="masonry-item">
              <div className="ml-6">Charges</div>
              <div className="bg-base-100 mx-6 mt-4 rounded-md border border-[#cacaca]">
                {salesData?.charges
                  ?.filter((ele) => ele?.totalSale > 0)
                  ?.map((ele, index, array) => (
                    <div
                      key={ele.totalSale}
                      className={`${
                        index < array.length - 1 ? 'bg-base-100 border-b border-[#cacaca]' : ''
                      } mx-4 flex items-center justify-between py-4 text-sm`}
                    >
                      {ele?.totalSale > 0 && (
                        <>
                          <span>{ele?.mode}</span>
                          <span>₹ {ele?.totalSale}</span>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            </div>
            <div className="masonry-item">
              <div className="ml-6">Discounts</div>
              <div className="bg-base-100 mx-6 mt-4 rounded-md border border-[#cacaca]">
                {salesData?.discounts
                  ?.filter((ele) => ele?.totalSale > 0)
                  ?.map((ele, index, array) => (
                    <div
                      key={ele.totalSale}
                      className={`${
                        index < array.length - 1 ? 'bg-base-100 border-b border-[#cacaca]' : ''
                      } mx-4 flex items-center justify-between py-4 text-sm`}
                    >
                      {ele?.totalSale > 0 && (
                        <>
                          <span>{ele?.mode}</span>
                          <span>₹ {ele?.totalSale}</span>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            </div>
            <div className="masonry-item">
              <div className="ml-6">Dues</div>
              <div className="bg-base-100 mx-6 mt-4 rounded-md border border-[#cacaca]">
                {salesData?.dues?.map((ele, index) => (
                  <div key={ele.customerName} className="bg-base-100 mx-4 flex items-center justify-between border-b border-[#cacaca] py-4 text-sm">
                    <span>{ele?.customerName}</span>
                    <span>₹ {ele?.dues}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="masonry-item">
              <div className="ml-6">Tips</div>
              <div className="bg-base-100 mx-6 mt-4 rounded-md border border-[#cacaca]">
                {salesData?.tips
                  ?.filter((ele) => ele?.tips > 0)
                  ?.map((ele) => (
                    <div key={ele.waiterName} className="bg-base-100 mx-4 flex items-center justify-between border-b border-[#cacaca] py-4 text-sm">
                      <span>{ele?.waiterName}</span>
                      <span>₹ {ele?.tips}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-primary mt-4 text-center text-xl font-medium opacity-60">No sales Found</div>
      )}
    </div>
  );
};

export default SalesComponent;
