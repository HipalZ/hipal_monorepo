import { timestampToTime } from '@/components/utils/helpers';
import { MdCreditCard } from 'react-icons/md';

function PaymentFail({ ...props }) {
  return (
    <div className="mx-6 rounded-2xl bg-[#FF3A3A]/10">
      <div className="flex justify-between">
        <div className="mx-4 py-4">
          <button type="button" className={'bg-base-100 relative rounded-full font-normal text-black'}>
            <div className="inline-flex items-center justify-start">
              <div className={'absolute left-1 h-[1.5rem] w-[1.5rem] rounded-full bg-[#FF3A3A]'}>
                <MdCreditCard className="text-base-100 ml-1 mt-1" />
              </div>
              <div className="ml-6 mr-4 pl-2 text-lg font-[500] capitalize text-[#FF3A3A]/80">Payment Failed</div>
            </div>
          </button>
        </div>
        <div className="text-base-content/40 mr-6 mt-6 text-[0.875rem] font-normal leading-[1rem]">{timestampToTime(props.time)}</div>
      </div>
      <div className="flex justify-between pb-4">
        <div className="mx-6 -mt-3">
          <div className="text-base-content mt-1 text-[1rem] font-[500] leading-[1.25rem]">{props.tableName ? props.tableName : ''}</div>
          <div className="text-base-content/40 mt-1 text-[0.875rem] font-normal capitalize leading-[1rem]">{props.message}</div>
        </div>
      </div>
    </div>
  );
}

export default PaymentFail;
