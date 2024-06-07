import axios from '@/axios';
import { useStaff } from '@/components/store/useStaff';
import { PAGE_TYPES, routePathsWithIds } from '@/components/utils/routes';
import { useQuery } from '@tanstack/react-query';
import { memo, startTransition, useEffect } from 'react';
import { MdPerson } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../loadingSpinner';

function SalesTips() {
  const { setSelectedWaiter } = useStaff();
  const navigate = useNavigate();
  const { businessId } = useParams<{ businessId: string }>();
  const handleClick = (str: string) => {
    setSelectedWaiter(str);
    startTransition(() => {
      navigate(routePathsWithIds[PAGE_TYPES.TIPS](businessId || '', str));
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set('tab', 'Tips');
    startTransition(() => {
      navigate({ search: params.toString() }, { replace: true });
    });
  }, [location, navigate]);

  const getWaiterTips = async () => {
    try {
      const response = await axios.get(`/v1/payments/:id/tips?businessId=${businessId}`);
      return response.data;
    } catch (e) {
      console.log(e);
    }
  };

  const { isLoading, error, data } = useQuery({
    queryKey: ['tips', businessId],
    queryFn: getWaiterTips,
    enabled: !!businessId,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="masonry-layout mx-6 mt-6 pb-[6rem]">
      {data && data.length > 0 ? (
        data.map((tips: any, i: number) => (
          <div
            key={i}
            onClick={() => handleClick(tips.waiterName)}
            className="masonry-item on_active_bounce rounded-lg border border-[#cacaca] bg-white font-medium capitalize text-[#2B354D]"
          >
            <div className="flex items-center px-4 py-2">
              <MdPerson className="mr-2" />
              <span>{tips?.waiterName}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="ml-1 text-sm opacity-60">Tips given for ₹ {tips?.tips}</span>
              <span>view</span>
            </div>
          </div>
        ))
      ) : (
        <div className="fixed left-1/2 top-1/2 flex -translate-x-1/2 transform flex-col text-center">No Tips Found</div>
      )}
    </div>
  );
}

export default memo(SalesTips);
