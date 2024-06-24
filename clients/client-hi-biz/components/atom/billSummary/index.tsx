import { memo } from 'react';

interface IProps {
  cgst: number;
  sgst: number;
  tips: number;
  discount: number;
  discountDescription: string;
  claimedAmount: number;
  serviceCharge: number;
  total: number;
}

const BillSummary = (props: IProps) => {
  return (
    <div className="mt-4 space-y-2 pb-4 text-sm font-medium">
      <div className="flex justify-between opacity-60">
        <span>CGST - 2.5% </span>
        <span>₹ {props?.cgst}</span>
      </div>
      <div className="flex justify-between opacity-60">
        <span>SGST - 2.5%</span>
        <span>₹ {props?.sgst}</span>
      </div>
      {props?.tips > 0 && (
        <div className="flex justify-between opacity-60">
          <span>Tips</span>
          <span>₹ {props?.tips}</span>
        </div>
      )}
      {props?.discount > 0 && (
        <div className="flex justify-between opacity-60">
          <span>Discount</span>
          <span>₹ {props?.discount}</span>
        </div>
      )}
      {props?.discount > 0 && props?.discountDescription !== '' && (
        <div className="flex justify-between opacity-60">
          <span>Reason:-{props?.discountDescription}</span>
        </div>
      )}
      {props?.claimedAmount > 0 && (
        <div className="flex justify-between opacity-60">
          <span>HiCoinz</span>
          <span>₹ {props?.claimedAmount}</span>
        </div>
      )}
      {props?.serviceCharge > 0 && (
        <div className="flex justify-between opacity-60">
          <span>Service Charge</span>
          <span>₹ {props?.serviceCharge}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span>Total</span>
        <span>₹ {props?.total}</span>
      </div>
    </div>
  );
};
export default memo(BillSummary);
