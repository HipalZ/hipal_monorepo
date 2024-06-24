import { timestampToTime } from '@/components/utils/helpers';
import { MdCreditCard } from 'react-icons/md';

function PaidOnline({ ...props }) {
  return (
    <div className="mx-6 rounded-2xl bg-[#00BA34]/10">
      <div className="flex justify-between">
        <div className="mx-4 py-4">
          <button className={`bg-base-100 relative rounded-full font-normal text-black`}>
            <div className="inline-flex items-center justify-start">
              <div className={`absolute left-1 h-[1.5rem] w-[1.5rem] rounded-full bg-[#00BA34]`}>
                <MdCreditCard className="text-base-100 ml-1 mt-1" />
              </div>
              <div className="ml-6 mr-4 pl-2 text-lg font-[500] capitalize text-[#00BA34]/80">Paid Online</div>
            </div>
          </button>
        </div>
        <div className="text-base-content/40 mr-6 mt-6 text-[0.875rem] font-normal leading-[1rem]">{timestampToTime(props.time)}</div>
      </div>
      <div className="flex justify-between pb-4">
        <div className="mx-6 -mt-3">
          <div className="text-base-content mt-1 text-[1rem] font-[500] leading-[1.25rem]">{props.tableName ? props.tableName : 'T-01'}</div>
          <div className="text-base-content/40 mt-1 text-[0.875rem] font-normal capitalize leading-[1rem]">{props.message}</div>
        </div>
        <div>
          <label className="relative mr-8 inline-flex scale-150 cursor-pointer items-center">
            <input type="checkbox" value="" className="peer sr-only" defaultChecked />
            <div className="peer-checked:after:border-base-100 after:bg-base-100 peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full dark:border-gray-600 dark:bg-gray-700"></div>
          </label>
        </div>
      </div>
    </div>
  );
}

export default PaidOnline;
