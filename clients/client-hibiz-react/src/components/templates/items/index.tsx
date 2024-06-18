import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import SearchPanel from '@/components/atom/searchPanel';
import SubheaderButtonList from '@/components/atom/subHeaderBtn';
import ErrorComponent from '@/components/errorComponent';
import Header from '@/components/molecules/header';
import QuickMenuContent from '@/components/molecules/quickMenu';
import AddOns from '@/components/organisms/items/addons';
import CategoriesContent from '@/components/organisms/items/categories';
import DashboardContent from '@/components/organisms/items/dashboard';
import DishContent from '@/components/organisms/items/dish';
import useItemStore from '@/components/store/useItemStore';
import { useSearch } from '@/components/store/useSearch';
import { useSelectedButtonStore } from '@/components/store/useSelectBtn';
import type { Dish, IAddOn, ICategory } from '@/components/types/businessData';
import { routeToDashboard } from '@/components/utils/routes';
import { useQuery } from '@tanstack/react-query';
import { memo, startTransition, useEffect, useState } from 'react';
import { BiDish } from 'react-icons/bi';
import { FaArrowLeft } from 'react-icons/fa';
import { HiSearch } from 'react-icons/hi';
import { IoFastFoodOutline } from 'react-icons/io5';
import { MdOutlineCategory, MdOutlineQuickreply, MdSpaceDashboard } from 'react-icons/md';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const buttons = [
  {
    text: 'Dashboard',
    Icon: MdSpaceDashboard,
  },
  {
    text: 'Dish',
    Icon: BiDish,
  },
  {
    text: 'Categories',
    Icon: MdOutlineCategory,
  },
  {
    text: 'Add Ons',
    Icon: IoFastFoodOutline,
  },
  {
    text: 'Quick Menu',
    Icon: MdOutlineQuickreply,
  },
];

export interface IItems {
  categories: ICategory[];
  addOns: IAddOn[];
  dishes: Dish[];
}

const Items = memo(() => {
  const navigate = useNavigate();
  const { businessId } = useParams<{ businessId: string }>();
  const selectedButton = useSelectedButtonStore((s) => s.selectedButton);
  const setSelectedButton = useSelectedButtonStore((s) => s.setSelectedButton);
  const searchText = useSearch((s) => s.searchText);
  const setSearchText = useSearch((s) => s.setSearchText);
  const { data, setData } = useItemStore();
  const [state, setState] = useState({
    showSearchBox: false,
  });
  useEffect(() => {
    setSearchText('');
  }, []);
  const closeSearchBox = () => {
    setState({ ...state, showSearchBox: false });
  };

  const openSearchBox = () => {
    setState({ ...state, showSearchBox: !state.showSearchBox });
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`/v1/categories?businessId=${businessId}&queryCategories=true`);
      setData((prevData) => ({ ...prevData, categories: response.data }));
      return response.data;
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchAddOns = async () => {
    try {
      const response = await axios.get(`/v1/dishes/:id/getExtra?businessId=${businessId}&queryExtra=true`);
      setData((prevData) => ({ ...prevData, addOns: response.data }));
      return response.data;
    } catch (err) {
      console.error('Error fetching add-ons:', err);
    }
  };

  const fetchAllDishes = async () => {
    try {
      const response = await axios.get(`/v1/dishes?businessId=${businessId}&queryDish=true`);
      setData((prevData) => ({ ...prevData, dishes: response.data }));
      return response.data;
    } catch (err) {
      console.error('Error fetching dishes:', err);
    }
  };

  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tab = query.get('tab');

    if (tab === 'home') {
      setSelectedButton('Dashboard');
    } else {
      const key = tab || 'Dashboard';
      setSelectedButton(key);
    }
  }, [location.search]);

  const {
    isLoading: isCatLoading,
    error: categoryError,
    data: catData,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ['category', businessId],
    queryFn: fetchCategories,
    enabled: !!businessId && (selectedButton === 'Dashboard' || selectedButton === 'Categories'),
  });

  const {
    isLoading: isDishPending,
    error: dishError,
    data: dishData,
    refetch: refetchDishes,
  } = useQuery({
    queryKey: ['dishes', businessId],
    queryFn: fetchAllDishes,
    enabled: !!businessId && (selectedButton === 'Dashboard' || selectedButton === 'Dish'),
  });

  const {
    isLoading: isAddOnPending,
    error: addOnError,
    data: addOnData,
    refetch: refetchAddons,
  } = useQuery({
    queryKey: ['addOns', businessId],
    queryFn: fetchAddOns,
    enabled: !!businessId && (selectedButton === 'Dashboard' || selectedButton === 'Add Ons'),
  });

  const handleBack = () => {
    startTransition(() => {
      navigate(routeToDashboard(businessId as string));
    });
  };

  const isLoading = isCatLoading || isDishPending || isAddOnPending;

  if (dishError) return <ErrorComponent refetch={refetchDishes} />;
  if (categoryError) return <ErrorComponent refetch={refetchCategories} />;
  if (addOnError) return <ErrorComponent refetch={refetchAddons} />;

  return (
    <div>
      <div className="sticky top-0 z-20 linear_gradient_background">
        <Header title="Items" onBack={handleBack} leftIcon={<FaArrowLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={false} />
        <SubheaderButtonList buttons={buttons} />
        <div className="mt-2 flex items-center justify-between  pb-2 pl-6">
          <div className="text-xl"> {selectedButton}</div>
          {selectedButton !== 'Dashboard' && (
            <div className="mr-4" onClick={openSearchBox}>
              {!state.showSearchBox ? <HiSearch className="mx-2 my-auto h-4 w-4 text-sm" /> : <SearchPanel closeSearchBox={closeSearchBox} />}
            </div>
          )}
        </div>
      </div>
      {selectedButton === 'Dashboard' && <DashboardContent data={data} />}
      {selectedButton === 'Dish' && <DishContent dishes={data?.dishes || []} searchText={searchText} />}
      {selectedButton === 'Categories' && <CategoriesContent hide={false} categories={data?.categories || []} searchText={searchText} />}
      {selectedButton === 'Add Ons' && <AddOns addOns={data?.addOns || []} searchText={searchText || ''} />}
      {selectedButton === 'Quick Menu' && <QuickMenuContent searchText={searchText} />}
      {isLoading && <LoadingSpinner />}
    </div>
  );
});

export default Items;
