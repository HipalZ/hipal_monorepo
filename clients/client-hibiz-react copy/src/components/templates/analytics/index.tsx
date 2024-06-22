import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import ErrorComponent from '@/components/errorComponent';
import DateRangePicker from '@/components/molecules/dateRangePicker';
import Header from '@/components/molecules/header';
import { useSelectedIcon } from '@/components/store/useSelectedIcon';
import useTimings from '@/components/store/useTimings';
import { routeToDashboard } from '@/components/utils/routes';
import { useQuery } from '@tanstack/react-query';
import { memo, startTransition } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import AnalyticsCategory from './category';
import AnalyticsDish from './dish';

interface IAnalytics {
  [key: string]: string;
}

function Analytics() {
  const navigate = useNavigate();
  const { inTime, outTime } = useTimings();
  const { setSelectedIcon, selectedSubIcon, setSelectedSubIcon } = useSelectedIcon();
  const { businessId } = useParams<{ businessId: string }>();
  const getSalesReport = async () => {
    let url = `/v1/kitchens/:id/Category&Dishes?businessId=${businessId}`;
    if (inTime && outTime) {
      url += `&from=${inTime}&to=${outTime}`;
    }

    try {
      const res = await axios.get(url);
      return res.data.data;
    } catch (error) {
      console.error('Error fetching sales report:', error);
    }
  };

  const goAnalytics = (str: string) => {
    setSelectedSubIcon(str);
  };

  const {
    isLoading,
    error,
    data: analytics,
    refetch,
  } = useQuery<IAnalytics | null>({
    queryKey: ['analytics', businessId, inTime, outTime],
    queryFn: getSalesReport,
    enabled: !!businessId && !!inTime && !!outTime,
  });

  const handleBack = () => {
    startTransition(() => {
      navigate(routeToDashboard(businessId as string));
    });
    setSelectedIcon('');
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorComponent refetch={refetch} />;

  const analyticsRender = () => {
    switch (selectedSubIcon) {
      case 'category':
        return <AnalyticsCategory />;
      case 'dish':
        return <AnalyticsDish />;
      default:
        return (
          <>
           <div className="linear_gradient_background">
              <Header title="Analytics" onBack={handleBack} leftIcon={<FaArrowLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={true} />
              <div className="flex items-center justify-between px-6 pb-4 mt-6">
                <div className="flex text-2xl">
                  <span className="ml-2"> Analytics</span>
                </div>
              </div>
            </div>
            <DateRangePicker />

            {analytics && (
              <div className="grid grid-cols-2 gap-6 p-6">
                {analytics &&
                  Object.keys(analytics).map((key) => (
                    <div key={key} className="rounded-md border border-[#cacaca] bg-white p-4">
                      <h3 className="mb-4 text-sm font-medium text-[#000000] opacity-60">{key}</h3>
                      <p className="text-lg font-medium text-[#000000]">{analytics[key]}</p>
                    </div>
                  ))}
              </div>
            )}
            {analytics && (
              <div className="grid grid-cols-1 gap-6 mx-6">
                {analytics &&
                  Object.keys(analytics).map((key) => (
                    <div
                      key={key}
                      onKeyDown={() => goAnalytics(key)}
                      onClick={() => goAnalytics(key)}
                      className="on_active_bounce flex items-center justify-between rounded-md border border-[#cacaca] bg-white p-4 capitalize"
                    >
                      <h3 className="font-medium text-[#000000]">{key}</h3>
                      <p className="text-sm text-[#2F80ED]">View</p>
                    </div>
                  ))}
              </div>
            )}
          </>
        );
    }
  };
  return <>{analyticsRender()}</>;
}

export default memo(Analytics);
