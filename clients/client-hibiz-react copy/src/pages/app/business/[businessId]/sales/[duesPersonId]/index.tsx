import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import DueAccordion from '@/components/atom/dueAccordion';
import DateRangePicker from '@/components/molecules/dateRangePicker';
import Header from '@/components/molecules/header';
import useTimings from '@/components/store/useTimings';
import type { IDuesData } from '@/components/types/businessData';
import { memo, startTransition, useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

const Dues = memo(() => {
  const { businessId, duesPersonId } = useParams<{ businessId: string; duesPersonId: string }>();
  const navigate = useNavigate();
  const { inTime, outTime } = useTimings();

  const [activeDues, setActiveDues] = useState<IDuesData | null>(null);

  const getActiveDueReport = async () => {
    let url = `/v1/payments/Get/DuesByUser?businessId=${businessId}&duesPersonId=${duesPersonId}`;
    if (inTime && outTime) {
      url += `&from=${inTime}&to=${outTime}`;
    }
    try {
      const res = await axios.get(url);

      setActiveDues(res.data.data);
    } catch (error) {
      console.error('Error fetching sales report:', error);
    }
  };

  useEffect(() => {
    getActiveDueReport();
  }, [inTime, outTime, duesPersonId]);

  const handleBack = () => {
    startTransition(() => {
      navigate(`/app/business/${businessId}/sales?tab=Dues`);
    });
  };

  return (
    <div className="bg-white">
      <div className=" linear_gradient_background">
        <Header onBack={handleBack} title="Dues" leftIcon={<FaArrowLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={true} />
        <div className="mx-6 mt-6 rounded-lg bg-[#204D42] py-4 text-white">
          <div className="flex items-center justify-start">
            <div className="mx-4 rounded-full bg-white px-4 py-2 text-xl font-semibold text-[#204D42]">{activeDues?.userName?.[0]}</div>
            <div className="ml-2 text-xl font-normal">
              {activeDues?.userName}
              <div className="text-lg font-normal">₹ {activeDues?.totalDues}</div>
            </div>
          </div>
        </div>
        <div className="py-4 ml-6 text-2xl font-normal">Dues</div>
      </div>
      <DateRangePicker />
      <DueAccordion activeDues={activeDues} />
    </div>
  );
});

export default Dues;
