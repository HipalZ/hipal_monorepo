import { useLiteStore } from '@/components/store/useLiteStore';
import { Alert } from '@/components/types/hiClientzData';
import { cn, timestampToDateTime } from '@/components/utils/helpers';
import { memo } from 'react';
import { PiCoinsFill } from 'react-icons/pi';

interface IOnlineProp {
  onlineAlertData: Alert[];
}

const HistoryCard = (props: IOnlineProp) => {
  const { onlineAlertData } = props;
  const { setViewData } = useLiteStore((s)=>({
    setViewData: s.setViewData,
  }));
  const clickViewMore = useLiteStore((s) => s.clickViewMore);
  const setClickViewMore = useLiteStore((s) => s.setClickViewMore);

  const handleViewMore = (alert: Alert) => {
    setViewData(alert);
    setClickViewMore(!clickViewMore);
  };

  return (
    <main className="pb-[5rem] lg:grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.isArray(onlineAlertData) && onlineAlertData.length > 0 ? (
        onlineAlertData.map((alert: Alert) => {
          if (alert?.alertType === 'WAITER') {
            return null;
          }
          return (
            <section
              key={alert?._id}
              className={cn('max-h-[15rem]','mx-4 my-4 rounded-xl p-4', alert?.status === 'FAIL' ? 'bg-red-100' : 'bg-gray-300')}
            >
              <section className="mb-2 flex items-center justify-between">
                <article className={cn('flex w-[8rem] items-center rounded-full px-2', alert?.status === 'FAIL' ? '' : 'bg-green-100', alert?.alertType==='OFFLINE' ? 'bg-indigo-100' :'bg-green-100')}>
                  <span>
                    <PiCoinsFill />
                  </span>
                  &nbsp;
                  {alert?.status === 'FAIL' ? (
                    <h1 className="text-xs">Payment Failed</h1>
                  ) : (
                    <h1 className="text-xs">Received {alert?.alertType.toLowerCase()}</h1>
                  )}
                </article>
                <article>
                  <h1 className="text-xs text-gray-500">{timestampToDateTime(alert?.date)}</h1>
                </article>
              </section>
              <div className="flex justify-between">
                <section>
                  <article className="ml-2 space-y-1">
                    <h1 className="text-base">Bill value : ₹ {alert?.order_id?.billValue}</h1>
                    <h1 className="text-base">Discount : ₹ {alert?.order_id?.claimedCoins}</h1>
                    <h6 className="text-sm">Tips : ₹ {alert?.order_id?.tips}</h6>
                  </article>
                  {alert?.coinsApplied ? (
                    <article className="my-2 flex w-fit items-center justify-start rounded-full bg-gray-200 px-3">
                      <span>
                        <PiCoinsFill size={20} />
                      </span>
                      &nbsp;
                      <h1 className="text-xs">{alert?.order_id?.claimedCoins} Used</h1>
                    </article>
                  ) : null}
                </section>
                <section className="text-right">
                  <p>User : {alert?.order_id?.name?.length > 10 ? `${alert.order_id.name.substring(0, 10)}...` : alert?.order_id?.name}</p>
                  {alert?.alertType === 'ONLINE' ? null : <p>Waiter : {alert?.waiterName || 'Captain'}</p>}
                  <article className="space-y-1">
                    <h1 className="text-base text-gray-700">Table : {alert?.tableName}</h1>
                    <h6 className="text-2xl font-semibold">₹ {alert?.order_id?.total}</h6>
                  </article>
                  <button onClick={() => handleViewMore(alert)} className="mt-2 rounded-full bg-black px-6 py-2 text-white">
                    <h1 className="text-xs">View</h1>
                  </button>
                </section>
              </div>
              <br/>
              <br/>
            </section>
          );
        })
      ) : (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-2xl">No Data Found</div>
      )}
    </main>
  );
}

const HistoryCardMemo = memo(HistoryCard);
export default HistoryCardMemo;