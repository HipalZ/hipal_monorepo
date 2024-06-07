import { BiRupee } from 'react-icons/bi';
import { IoReceiptOutline } from 'react-icons/io5';
import { MdTableRestaurant } from 'react-icons/md'; // Ensure you have installed react-icons

const Footer = ({ setCurrentView, currentView }) => {
  return (
    <div className="bg-primary fixed bottom-0 z-20 w-full">
      <div className="flex items-center justify-evenly py-2">
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => setCurrentView('zone')}
            className={`rounded-full px-6 py-2 ${currentView === 'zone' ? 'bg-base-100/50 text-primary' : 'text-base-100'} `}
          >
            <MdTableRestaurant className="text-xl " />
          </button>
          <span className="text-base-100">Zones</span>
        </div>
        <div className="text-base-100 flex flex-col items-center">
          <button
            type="button"
            onClick={() => setCurrentView('sale')}
            className={`rounded-full px-6 py-2 ${currentView === 'sale' ? 'bg-base-100/50 text-primary' : 'text-base-100'} `}
          >
            <BiRupee className="text-xl" />
          </button>
          <span className="text-base-100">Sales</span>
        </div>
        <div className="text-base-100 flex flex-col items-center">
          <button
            type="button"
            onClick={() => setCurrentView('bills')}
            className={`rounded-full px-6 py-2 ${currentView === 'bills' ? 'bg-base-100/50 text-primary' : 'text-base-100'} `}
          >
            <IoReceiptOutline className="text-xl" />
          </button>
          <span className="text-base-100">Bills</span>
        </div>
      </div>
    </div>
  );
};

export default Footer;
