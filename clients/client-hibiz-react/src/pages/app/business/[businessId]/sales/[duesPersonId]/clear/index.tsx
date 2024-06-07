import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import PopUp from '@/components/atom/popUp';
import SettlePopup from '@/components/atom/settlePopup';
import DateRangePicker from '@/components/molecules/dateRangePicker';
import Header from '@/components/molecules/header';
import useTimings from '@/components/store/useTimings';
import type { IDuesData } from '@/components/types/businessData';
import { memo, useEffect, useState } from 'react';
import { BsChevronLeft } from 'react-icons/bs';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

interface PaymentMethod {
  businessId: string;
  mode: string;
  commission: number;
  id: string;
}

function Clear() {
  const [activeDues, setActiveDues] = useState<IDuesData | null>(null);
  const [selectedDues, setSelectedDues] = useState<{ [id: string]: boolean }>({});
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const { businessId, duesPersonId } = useParams<{ businessId: string; duesPersonId: string }>();
  const { inTime, outTime } = useTimings();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const dues = activeDues?.items.filter((item) => !item.settle) || [];
  const getActiveDueReport = async () => {
    let url = `/v1/payments/Get/DuesByUser?businessId=${businessId}&duesPersonId=${duesPersonId}`;
    if (inTime && outTime) {
      url += `&from=${inTime}&to=${outTime}`;
    }
    try {
      const res = await axios.get(url);
      setActiveDues(res.data);
    } catch (error) {
      console.error('Error fetching sales report:', error);
    }
  };

  const selectedDuesIds = Object.keys(selectedDues).filter((id) => selectedDues[id]);

  const selectedDuesTotal = selectedDuesIds.reduce((sum, id) => {
    const due = dues.find((due) => due.id === id);
    return sum + (due?.total || 0);
  }, 0);

  const toggleSelect = (id: string) => {
    setSelectedDues((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const openModalOrShowToast = () => {
    if (selectedDuesTotal > 0) {
      openModal();
    } else {
      toast.error('Please select due first');
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get(`/v1/payments/Get/Modes?businessId=${businessId}`);

      // Filter out the specified modes
      const filteredData = response.data.filter((method: any) => !['dues', 'split payment', 'complimentary'].includes(method?.mode?.toLowerCase()));

      setPaymentMethods(filteredData);
    } catch (error) {
      console.error('Failed to fetch payment methods', error);
    }
  };

  useEffect(() => {
    getActiveDueReport();
  }, [inTime, outTime, duesPersonId]);

  useEffect(() => {
    fetchPaymentMethods();
  }, [duesPersonId]);

  return (
    <div className="bg-white">
      <div className="border-b border-[#CACACA] bg-[#f5f5f5]">
        <Header leftIcon={<BsChevronLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={true} />

        <div className="ml-6 mt-4 py-4 text-2xl font-normal">
          Settling for <span className="font-semibold capitalize text-[#204D42]">{activeDues?.userName}</span>
        </div>
      </div>
      <DateRangePicker />
      <div className="space-y-4">
        {dues?.map((due) => (
          <div
            onKeyDown={() => toggleSelect(due.id)}
            key={due.id}
            className={`mx-6 mt-4 rounded-md border px-4 py-2 ${selectedDues[due.id] ? 'border-[#219653] bg-[#219653]/10' : ''}`}
            onClick={() => toggleSelect(due.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-between">
                <div
                  style={{
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    background: selectedDues[due.id] ? 'rgba(33, 150, 83, 0.10)' : '#ffffff',
                    border: '1px solid #219653',
                    borderRadius: '4px',
                    position: 'relative',
                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.1s ease-in-out',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedDues[due.id] || false}
                    onClick={() => toggleSelect(due.id)}
                    onChange={() => toggleSelect(due.id)}
                    style={{
                      opacity: 0,
                      width: '100%',
                      height: '100%',
                      margin: 0,
                    }}
                  />
                  {selectedDues[due.id] && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '12px',
                        color: '#219653',
                      }}
                    >
                      ✔
                    </span>
                  )}
                </div>
                <span className="ml-2 font-medium">₹ {due?.total}</span>
              </div>
              <div className="text-sm opacity-60">{due?.date.slice(0, 16)}</div>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <div className="text-base font-medium capitalize opacity-70">{due?.customerName}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="fixed bottom-6 w-full px-6">
        <button
          type="button"
          onClick={openModalOrShowToast}
          className={`${
            selectedDuesTotal === 0 ? 'opacity-50' : ''
          } on_active_bounce mt-4 w-full rounded-lg border border-[#2B354D] bg-[#2B354D] px-4 py-2 font-semibold text-white`}
        >
          <div className="flex items-center justify-center">Pay ₹ {selectedDuesTotal}</div>
        </button>
      </div>
      {isModalOpen && (
        <PopUp show={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <SettlePopup
            closeModal={() => setIsModalOpen(false)}
            selectedDuesIds={selectedDuesIds}
            selectedDuesTotal={selectedDuesTotal}
            paymentMethods={paymentMethods}
          />
        </PopUp>
      )}
    </div>
  );
}

export default memo(Clear);
