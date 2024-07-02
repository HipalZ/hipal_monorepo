import { useLiteStore } from '@/components/store/useLiteStore';
import { Alert } from '@/components/types/hiClientzData';
import axios from '@/components/utils/axios';
import { cn, timestampToDateTime } from '@/components/utils/helpers';
import { memo } from 'react';
import { CiGlobe } from 'react-icons/ci';
import { IoCloseCircleSharp } from 'react-icons/io5';
import { PiCoinsFill } from 'react-icons/pi';

interface IOnlineProp {
  selectedNavItem: string;
  onlineAlertData: Alert[];
}

const OnlineAlertCard = memo((props: IOnlineProp) => {
  const { onlineAlertData } = props;
  const { removeOnlineAlert, setViewData, removeOnlineCount } = useLiteStore();
  const clickViewMore = useLiteStore((s) => s.clickViewMore);
  const setClickViewMore = useLiteStore((s) => s.setClickViewMore);

  const handleViewMore = (alert: Alert) => {
    setViewData(alert);
    setClickViewMore(!clickViewMore);
  };

  const handleRemoveAlert = async (id: string) => {
    try {
      const config = {
        method: 'PUT',
        url: `/v1/payments/:pid/order/${id}`,
      };
      const response = await axios(config);
      if (response.status === 200) {
        removeOnlineAlert(id);
        removeOnlineCount();
      }
    } catch (err) {
      console.log(err);
      return {};
    }
  };

  return (
    <main className="pb-[5rem] lg:grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.isArray(onlineAlertData) && onlineAlertData.length > 0 ? (
        onlineAlertData.map((alert: Alert) => {
          return (
            <section
              key={alert?._id}
              className={cn('relative mx-4 my-4 h-full rounded-xl bg-white p-4', alert?.status === 'FAIL' ? ' bg-red-100' : 'bg-green-100')}
            >
              <section className="mb-2 flex items-center justify-between">
                <article className={cn('flex w-[8rem] items-center rounded-full px-2')}>
                  <span>
                    <CiGlobe />
                  </span>
                  &nbsp;
                  <h1 className="text-xs font-semibold">
                    {alert?.status === 'FAIL' ? `Failed ${alert?.alertType.toLowerCase()}` : `Received ${alert?.alertType.toLowerCase()}`}
                  </h1>
                </article>
                <article>
                  <h1 className="text-xs text-gray-500">{timestampToDateTime(alert?.date)}</h1>
                </article>
                <IoCloseCircleSharp
                  onClick={() => handleRemoveAlert(alert?._id)}
                  size={28}
                  className="absolute -right-2 -top-2 inline text-red-400"
                />
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
                  <article className="space-y-1">
                    <h1 className="text-base text-gray-700">Table : {alert?.tableName}</h1>
                    <h6 className="text-2xl font-semibold">₹ {alert?.order_id?.total}</h6>
                  </article>
                  <button onClick={() => handleViewMore(alert)} className="mt-2 rounded-full bg-black px-6 py-2 text-white">
                    <h1 className="text-xs">More</h1>
                  </button>
                </section>
              </div>
            </section>
          );
        })
      ) : (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-2xl">No Data Found</div>
      )}
    </main>
  );
});

export default OnlineAlertCard;
