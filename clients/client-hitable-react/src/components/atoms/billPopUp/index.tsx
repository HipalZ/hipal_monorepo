import avatar from '@/assets/img/avatar.png';
import success from '@/assets/svg/successIcon.svg';
import LoadingSpinner from '@/components/atoms/loadingSpinner';
import { useLiteStore } from '@/components/store/useLiteStore';
import axios from '@/components/utils/axios';
import { cn, timestampToDateTime } from '@/components/utils/helpers';
import { ChangeEvent, memo, useState } from 'react';
import { MdOutlineCall, MdOutlineMessage } from 'react-icons/md';
import { toast } from 'react-toastify';
import PopUp from '../popUp';

const BillPopUp = memo(() => {
  const { selectedNavItem, clickedConfirm, setClickedConfirm, viewData, setViewData, removeOfflineAlert } = useLiteStore();
  const [showTick, setShowTick] = useState(false);
  const clickViewMore = useLiteStore((s) => s.clickViewMore);
  const setClickViewMore = useLiteStore((s) => s.setClickViewMore);
  const [clickComment, setClickComment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [comment, setComment] = useState('');

  const copyText = () => {
    const text = document.querySelector('#discount-reason')?.textContent || '';
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setShowTick(true);
        setTimeout(() => {
          setShowTick(false);
        }, 3000);
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  };

  const handleCloseAlert = async (id: string) => {
    try {
      const config = {
        method: 'PUT',
        url: `/v1/payments/:pid/rejectOrder/${id}`,
      };
      await axios(config);
      toast.success('order reject successfully');
      setClickViewMore(!clickViewMore);
      removeOfflineAlert(id);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCloseOnline = () => {
    setClickViewMore(!clickViewMore);
  };

  const handleConfirmAlert = async (id: string) => {
    setIsLoading(true);
    try {
      const config = {
        method: 'PUT',
        url: `/v1/payments/:pid/order/${id}`,
        data: {
          comment: comment,
        },
      };
      const response = await axios(config);
      if (response.status === 200) {
        setViewData({ ...viewData, completionCode: response.data.data.completionCode });
      }
    } catch (err) {
      console.log(err);
      return {};
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = (id: string) => {
    handleConfirmAlert(id);
    setClickedConfirm(true);
  };

  const handleCloseConfirm = (id: string) => {
    setClickViewMore(!clickViewMore);
    removeOfflineAlert(id);
    setClickedConfirm(false);
  };

  const ConfirmPopUp = () => {
    const numberString = viewData?.completionCode?.toString() || '';
    return (
      <section style={{ maxHeight: '90%', overflowY: 'auto' }} className="mt-10 flex flex-col items-center justify-center">
        <h6>Confirmed by</h6>
        <br />
        <h6 className="rounded-full bg-gray-300 p-3 text-white">
          <img src={avatar} alt="avatar" width={20} />
        </h6>
        <p>{viewData?.order_id?.name}</p>
        <br />
        <img src={success} alt="success" width={80} height={80} className="animate-pulse" />
        <br />
        <p>Share Completion code with {viewData?.order_id?.name}</p>
        <div className="mt-10">
          {numberString.split('').map((digit, index) => (
            <span key={index} className="m-4 bg-gray-300 px-4 py-3">
              {digit}
            </span>
          ))}
        </div>
        <div className="mb-5 flex justify-center">
          <button
            onClick={() => handleCloseConfirm(viewData._id)}
            className="on_active_bounce text-base-100 fixed bottom-4 z-50 w-[20.5rem] rounded-full bg-black py-[0.75rem] text-[18px] leading-[1.15rem]"
          >
            Close
          </button>
        </div>
        {isLoading ? <LoadingSpinner /> : null}
      </section>
    );
  };

  const hideMiddleNumbers = (phone: string) => {
    if (phone.length <= 4) return phone;
    const firstPart = phone.slice(0, 3);
    const lastPart = phone.slice(-3);
    return `${firstPart}****${lastPart}`;
  };

  const handleComment = () => {
    console.log('comment');

    setClickComment(!clickComment);
  };

  const handleAddComment = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const handleClosePopup = () => {
    setClickViewMore(!clickViewMore);
  };

  return (
    <PopUp show={clickViewMore} status={viewData?.alertType} onClose={handleClosePopup}>
      {clickedConfirm && selectedNavItem !== 'history' ? (
        <ConfirmPopUp />
      ) : (
        <section style={{ maxHeight: '90%', overflowY: 'auto' }}>
          <div className="mx-6 mt-10 flex justify-between">
            <h1 className="text-base text-gray-500">{timestampToDateTime(viewData?.date)}</h1>
            <p>{viewData?._id?.slice(-6)}</p>
          </div>
          {viewData?.alertType !== 'ONLINE' && viewData?.alertType !== 'WAITER' && viewData?.completionCode !== null ? (
            <center className="mt-4">
              {viewData?.completionCode
                ?.toString()
                ?.split('')
                .map((digit, index) => (
                  <span key={index} className="mx-2 bg-gray-500 px-2 py-2 text-white">
                    {digit}
                  </span>
                ))}
            </center>
          ) : null}
          &nbsp;
          <div className="mx-6 mb-2 grid grid-cols-2">
            <h1>Paid Amount</h1>
            <p>: ₹ {viewData?.order_id?.total}</p>
          </div>
          <div className="mx-6 mb-2 grid grid-cols-2">
            <h1>Bil value entered</h1>
            <p>: ₹ {viewData?.order_id?.billValue}</p>
          </div>
          <div className="mx-6 mb-2 grid grid-cols-2">
            <h1>Including tips</h1>
            <p>: ₹ {viewData?.order_id?.tips}</p>
          </div>
          <div className="mx-6 mb-2 grid grid-cols-2">
            <h1>Discount</h1>
            <p>: {viewData?.order_id?.claimedCoins} Coin used</p>
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
            <div className="flex">
              <span>: {viewData?.order_id?.phone ? hideMiddleNumbers(viewData.order_id.phone) : ''}</span>&nbsp;&nbsp;
              <a href={`tel:+91${viewData?.order_id?.phone}`} className="flex items-center rounded-full bg-[#f3eeff] px-2 py-1 text-[#6f2eff]">
                <MdOutlineCall size={16} />
                <span className="text-sm">Call</span>
              </a>
            </div>
          </div>
          <div className="m-6 flex flex-col rounded-2xl bg-gray-300 p-4">
            <h1 id="discount-reason">
              User {viewData?.order_id?.name} has paid ₹ {viewData?.order_id?.total} discount applied ₹ {viewData?.order_id?.claimedCoins} transaction
              id {viewData?._id}
            </h1>
            <br />
            <div className="flex self-end">
              <span
                className={cn('rounded-2xl px-4 py-2', showTick ? 'bg-green-500/20 text-green-500' : 'bg-[#f3eeff] text-[#7f46ff] ')}
                onClick={copyText}
                style={{ cursor: 'pointer' }}
              >
                {showTick ? 'Copied' : 'Copy'}
              </span>
            </div>
          </div>
          {selectedNavItem === 'on floor' ? (
            <div onClick={handleComment} className="m-6 flex h-[2rem] w-[10.5rem] items-center space-x-2 rounded-2xl bg-black p-4 text-white">
              <MdOutlineMessage />
              <button>Add Comment</button>
            </div>
          ) : null}
          {!clickComment && selectedNavItem === 'on floor' ? (
            <div className="mx-6">
              <textarea
                onChange={handleAddComment}
                id="floating_outlined3"
                className="dark:text-base-100 focus:border-primary peer mb-0 ml-0 mr-0 block w-full rounded-xl border border-black bg-transparent pb-3 pl-4 pr-4 pt-3 text-base text-gray-900 focus:outline-none dark:border-gray-600"
                placeholder=" "
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
                onClick={handleCloseOnline}
                className="on_active_bounce text-base-100 fixed bottom-4 z-50 w-[20.5rem] rounded-full bg-black py-[0.75rem] text-[18px] leading-[1.15rem]"
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
                    'btn btn-outline btn-black btn-md my-auto ml-4 min-h-[3rem] w-[100%] max-w-[10rem] rounded-full !py-1 text-[1rem] font-semibold capitalize shadow-lg'
                  }
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirm(viewData._id)}
                  className={
                    'btn btn-black btn-md my-auto mr-4 min-h-[3rem] w-[100%] max-w-[10rem] rounded-full !py-1 text-[1rem]  capitalize shadow-lg'
                  }
                >
                  Confirm
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </PopUp>
  );
});

export default BillPopUp;
