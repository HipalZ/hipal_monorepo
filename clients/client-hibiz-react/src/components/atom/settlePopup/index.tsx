import axios from '@/axios';
import { PAGE_TYPES, routePathsWithIds } from '@/components/utils/routes';
import React, { memo, startTransition, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

interface PaymentMethod {
  businessId: string;
  mode: string;
  commission: number;
  id: string;
}
interface SettlePopupProps {
  closeModal: () => void;
  selectedDuesIds: string[];
  selectedDuesTotal: number;
  paymentMethods: PaymentMethod[];
}

const SettlePopup: React.FC<SettlePopupProps> = ({ closeModal, selectedDuesIds, selectedDuesTotal, paymentMethods }) => {
  const navigate = useNavigate();
  const [paymentMode, setPaymentMode] = useState(''); // Set default payment mode to 'paytm'
  const inputRef = useRef<HTMLInputElement>(null);
  const { businessId, duesPersonId } = useParams<{
    businessId: string;
    duesPersonId: string;
  }>();
  const handleSuggestionClick = (suggestion: string) => {
    setPaymentMode(suggestion);
  };
  const settleDues = async () => {
    if (!paymentMode || paymentMode.trim() === '') {
      return toast.error('Please select a payment mode');
    }
    try {
      await axios.put(`/v1/payments/Settle/Dues`, {
        paymentIds: selectedDuesIds,
        mode: paymentMode,
      });
      toast.success('Dues settled successfully');
      closeModal();
      startTransition(() => {
        navigate(routePathsWithIds[PAGE_TYPES.DUES](businessId || '', duesPersonId || ''));
      });
    } catch (error) {
      console.error('Error settling dues:', error);
    }
  };

  useEffect(() => {
    const handleFocus = () => {
      if (inputRef.current) {
        inputRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };

    inputRef.current?.addEventListener('focus', handleFocus);

    return () => {
      inputRef.current?.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <div className="rounded-t-[1.5rem] bg-[#f5f5f5] p-6">
      <h3 className="mb-2 text-xl font-medium text-[#2B354D]">Confirm payment of ₹ {selectedDuesTotal}</h3>

      <input
        ref={inputRef}
        type="text"
        value={paymentMode}
        onChange={(e) => setPaymentMode(e.target.value.toLowerCase())}
        className="mb-4 w-full rounded border px-3 py-2 focus:border focus:border-[#2B354D] focus:outline-none"
        placeholder="Enter Mode"
      />

      <span>Select payment mode</span>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-6">
        {paymentMethods.map((method) => (
          <button
            type="button"
            key={method.id} // <-- Use the method's id for the key
            onClick={() => handleSuggestionClick(method.mode)}
            className={`on_active_bounce rounded-lg px-3 py-2 text-sm font-medium capitalize ${
              paymentMode === method.mode ? 'bg-[#2B354D] text-white' : 'bg-white text-[#2B354D]'
            }`}
          >
            {method.mode}
          </button>
        ))}
      </div>
      <button type="button" onClick={settleDues} className="on_active_bounce mx-auto mt-6 w-full rounded-lg bg-[#2B354D] px-4 py-2 text-white">
        Pay ₹ {selectedDuesTotal}
      </button>
    </div>
  );
};

export default memo(SettlePopup);
