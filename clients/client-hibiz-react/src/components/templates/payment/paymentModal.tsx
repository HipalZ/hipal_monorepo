import { MdOutlineCall } from 'react-icons/md'

const PaymentModal = () => {
  return (
    <section className="h-auto max-h-[85vh] overflow-auto">
    <div className="flex justify-between mx-6 mt-10">
        <h1 className="text-base text-gray-500">12th May 12:45 PM</h1>
        <p>ID-2234BA</p>
    </div>
    &nbsp;
    <div className="grid grid-cols-2 mx-6 mb-2">
        <h1>Paid Amount</h1>
        <p>: ₹ 524</p>
    </div>
    <div className="grid grid-cols-2 mx-6 mb-2">
        <h1>Bil value entered</h1>
        <p>: ₹ 500</p>
    </div>
    <div className="grid grid-cols-2 mx-6 mb-2">
        <h1>Including tips</h1>
        <p>: ₹ 25</p>
    </div>
    <div className="grid grid-cols-2 mx-6 mb-2">
        <h1>Discount</h1>
        <p>: 1 Coin used</p>
    </div>
    
    
    <hr className="bg-[#CACACA] h-[0.1rem] text-black m-6" />
    <div className="grid grid-cols-2 mx-6 mb-2">
        <h1>User</h1>
        <p>: Rishabh Hurshan</p>
    </div>
    <div className="grid grid-cols-2 mx-6 mb-2">
        <h1>Table</h1>
        <p>: T-12</p>
    </div>
    <div className="grid grid-cols-2 mx-6 mb-2">
        <h1>Number</h1>
        <div className="flex">
            <span>: 91*****4130</span>&nbsp;&nbsp;
            <a href="tel:+9191*****4130" className="text-[#6f2eff] bg-[#f3eeff] px-2 py-1 rounded-full flex items-center">
                <MdOutlineCall size={16} /><span className="text-sm">Call</span>
            </a>
        </div>
    </div>
    <div className="grid grid-cols-2 mx-6 mb-2">
        <h1>Rewarded</h1>
        <p>: 220 Coinz</p>
    </div>
    <div className="flex flex-col p-4 m-6 bg-gray-300 rounded-2xl">
        <h1 id="discount-reason">Hi discount applied ₹ 25 ; coinz-used 1 rewarded ₹ 25</h1>
    </div>
    <div className="flex justify-center mb-5">
        <button
            // onClick={handleCloseAlert}
            className="on_active_bounce fixed bottom-4 z-50 bg-black rounded-full w-[20.5rem] py-[0.75rem] text-base-100 text-[18px] leading-[1.15rem]"
        >
            Close alert
        </button>
    </div>
</section>
  )
}

export default PaymentModal