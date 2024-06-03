import Header from "@/components/molecules/header";
import React, { memo, useEffect, useState } from "react";
import { BsChevronLeft } from "react-icons/bs";
import Hi from "@/assets/svg/hi.svg";
import DateRangePicker from "@/components/molecules/dateRangePicker";
import DueAccordion from "@/components/atom/dueAccordion";
import { useRouter } from "next/router";
import useTimings from "@/components/store/useTimings";
import type { IDuesData } from "@/components/types/businessData";
import axios from '@/axios';

function Dues() {
  const router = useRouter();
  const { businessId, duesPersonId } = router.query as {
    businessId: string;
    duesPersonId: string;
  };
  const { inTime, outTime } = useTimings();

  const [activeDues, setActiveDues] = useState<IDuesData | null>(null);

  const getActiveDueReport = async () => {
    let url = `/v1/payments/Get/DuesByUser?businessId=${businessId}&duesPersonId=${duesPersonId}`;
    if (inTime && outTime) {
      url += `&from=${inTime}&to=${outTime}`;
    }
    try {
      const res = await axios.get(url);

      setActiveDues(res.data);
    } catch (error) {
      console.error("Error fetching sales report:", error);
    }
  };

  useEffect(() => {
    getActiveDueReport();
  }, [inTime, outTime, duesPersonId]);
  useEffect(() => {
    router.push(router);
  }, []);
  
  return (
    <div className="bg-white">
      <div className="bg-[#f5f5f5] border-b border-[#CACACA]">
        <Header onBack={()=>router.push(`/business/${businessId}?tab=Dues`)} title="Dues" leftIcon={<BsChevronLeft />} centerImage={Hi} rightImage={Hi}  isIconBusinessShow={true}/>
        <div className="mx-6 mt-6 bg-[#204D42] text-white rounded-lg py-4">
          <div className="flex items-center justify-start">
            <div className="text-xl px-4 py-2 rounded-full mx-4 font-semibold bg-white text-[#204D42]">
              {activeDues?.userName?.[0]}
            </div>
            <div className="ml-2 text-xl font-normal">
              {activeDues?.userName}
              <div className="text-lg font-normal">
                ₹ {activeDues?.totalDues}
              </div>
            </div>
          </div>
        </div>
        <div className="py-4 ml-6 text-2xl font-normal">Dues</div>
      </div>
      <DateRangePicker />
      <DueAccordion activeDues={activeDues} />
    </div>
  );
}

export default memo(Dues);
