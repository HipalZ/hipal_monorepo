import { useHiClientZ } from '@/components/store/useHiClientzData';
import { useLiteStore } from '@/components/store/useLiteStore';
import { cn, timestampToDateTime } from '@/components/utils/helpers';
import { type ChangeEvent, memo, useCallback, useState } from 'react';
import { MdOutlineCall } from 'react-icons/md';
import { toast } from 'react-toastify';
import PopUp from '../popUp';
import LoadingSpinner from '../loadingSpinner';
import { apiRpc } from '@hi/common';
import { FiCopy } from "react-icons/fi";

const BillPopUpMemo = () => {
  const { selectedNavItem, viewData, removeOfflineAlert } = useLiteStore();
  const [textTick, setTextTick] = useState(false);
  const [numberText, setNumberTick] = useState(false);
  const clickViewMore = useLiteStore((s) => s.clickViewMore);
  const setClickViewMore = useLiteStore((s) => s.setClickViewMore);
  const [isLoading, setIsLoading] = useState(false);
  const [comment, setComment] = useState('');
  const { captainData } = useHiClientZ();

  const copyText = useCallback((id:string, value?:string) => {
    let text:string;
    if(value){
      text = value
    }else {
      text = document.querySelector(id)?.textContent || '';
    }
    navigator.clipboard
      .writeText(text)
      .then(() => {
        if(value){
          setNumberTick(true);
          setTimeout(() => {
            setNumberTick(false);
          }, 3000);
        }else{
          setTextTick(true);
          setTimeout(() => {
            setTextTick(false);
          }, 3000);
        }
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  },[]);

  const handleCloseAlert = async (id: string) => {
    try {
      await apiRpc.payments[':pid'].rejectOrder[':alertId'].$put({
        param: { alertId: id }
      })
      toast.success('order reject successfully');
      setClickViewMore(!clickViewMore);
      removeOfflineAlert(id);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCloseOnline = useCallback(() => {
    setClickViewMore(!clickViewMore);
  },[]);

  const handleConfirmAlert = async (id: string) => {
    setIsLoading(true);
    console.log('payload',comment)
    try {
      const res = await apiRpc.payments[':pid'].order[':alertId'].$put({
        param: { alertId: id },
        json: {
          comment: comment,
          waiterName: captainData?.name,
        }
      })
      const response = await res.json();
      console.log('response',response)
      if(res.status===200){
        toast.success('order confirm successfully');
      }
    } catch (err) {
      console.log(err);
      return {};
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = useCallback((id: string) => {
    handleConfirmAlert(id);
    removeOfflineAlert(id);
    setClickViewMore(!clickViewMore);
  },[]);

  const hideMiddleNumbers = useCallback((phone: string) => {
    if (phone.length <= 2) return phone;
    const firstPart = phone.slice(0, 2);
    const lastPart = phone.slice(-1);
    return `${firstPart}****${lastPart}`;
  },[]);

  const handleAddComment = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  },[comment]);

  const handleClosePopup = useCallback(() => {
    setClickViewMore(!clickViewMore);
  },[clickViewMore]);

  return (
    <PopUp show={clickViewMore} status={viewData?.alertType} onClose={handleClosePopup}>
      {isLoading ? <LoadingSpinner/> : <section style={{ maxHeight: '90%', overflowY: 'auto' }}>
        <div className="mx-6 mt-10 flex justify-between">
          <h1 className="text-gray-500">{timestampToDateTime(viewData?.date)}</h1>
          <p>{viewData?._id?.slice(-6)}</p>
        </div>
        <div className='bg-[#334C38] text-white mx-4 py-3 rounded-2xl my-4'>
          <center className='text-sm'>Bill value entered</center>
          <center>₹ {viewData?.order_id?.billValue}</center>
        </div>
        {viewData?.alertType === "OFFLINE" ? <div className="mx-6 mb-2 grid grid-cols-2 font-semibold">
          <h1>Staff</h1>
          <p>: {captainData?.name || 'Captain'}</p>
        </div>:null}
        <div className="mx-6 mb-2 grid grid-cols-2">
          <h1>Discount Coinz used</h1>
          <p>: {viewData?.order_id?.claimedCoins}</p>
        </div>
        <div className="mx-6 mb-2 grid grid-cols-2">
          <h1>Bill before discount</h1>
          <p>: ₹ {viewData?.order_id?.billValue - viewData?.order_id?.discount}</p>
        </div>
        <div className="mx-6 mb-2 grid grid-cols-2">
          <h1>Tips</h1>
          <p>: ₹ {viewData?.order_id?.tips}</p>
        </div>
        <div className="mx-4 mb-2 grid grid-cols-2 bg-green-100 p-2 rounded-2xl">
          <h1>Money to collect</h1>
          <p>: ₹ {viewData?.order_id?.total}</p>
        </div>
        <hr className="m-6 h-[0.1rem] bg-[#CACACA] text-black" />
        <div className="mx-6 mb-2 grid grid-cols-2">
          <h1>User</h1>
          <p>: {viewData?.order_id?.name}</p>
        </div>
        <div className="mx-6 mb-2 grid grid-cols-2">
          <h1>Table</h1>
          <p>: {viewData?.order_id?.tableName}</p>
        </div>
        <div className="mx-6 mb-2 grid grid-cols-2">
          <h1>Number</h1>
          <div className="flex" id="phone">
            <span>: {viewData?.order_id?.phone ? hideMiddleNumbers(viewData.order_id.phone) : ''}</span>&nbsp;&nbsp;
            <div className="flex self-end mr-1">
            <span
              className={cn('rounded-2xl px-4 py-2', numberText ? 'bg-green-500/20 text-green-500' : 'bg-[#f3eeff] text-[#7f46ff] ')}
              onClick={()=>copyText('#phone', viewData?.order_id?.phone)}
              style={{ cursor: 'pointer' }}
            >
              <FiCopy />
            </span>
          </div>
            <a href={`tel:+91${viewData?.order_id?.phone}`} className="flex items-center rounded-full bg-[#f3eeff] px-2 py-1 text-[#6f2eff]">
              <MdOutlineCall size={16} />
            </a>
          </div>
        </div>
        <div className="m-6 flex flex-col rounded-2xl bg-gray-300 p-4">
          <h1 id="discount-reason">
            <p>
              User : <b>{viewData?.order_id?.name}</b>
            </p>
            <p>Transaction Id : {viewData?._id}</p>
            <p>
              Total Bill : <b>₹ {viewData?.order_id?.billValue}</b>
            </p>
            <p>
              Applied Coinz : <b>{viewData?.order_id?.claimedCoins}</b>
            </p>
            <p>
              Paid Money : <b>₹ {viewData?.order_id?.total}</b>
            </p>
            <p>
              Final Discount to Apply in POS: <b>₹ {viewData?.posDiscount}</b>
            </p>
          </h1>
          <div className="flex self-end">
            <span
              className={cn('rounded-2xl px-4 py-2', textTick ? 'bg-green-500/20 text-green-500' : 'bg-[#f3eeff] text-[#7f46ff] ')}
              onClick={()=>copyText('#discount-reason')}
              style={{ cursor: 'pointer' }}
            >
              {textTick ? 'Copied' : 'Copy'}
            </span>
          </div>
        </div>
        {selectedNavItem === 'on floor'  ? <label className='mx-6'>Add Comment (optional)</label> : null}
        {selectedNavItem === 'on floor' ? (
          <div className="mx-6 mb-20 mt-4">
            <textarea
              onChange={handleAddComment}
              id="floating_outlined3"
              className="dark:text-white focus:border-primary peer mb-0 ml-0 mr-0 block w-full rounded-xl border border-black bg-transparent pb-3 pl-4 pr-4 pt-3 text-base text-gray-900 focus:outline-none dark:border-gray-600"
              placeholder="Enter Comment here..."
              required
              style={{
                resize: 'none',
              }}
            />
          </div>
        ) : null}
        {selectedNavItem === 'online' || selectedNavItem === 'history' ? (
          <div className="mb-5 flex justify-center">
            <button
              type="button"
              onClick={handleCloseOnline}
              className="on_active_bounce text-white fixed bottom-4 z-50 w-[20.5rem] rounded-full bg-black py-[0.75rem] text-[18px] leading-[1.15rem]"
            >
              Close alert
            </button>
          </div>
        ) : (
          <div className="bg-base-100 shadow-base-100 fixed bottom-0 z-20 w-[100%] max-w-[28rem] rotate-180 py-2 shadow-lg">
            <div className="flex rotate-180 justify-between gap-4">
              <button
                type="button"
                onClick={() => handleCloseAlert(viewData?._id)}
                className={
                  'bg-black text-white btn btn-outline btn-black btn-md my-auto ml-4 min-h-[3rem] w-[100%] max-w-[10rem] rounded-full !py-1 text-[1rem] font-semibold capitalize shadow-lg'
                }
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => handleConfirm(viewData._id)}
                className={
                  'bg-black text-white btn btn-black btn-md my-auto mr-4 min-h-[3rem] w-[100%] max-w-[10rem] rounded-full !py-1 text-[1rem]  capitalize shadow-lg'
                }
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </section>}
    </PopUp>
  );
}

const BillPopUp = memo(BillPopUpMemo);
export default BillPopUp;
