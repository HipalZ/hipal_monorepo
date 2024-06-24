import { memo } from 'react';
import type { IFinalBill, SettlePageTypes } from '../settle/type';

const TotalBill = ({ billData, openModal }: { billData: IFinalBill; openModal: (str: SettlePageTypes) => void }) => {
  return (
    <div>
      {billData && (
        <div className="relative">
          {billData.serviceChargeRemovedBy && billData.serviceChargeRemovedBy !== '' && (
            <div className="text-primary mx-4 flex justify-between pb-4 text-sm capitalize">
              <h6>S.C Removed By {billData.serviceChargeRemovedBy}</h6>
              <button onClick={() => openModal('REMOVE_SERVICE_TAX')} type="button">
                Add
              </button>
            </div>
          )}
          {billData.serviceChargeAddedBy && billData.serviceChargeAddedBy !== '' && (
            <div className="text-primary mx-4 flex justify-between pb-4 text-sm capitalize">
              <h6>S.C Added By {billData.serviceChargeAddedBy}</h6>
            </div>
          )}
          <div className="text-base-content mx-4 flex justify-between font-[600] capitalize">
            <div>Sub Total</div>
            <div>₹ {billData?.subTotal}</div>
          </div>
          {billData?.discount > 0 && (
            <div className="text-base-content mx-4 mt-1 flex justify-between text-sm capitalize">
              <div className="w-[80%]">
                Discount <span>({billData.discountGivenBy})</span>{' '}
              </div>
              <div>₹ {billData?.discount}</div>
            </div>
          )}
          {billData?.claimedAmount > 0 && (
            <div className="text-base-content mx-4 mt-1 flex justify-between text-sm capitalize">
              <div>Claimed amount</div>
              <div>₹ {billData?.claimedAmount}</div>
            </div>
          )}
          {Number(billData?.serviceCharge) > 0 && (
            <div className="text-base-content mx-4 mt-1 flex justify-between text-sm capitalize">
              <div>Service Charge</div>
              <div>₹ {billData?.serviceCharge}</div>
            </div>
          )}
          <div className="text-base-content mx-4 mt-1 flex justify-between text-sm capitalize">
            <div>cgst</div>
            <div>₹ {billData?.SGST?.toFixed(2)}</div>
          </div>
          <div className="text-base-content mx-4 mt-1 flex justify-between text-sm capitalize">
            <div>sgst</div>
            <div>₹ {billData?.CGST?.toFixed(2)}</div>
          </div>
          {Number(billData?.tips) > 0 && (
            <div className="text-base-content mx-4 mt-1 flex justify-between text-sm capitalize">
              <div className="w-[80%]">
                Tips <span>({billData.tipsGivenBy})</span>{' '}
              </div>
              <div>₹ {billData?.tips}</div>
            </div>
          )}
          <div className="text-base-content mx-4 flex justify-between pb-4 pt-2 text-xl font-bold capitalize">
            <div>Total</div>
            <div>₹ {billData?.Total}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(TotalBill);
