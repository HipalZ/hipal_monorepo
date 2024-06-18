import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import ErrorComponent from '@/components/errorComponent';
import Header from '@/components/molecules/header';
import { useSelectedIcon } from '@/components/store/useSelectedIcon';
import { PAGE_TYPES, routePathsWithIds, routeToDashboard } from '@/components/utils/routes';
import { useQuery } from '@tanstack/react-query';
import { memo, startTransition, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import AddKitchen from './addKitchen';

interface IKitchen {
  businessId: string;
  kitchenName: string;
  description: string;
  staff: string[];
  id: string;
}

const Kitchen = memo(() => {
  const navigate = useNavigate();
  const { businessId } = useParams<{ businessId: string }>();
  const setSelectedSubIcon = useSelectedIcon((s) => s.setSelectedSubIcon);
  const selectedSubIcon = useSelectedIcon((s) => s.selectedSubIcon);
  const addKitchen = () => {
    setSelectedSubIcon('addKitchen');
  };

  const getData = async () => {
    try {
      const response = await axios(`/v1/kitchens/?businessId=${businessId}`);
      return response?.data;
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (selectedSubIcon !== 'addKitchen') {
      setSelectedSubIcon('kitchen');
    }
    const params = new URLSearchParams(location.search);
    if (params.get('tab') !== 'Kitchen') {
      params.set('tab', 'Kitchen');
      startTransition(() => {
        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
      });
    }
  }, [location, navigate, selectedSubIcon]);

  const {
    isLoading,
    error,
    data: kitchens,
    refetch,
  } = useQuery<IKitchen[]>({
    queryKey: ['kitchens', businessId],
    queryFn: getData,
    enabled: !!businessId && selectedSubIcon === 'kitchen',
  });

  if (error) {
    return <ErrorComponent refetch={refetch} />;
  }

  const toggleKitchen = () => {
    switch (selectedSubIcon) {
      case 'kitchen':
        return <KitchenDashboard loading={isLoading} kitchens={kitchens || []} addKitchen={addKitchen} businessId={businessId || ''} />;
      case 'addKitchen':
        return <AddKitchen setSelectedButton={setSelectedSubIcon} />;
      default:
        return <KitchenDashboard kitchens={kitchens || []} addKitchen={addKitchen} businessId={businessId || ''} />;
    }
  };
  return <>{toggleKitchen()}</>;
});

export default Kitchen;

type IProp = {
  kitchens: IKitchen[];
  addKitchen: () => void;
  businessId: string;
  loading?: boolean;
};
const KitchenDashboard = memo(({ kitchens, addKitchen, businessId, loading }: IProp) => {
  const { setSelectedIcon } = useSelectedIcon();
  const navigate = useNavigate();

  const handleBack = () => {
    startTransition(() => {
      navigate(routeToDashboard(businessId as string));
    });
    setSelectedIcon('');
  };

  const handleEdit = (id: string) => {
    startTransition(() => {
      navigate(routePathsWithIds[PAGE_TYPES.EDIT_KITCHEN](businessId, id));
    });
  };

  return (
    <div className="relative">
      <div className="sticky top-0 z-20 linear_gradient_background">
        <Header title="Kitchens" onBack={handleBack} leftIcon={<FaArrowLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={true} />
        <div className="mt-6 flex items-center justify-between  px-6 pb-4">
          <div className="flex text-2xl">
            <span className="ml-2">Kitchens</span>
          </div>
        </div>
      </div>
      <div className="masonry-layout mx-6 mt-6 space-y-4 overflow-auto pb-[5rem]">
        {loading ? (
          <LoadingSpinner />
        ) : (
          kitchens?.map((kitchen) => (
            <div
              key={kitchen._id}
              className="masonry-item relative flex items-center justify-between rounded-md border border-[#cacaca] px-4 pb-6 pt-2"
            >
              <div className="">
                <div className="ml-2 pb-4">{kitchen.kitchenName}</div>
                <div onClick={() => handleEdit(kitchen._id)} className="absolute bottom-2 right-4 text-[#2F80ED]">
                  Edit
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {kitchens.length === 0 && <div className="fixed left-1/2 top-1/2 flex -translate-x-1/2 transform flex-col text-center">No Kitchen Added</div>}
      <div onClick={addKitchen} className="fixed bottom-0 w-full cursor-pointer bg-white p-4 outline-none">
        <button
          type="button"
          className={`${loading ? 'pointer-events-none opacity-50' : ''} on_active_bounce w-full rounded-md bg-[#000000] py-2 text-white`}
        >
          Add
        </button>
      </div>
    </div>
  );
});
