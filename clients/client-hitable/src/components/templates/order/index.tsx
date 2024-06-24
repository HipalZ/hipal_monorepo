import axios from '@/axios';
import Loader from '@/components/atoms/loader';
import { useAlert } from '@/components/store/useAlert';
import { useBusinessStore } from '@/components/store/useBusinessData';
import { useCart, type ICartDish } from '@/components/store/useCart';
import { useLogin } from '@/components/store/useLogin';
import { useTable } from '@/components/store/useTable';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { memo, useState } from 'react';
import { BiStopwatch } from 'react-icons/bi';
import { MdOutlineNoFood } from 'react-icons/md';
import { toast } from 'react-toastify';

function Orders({ setCurrentView }) {
  const { orderData, setOrderData, setNewOrderCount } = useAlert();
  const [orderAcceptedIds, setOrderAcceptedIds] = useState<string[]>([]);
  const setTableData = useTable((s) => s.setTableData);
  const { setCart } = useCart();
  const businessData = useBusinessStore((s) => s.businessData);
  const router = useRouter();
  const { businessId, zoneId } = router.query as {
    businessId: string;
    zoneId: string;
  };
  const userDetail = useLogin((s) => s.userDetails);

  const result = async () => {
    try {
      const config = {
        method: 'GET',
        url: `/v1/kitchens/all/WaiterOrder?businessId=${businessId}&zoneId=${zoneId}&staffId=${userDetail?.id}`,
      };
      const response = await axios(config);
      const data = response.data;
      setOrderData(data);
      setNewOrderCount(data.length);
      return data;
    } catch (error) {
      toast.error('Failed to fetch orders');
    }
  };

  const {
    isLoading,
    error,
    data: order,
  } = useQuery({
    queryKey: ['fetchOrders', businessId, zoneId, userDetail?.id],
    queryFn: result,
    enabled: !!businessId && !!zoneId && !!userDetail?.id,
  });

  const addOrderAcceptedId = (id: string) => {
    setOrderAcceptedIds((prevIds) => [...prevIds, id]);
  };

  const acceptOrder = async (id: string) => {
    addOrderAcceptedId(id);
    try {
      const res = await axios.put(`/v1/kitchens/:id/acceptOrder/${id}`, {
        waiterName: userDetail?.name,
        kotPrinter: businessData?.kotPrinter,
      });
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const rejectOrder = async (id: string) => {
    addOrderAcceptedId(id);
    try {
      await axios.put(`/v1/kitchens/reject/Order/${id}`, {
        waiterName: userDetail?.name,
      });
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const editOrder = async (id: string) => {
    addOrderAcceptedId(id);
    try {
      const res = await axios.put(`/v1/kitchens/Edit/Order/${id}`, {
        waiterName: userDetail?.name,
      });
      toast.info('Please edit the order');

      const orderData = res.data;
      const tableId = orderData.tableId;
      const cartData = orderData.cart;

      for (const [dishId, dishData] of Object.entries(cartData)) {
        setCart(tableId, dishId, dishData as ICartDish);
      }

      setTableData({
        id: tableId,
        name: orderData.tableName,
      });
      rejectOrder(id);
      router.push(`/r/${businessId}/zone/${zoneId}/${tableId}?edit`);
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <button onClick={result} className="btn" type="button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-secondary min-h-screen">
      <div className="flex justify-between">
        <div className="text-base-content ml-6 mt-8 font-bold capitalize">Orders</div>

        <div
          onClick={() => {
            setCurrentView('history');
          }}
          className="text-primary-content bg-primary mr-6 mt-8 rounded-lg px-3 py-2 font-bold capitalize"
        >
          <BiStopwatch />
        </div>
      </div>

      {orderData.length > 0 ? (
        <div className="pb-[5rem]">
          {orderData.map((ele) => {
            if (orderAcceptedIds.includes(ele._id)) {
              return null;
            }
            return (
              <div key={ele.id} className={'bg-base-100 mx-6 mb-[1.5rem] mt-6 rounded-2xl'}>
                <div className="mx-4 flex justify-between pt-4">
                  <div className="flex flex-col">
                    <div className="font-[500] capitalize">{ele.tableName}</div>
                    <div className="text-base-content/40 mt-1 text-sm font-normal capitalize">{ele?.items?.[0]?.customerName}</div>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-md text-primary text-right font-[500]">{ele?.time}</div>
                    <div className="text-base-content/40 mt-1 text-sm font-normal capitalize">{ele?.date}</div>
                  </div>
                </div>
                <div className="mx-4 mt-4 rounded-full border-2 border-gray-400/50" />
                <div className="relative pb-[4.875rem] pt-2">
                  {ele.items.map((item, i) => (
                    <div key={`${item?.dish?.dishId}dish${i}`} className="mx-4 mt-4 flex">
                      <div className="w-[10%] font-[500]">{item?.dish?.qty} x</div>
                      <div className="ml-1 w-[80%] font-[500]">
                        {item?.dish?.name}
                        <div className="text-base-content/40 mt-1 text-sm font-normal capitalize">{item?.dish?.portions?.name}</div>
                        <div className="text-base-content/40 mt-1 text-sm font-normal capitalize">
                          {item?.dish?.extras?.map((extra) => `${extra?.name}, `)}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="absolute bottom-4 right-6 inline-flex">
                    <button
                      type="button"
                      disabled={orderAcceptedIds.includes(ele._id)}
                      onClick={() => editOrder(ele?._id)}
                      className="text-md text-primary mr-12 rounded-2xl px-6 py-1 font-[500]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={orderAcceptedIds.includes(ele._id)}
                      onClick={() => rejectOrder(ele?._id)}
                      className="text-md text-primary rounded-2xl px-6 py-1 font-[500]"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={orderAcceptedIds.includes(ele._id)}
                      onClick={() => acceptOrder(ele?._id)}
                      className="active_on_bounce border-primary text-md  text-primary rounded-2xl border px-6 py-1 font-[500]"
                    >
                      {orderAcceptedIds.includes(ele._id) ? 'Accepting...' : 'Accept'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="absolute left-0 right-0 top-[30%] m-auto flex flex-col items-center font-bold">
          <MdOutlineNoFood className="text-primary/30 mb-4 text-[5rem] md:text-[5rem] lg:text-[7rem]" />
          <div className="text-xl opacity-60 md:text-2xl lg:text-2xl xl:text-2xl">No orders ...</div>
        </div>
      )}
    </div>
  );
}

export default memo(Orders);
