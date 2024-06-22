import { useCustomerzData } from '@/components/store/useCustomerzData';
import { formatDate } from '@/components/templates/customerz';
import type { ICustomer } from '@/components/types/businessData';
import { memo, startTransition } from 'react';
import { MdPerson } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';

export const BeforeMemoCustomerzList = (data: { customerData: ICustomer[] }) => {
  const { customerData } = data;
  const navigate = useNavigate();
  const { setCustomerzName, setCustomerzPhone } = useCustomerzData();
  const { businessId } = useParams<{
    businessId: string;
  }>();
  const customerDetails = (id: string, name: string, phone: string) => {
    setCustomerzName(name);
    setCustomerzPhone(phone);
    startTransition(() => {
      navigate(`/app/business/${businessId}/customerz/${id}`);
    });
  };
  return (
    <article className="masonry-layout mx-6 mt-6 pb-[6rem]">
      {customerData?.length ? (
        customerData.map((data) => (
          <div
            key={data?._id}
            className="on_active_bounce masonry-item rounded-lg border border-[#cacaca] bg-white px-4 font-medium capitalize text-[#000000]"
          >
            <div className="flex items-center py-2">
              <MdPerson className="mr-2" />
              <h1 className="text-lg">{data.name}</h1>
            </div>
            <div onClick={() => customerDetails(data._id, data.name, data.phone)} className="flex items-center justify-between py-2">
              <span className="text-sm">Dined on {formatDate(new Date(data.date))}</span>
              <span className="justify-self">view</span>
            </div>
          </div>
        ))
      ) : (
        <center>No Bills Found</center>
      )}
    </article>
  );
};

export const CustomerzList = memo(BeforeMemoCustomerzList);
