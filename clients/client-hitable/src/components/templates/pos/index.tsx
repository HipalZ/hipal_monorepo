import axios from '@/axios';
import Loader from '@/components/atoms/loader';
import SearchComponent from '@/components/molecules/searchPanel';
import { useCategoryStore } from '@/components/store/useCategoryData';
import { useSearch } from '@/components/store/useSearch';
import { useTable } from '@/components/store/useTable';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

const TableHeader = dynamic(() => import('@/components/molecules/tableHeader'), {
  ssr: false,
  loading: () => <Loader />,
});
const HeaderButtonGroup = dynamic(() => import('@/components/molecules/headerButtonGroup'), { ssr: false, loading: () => <Loader /> });
const DishStatusComponent = dynamic(() => import('@/components/organisms/dishStatus'), { ssr: false, loading: () => <Loader /> });
const POSComponent = dynamic(() => import('@/components/organisms/pos'), {
  ssr: false,
  loading: () => <Loader />,
});
const Settle = dynamic(() => import('@/components/organisms/settle'), {
  ssr: false,
  loading: () => <Loader />,
});

function TablePos({ setCurrentView }) {
  /********************* Using in settle pos and settle *************************/
  const [activeButton, setActiveButton] = useState('');
  const { data, saveCategories } = useCategoryStore();
  const retryCount = useRef(0);
  const search = useSearch((s) => s.searchText);
  const setSearch = useSearch((s) => s.setSearchText);
  const [searchOpen, setSearchOpen] = useState(false);
  const tableData = useTable((s) => s.tableData);
  const router = useRouter();
  const { businessId, zoneId, tableId } = router.query as {
    businessId: string;
    zoneId: string;
    tableId: string;
  };
  const tableStatus = useTable((s) => s.tableData.status);

  const popOver = (search = '') => {
    if (search.length > 0) {
      if (!searchOpen) {
        setSearchOpen(true);
      }
    } else {
      setSearchOpen(false);
    }
  };

  const handleInputChange = (value) => {
    setSearch(value);
    popOver(value);
  };

  const handleOnClick = (str: string) => {
    setActiveButton(str);
  };
  const category = async () => {
    try {
      const response = await axios(`/v1/categories/All/Categories?businessId=${businessId}`);
      const { allCategoriesTypes, categories } = response.data.data;
      const data = {
        allCategoriesTypes,
        categories,
      };
      saveCategories(data);
      return data;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isEdit = urlParams.has('edit');

    if (isEdit) {
      setActiveButton('pos');
    } else if (tableStatus?.toLowerCase() !== 'active') {
      setActiveButton('pos');
    } else {
      setActiveButton('status');
    }
  }, []);

  const {
    isLoading,
    error,
    data: categoryData,
  } = useQuery({
    queryKey: ['category', businessId],
    queryFn: category,
    enabled: !!businessId,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }
  const handleRetryClick = () => {
    retryCount.current += 1;
    if (retryCount.current >= 5) {
      router.push(`/r/${businessId}/login`);
    } else {
      category();
    }
  };
  if (error) {
    <div className="flex h-screen items-center justify-center">
      <Link href={`/r/${businessId}/login`}>
        <button className="btn" type="button">
          Home
        </button>
      </Link>
      <button onClick={handleRetryClick} className="btn" type="button">
        Retry
      </button>
    </div>;
  }

  return (
    <div className="bg-secondary sticky-header relative min-h-screen">
      <div className={`${activeButton.toLowerCase() === '' ? '' : 'bg-secondary sticky top-0 z-40 w-full space-y-4 px-6'} `}>
        <TableHeader setCurrentView={setCurrentView} businessId={businessId} zoneId={zoneId} tableId={tableId}>
          <div className="text-base-content text-xl font-bold capitalize">{tableData.name}</div>
        </TableHeader>

        <HeaderButtonGroup activeButton={activeButton} onButtonClick={handleOnClick} showPos={true} />

        <SearchComponent activeButton={activeButton} onSearch={(value) => handleInputChange(value)} />
      </div>
      {activeButton.toLowerCase() === 'status' && <DishStatusComponent activeButton={activeButton} />}
      {activeButton.toLowerCase() === 'pos' && <POSComponent data={categoryData} activeButton={activeButton} search={search} />}
      {activeButton.toLowerCase() === 'settle' && <Settle activeButton={activeButton} />}
    </div>
  );
}

export default TablePos;
