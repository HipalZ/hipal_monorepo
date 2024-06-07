import { useAlert } from '@/components/store/useAlert';
import { useEffect } from 'react';
import { MdAutorenew, MdOutlineReceiptLong, MdOutlineTableRestaurant } from 'react-icons/md';
import { RxBell } from 'react-icons/rx';

function TestFooter({ setCurrentView, currentView }) {
  const { newAlertsCount, newOrderCount } = useAlert();

  useEffect(() => {}, [newAlertsCount, newOrderCount]);

  return (
    <div className="bg-primary fixed bottom-0 z-20 w-full py-2 ">
      <div className="mx-6 flex justify-between">
        <div onClick={() => setCurrentView('table')}>
          <button
            type="button"
            className={`${
              currentView === 'table' ? 'bg-base-100/80 text-primary' : 'bg-primary text-base-100'
            } rounded-full px-4 py-1 transition duration-300 focus:outline-none`}
          >
            <MdOutlineTableRestaurant className="text-[1.2rem]" />
          </button>

          <div className={'text-base-100 ml-2 text-sm font-normal'}>Tables</div>
        </div>
        <div onClick={() => setCurrentView('status')}>
          <button
            type="button"
            className={` ${
              currentView === 'status' ? 'bg-base-100/80 text-primary' : 'bg-primary text-base-100'
            } rounded-full px-4 py-1 transition duration-300 focus:outline-none`}
          >
            <MdAutorenew className="text-[1.2rem]" />
          </button>
          <div className={'text-base-100 ml-2 text-sm font-normal'}>Status</div>
        </div>

        <div onClick={() => setCurrentView('alert')} className="relative">
          <button
            type="button"
            className={`${
              currentView === 'alert' ? 'bg-base-100/80 text-primary' : 'bg-primary text-base-100'
            } rounded-full px-4 py-1 transition duration-300 focus:outline-none`}
          >
            {newAlertsCount === 0 ? (
              <RxBell className="text-[1.2rem]" />
            ) : (
              <>
                <span className="text-base-100 absolute right-2 top-0 ml-2 rounded-full bg-red-500 px-1 text-[0.625rem]">{newAlertsCount}</span>
                <RxBell className="text-[1.2rem]" />
              </>
            )}
          </button>

          <div className="text-base-100 ml-2 text-sm font-normal">Alerts</div>
        </div>

        <div onClick={() => setCurrentView('order')} className="relative">
          <button
            type="button"
            className={`${
              currentView === 'order' ? 'bg-base-100/80 text-primary' : 'bg-primary text-base-100'
            } rounded-full px-4 py-1 transition duration-300 focus:outline-none`}
          >
            {newOrderCount === 0 ? (
              <MdOutlineReceiptLong className="text-[1.2rem]" />
            ) : (
              <>
                <span className="text-base-100 absolute right-2 top-0 ml-2 rounded-full bg-red-500 px-1 text-[0.625rem]">{newOrderCount}</span>
                <MdOutlineReceiptLong className="text-[1.2rem]" />
              </>
            )}
          </button>

          <div className={'text-base-100 ml-2 text-sm font-normal'}>Orders</div>
        </div>
      </div>
    </div>
  );
}

export default TestFooter;
