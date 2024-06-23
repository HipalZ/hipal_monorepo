import { useLiteStore } from "@/components/store/useLiteStore";
import { cn, timestampToDateTime } from "@/components/utils/helpers";
import { memo, useState } from "react";
import { MdOutlineCall, MdOutlineMessage } from "react-icons/md";
import PopUp from "../popUp";
import avatar from "@/assets/img/avatar.png";
import success from '@/assets/svg/successIcon.svg'
import axios from "@/components/utils/axios";
import LoadingSpinner from "@/components/atoms/loadingSpinner";

const BillPopUp = memo(() => {
    const { selectedNavItem, clickedConfirm, setClickedConfirm, viewData, setViewData } = useLiteStore();
    const [showTick, setShowTick] = useState(false);
    const clickViewMore = useLiteStore((s) => s.clickViewMore);
    const setClickViewMore = useLiteStore((s) => s.setClickViewMore)
    const [clickComment, setClickComment] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [comment, setComment] = useState('')

    const copyText = () => {
        const text = document.querySelector('#discount-reason')?.textContent || '';
        navigator.clipboard.writeText(text).then(() => {
            setShowTick(true);
            setTimeout(() => {
                setShowTick(false);
            }, 3000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    const handleCloseAlert = () => {
        setClickViewMore(!clickViewMore);
    }

    const handleConfirmAlert = async (id: string) => {
        setIsLoading(true)
        try {
            const config = {
                method: "PUT",
                url: `/v1/payments/:pid/order/${id}`,
                data: {
                    comment: comment
                }
            };
            const response = await axios(config);
            if (response.status === 200) {
                setViewData({ ...viewData, completionCode: response.data.data.completionCode })
            }
        } catch (err) {
            console.log(err);
            return {};
        }
        finally {
            setIsLoading(false)
        }
    }

    const handleConfirm = (id: string) => {
        handleConfirmAlert(id)
        setClickedConfirm(true);
    }

    const handleCloseConfirm = () => {
        setClickViewMore(!clickViewMore);
        setClickedConfirm(false);
    }

    const ConfirmPopUp = () => {
        const numberString = viewData?.completionCode?.toString() || '';
        return (
            <section style={{ maxHeight: '90%', overflowY: 'auto' }} className="flex flex-col justify-center items-center mt-10">
                <h6>Confirmed by</h6>
                <br />
                <h6 className="bg-gray-300 rounded-full p-3 text-white">
                    <img src={avatar} alt="avatar" width={20} />
                </h6>
                <p>{viewData?.order_id?.name}</p>
                <br />
                <img
                    src={success}
                    alt='success'
                    width={80}
                    height={80}
                    className='animate-pulse'
                />
                <br />
                <p>Share Completion code with {viewData?.order_id?.name}</p>
                <div className="mt-10">
                    {numberString.split('').map((digit, index) => (
                        <span key={index} className="px-4 py-3 m-4 bg-gray-300">
                            {digit}
                        </span>
                    ))}
                </div>
                <div className="flex justify-center mb-5">
                    <button
                        onClick={handleCloseConfirm}
                        className="on_active_bounce fixed bottom-4 z-50 bg-black rounded-full w-[20.5rem] py-[0.75rem] text-base-100 text-[18px] leading-[1.15rem]"
                    >
                        Close
				</button>
                </div>
                {isLoading ? <LoadingSpinner /> : null}
            </section>
        )
    }

    const hideMiddleNumbers = (phone: string) => {
        if (phone.length <= 4) return phone;
        const firstPart = phone.slice(0, 3);
        const lastPart = phone.slice(-3);
        return `${firstPart}****${lastPart}`;
    };

    const handleComment = () => {
        console.log('comment')
        
        setClickComment(!clickComment)
    }
    const handleAddComment = (e) => {
        setComment(e.target.value)
    }

    return (
        <PopUp show={clickViewMore} status={viewData?.alertType}>
            {clickedConfirm && selectedNavItem !== "history" ?
                <ConfirmPopUp />
                : <section style={{ maxHeight: '90%', overflowY: 'auto' }}>
                    <div className="flex justify-between mt-10 mx-6">
                        <h1 className="text-base text-gray-500">{timestampToDateTime(viewData?.date)}</h1>
                        <p>{viewData?.payment_id}</p>
                    </div>
            &nbsp;
            <div className="grid grid-cols-2 mx-6 mb-2">
                        <h1>Paid Amount</h1>
                        <p>: ₹ {viewData?.order_id?.total}</p>
                    </div>
                    <div className="grid grid-cols-2 mx-6 mb-2">
                        <h1>Bil value entered</h1>
                        <p>: ₹ {viewData?.order_id?.billValue}</p>
                    </div>
                    <div className="grid grid-cols-2 mx-6 mb-2">
                        <h1>Including tips</h1>
                        <p>: ₹ {viewData?.order_id?.tips}</p>
                    </div>
                    <div className="grid grid-cols-2 mx-6 mb-2">
                        <h1>Discount</h1>
                        <p>: {viewData?.order_id?.discount} Coin used</p>
                    </div>
                    <hr className="bg-[#CACACA] h-[0.1rem] text-black m-6" />
                    <div className="grid grid-cols-2 mx-6 mb-2">
                        <h1>User</h1>
                        <p>: {viewData?.order_id?.name}</p>
                    </div>
                    <div className="grid grid-cols-2 mx-6 mb-2">
                        <h1>Table</h1>
                        <p>: {viewData?.order_id?.tableName}</p>
                    </div>
                    <div className="grid grid-cols-2 mx-6 mb-2">
                        <h1>Number</h1>
                        <div className="flex">
                            <span>: {viewData?.order_id?.phone ? hideMiddleNumbers(viewData.order_id.phone) : ''}</span>&nbsp;&nbsp;
                        <a href={`tel:+91${viewData?.order_id?.phone}`} className="text-[#6f2eff] bg-[#f3eeff] px-2 py-1 rounded-full flex items-center">
                                <MdOutlineCall size={16} /><span className="text-sm">Call</span>
                            </a>
                        </div>
                    </div>
                    <div className="bg-gray-300 m-6 p-4 rounded-2xl flex flex-col">
                        <h1 id="discount-reason">User {viewData?.order_id?.name} discount applied ₹ {viewData?.order_id?.claimedCoins}</h1>
                        <br />
                        <div className="flex self-end">
                            <span className={cn("px-4 py-2 rounded-2xl", showTick ? 'text-green-500 bg-green-500/20' : 'text-[#7f46ff] bg-[#f3eeff] ')} onClick={copyText} style={{ cursor: 'pointer' }}>{showTick ? 'Copied' : 'Copy'}</span>
                        </div>
                    </div>
                    {selectedNavItem === "on floor" ? <div onClick={handleComment} className="m-6 p-4 rounded-2xl flex items-center space-x-2 text-white w-[10.5rem] h-[2rem] bg-black"><MdOutlineMessage />
                        <button>Add Comment</button>
                    </div>:null}
                    {!clickComment && selectedNavItem ==="on floor" ? <div className="mx-6">
                        <textarea
                            onChange={handleAddComment}
                            id="floating_outlined3"
                            className="block w-full pt-3 pb-3 pl-4 pr-4 mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border border-black rounded-xl dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
                            placeholder=" "
                            required
                            style={{
                                resize: 'none',
                            }}
                        />
                    </div> : null}
                    {selectedNavItem === "online" || selectedNavItem === "history" ?
                        <div className="flex justify-center mb-5">
                            <button
                                onClick={handleCloseAlert}
                                className="on_active_bounce fixed bottom-4 z-50 bg-black rounded-full w-[20.5rem] py-[0.75rem] text-base-100 text-[18px] leading-[1.15rem]"
                            >
                                Close alert
				</button>
                        </div> :
                        <div className='fixed w-[100%] max-w-[28rem] bottom-0 z-20 py-2 rotate-180 shadow-lg bg-base-100 shadow-base-100'>
                            <div className='flex justify-between gap-4 rotate-180'>
                                <button
                                    type='button'
                                    onClick={handleCloseAlert}
                                    className={
                                        'min-h-[3rem] capitalize w-[100%] max-w-[10rem] btn btn-outline btn-black ml-4 btn-md font-semibold text-[1rem] rounded-full shadow-lg my-auto !py-1'
                                    }
                                >
                                    Cancel
                                </button>
                                <button
                                    type='button'
                                    onClick={() => handleConfirm(viewData._id)}
                                    className={
                                        'min-h-[3rem] capitalize w-[100%] max-w-[10rem] mr-4 btn btn-black btn-md text-[1rem] rounded-full shadow-lg  my-auto !py-1'
                                    }
                                >
                                    Confirm
						</button>
                            </div>
                        </div>
                    }
                </section>}
        </PopUp>
    )
})

export default BillPopUp