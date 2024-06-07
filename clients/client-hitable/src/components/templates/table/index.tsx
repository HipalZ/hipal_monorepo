import axios from '@/axios';
import HeaderButton from '@/components/atoms/buttons/headerButton';
import Loader from '@/components/atoms/loader';
import { useLogin } from '@/components/store/useLogin';
import { useTable } from '@/components/store/useTable';
import type { ITable } from '@/components/types/hiTableData';
import { PAGE_TYPES, newRoutes } from '@/components/utils/routes';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { memo, useCallback, useState } from 'react';
import { MdAlarm, MdOutlineDinnerDining, MdOutlinePeopleOutline } from 'react-icons/md';
import { SiGoogleassistant } from 'react-icons/si';
import { TbToolsKitchen2 } from 'react-icons/tb';
import { toast } from 'react-toastify';

const filterButtons = [
  {
    name: 'Active',
    Icon: MdAlarm,
    text: 'Active',
  },
  {
    name: 'Empty',
    Icon: TbToolsKitchen2,
    text: 'Empty',
  },
  {
    name: 'Need Assistance',
    Icon: SiGoogleassistant,
    text: 'Assistant',
  },
];

const classByStatus: { [key: string]: any } = {
  occupied: {
    classNames: 'relative h-[5.75rem] mx-6 mb-4 border border-[#e1e1e1]/50 rounded-xl bg-[#E3EFFF]',
    businessNameClasses: 'absolute font-[500] capitalize truncate left-6 top-9 w-[50%]',
    tableClasses: 'right-8 top-6 absolute text-[1rem] opacity-50',
    numberClasses: 'absolute right-6 bottom-6 text-sm font-[500] text-primary',
  },
  reserved: {
    classNames: 'relative h-[3.75rem]  mx-6 mb-4 border border-[#e1e1e1]/50 rounded-xl bg-gray-200',
    businessNameClasses: 'absolute font-[500] capitalize truncate left-6 top-2 w-[50%]',
    tableClasses: 'right-8 top-2 absolute text-[1rem] opacity-50',
    numberClasses: 'absolute right-6 bottom-2 text-sm font-[500] text-primary',
  },
  empty: {
    classNames: 'relative h-[3.75rem]  mx-6 mb-4 border border-[#e1e1e1]/50 rounded-xl bg-base-100',
    businessNameClasses: 'absolute font-[500] capitalize truncate left-6 top-2 w-[50%]',
    tableClasses: 'right-8 top-2 absolute text-[1rem] opacity-50',
    numberClasses: 'absolute right-6 bottom-2 text-sm font-[500] text-primary',
  },
  active: {
    classNames: 'relative h-[5.75rem] mx-6 mb-4 border border-[#e1e1e1]/50 rounded-xl bg-[#DBFFE2]',
    businessNameClasses: 'absolute font-[500] capitalize truncate left-6 top-9 w-[50%]',
    tableClasses: 'right-8 top-6 absolute text-[1rem] opacity-50',
    numberClasses: 'absolute right-6 bottom-6 text-sm font-[500] text-primary',
  },
  settled: {
    classNames: 'relative h-[5.75rem] mx-6 mb-4 border border-[#e1e1e1]/50 rounded-xl bg-[#FFF3D3]',
    businessNameClasses: 'absolute font-[500] capitalize truncate left-6 top-9 w-[50%]',
    tableClasses: 'right-8 top-6 absolute text-[1rem] opacity-50',
    numberClasses: 'absolute right-6 bottom-6 text-sm font-[500] text-primary',
  },
  'need assistance': {
    classNames: 'relative h-[5.75rem]  mx-6 mb-4 border border-[#e1e1e1]/50 rounded-xl bg-[#FFE5E5]',
    businessNameClasses: 'absolute font-[500] capitalize truncate left-6 top-9 w-[50%]',
    tableClasses: 'right-8 top-6 absolute text-[1rem] opacity-50',
    numberClasses: 'absolute right-6 bottom-6 text-sm font-[500] text-primary',
  },
  kitchen: {
    classNames: 'relative h-[5.75rem]  mx-6 mb-4 border border-[#e1e1e1]/50 rounded-xl bg-[#FFE5E5]',
    businessNameClasses: 'absolute font-[500] capitalize truncate left-6 top-9 w-[50%]',
    tableClasses: 'right-8 top-6 absolute text-[1rem] opacity-50',
    numberClasses: 'absolute right-6 bottom-6 text-sm font-[500] text-primary',
  },
  settle: {
    classNames: 'relative h-[5.75rem]  mx-6 mb-4 border border-[#e1e1e1]/50 rounded-xl bg-[#FFE5E5]',
    businessNameClasses: 'absolute font-[500] capitalize truncate left-6 top-9 w-[50%]',
    tableClasses: 'right-8 top-6 absolute text-[1rem] opacity-50',
    numberClasses: 'absolute right-6 bottom-6 text-sm font-[500] text-primary',
  },
};

const Table = () => {
  const [tableData, setTableData] = useState<ITable[]>([]);
  const [originalZoneData, setOriginalZoneData] = useState<ITable[]>([]);
  const [search, setSearch] = useState('');
  const [activeButton, setActiveButton] = useState('');
  const { phoneNumber, password, setIsLogin, userDetails, zoneName, setUserDetails } = useLogin();
  const setTableLocal = useTable((s) => s.setTableData);
  const router = useRouter();
  const { businessId, zoneId } = router.query as {
    businessId: string;
    zoneId: string;
  };

  const handleOnclick = (filterName: string) => {
    if (filterName === activeButton) {
      setTableData(originalZoneData);
      setActiveButton('');
    } else {
      const filteredData = originalZoneData.filter((ele) => ele?.status?.toLowerCase() === filterName.toLowerCase());
      setTableData(filteredData);
      setActiveButton(filterName);
    }
  };

  const waiterLogin = useCallback(async () => {
    try {
      const config = {
        method: 'POST',
        url: '/v1/users/waiterLogin',
        data: { phone: phoneNumber, password: password },
      };

      const response = await axios(config);
      if (response.status === 201) {
        const { _id, ...otherData } = response.data;
        setUserDetails({ id: _id, ...otherData });
        setIsLogin(true);
        result();
      } else {
        toast.error('Phone or Password invalid...!');
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response && err.response.status === 400) {
          toast.error('Phone or Password invalid...!');
        } else {
          console.log(err);
        }
      }
    }
  }, [phoneNumber, password, setUserDetails, setIsLogin]);

  const result = useCallback(async () => {
    try {
      const response = await axios.get(`/v1/zones/${zoneId}/tables/ByWaiter?businessId=${businessId}&staffId=${userDetails?.id}`);
      const res = response.data;
      const capacityMap = res.reduce((map, table) => {
        map[table._id] = table.capacity;
        return map;
      }, {});

      const processedData = res
        .map((table) => {
          if (table.isMerge && table.hierarchy === 'PARENT') {
            const totalCapacity = table.mergeTables.reduce((total, mergedTable) => {
              return total + capacityMap[mergedTable.id];
            }, 0);
            console.log('totalCapacity', totalCapacity);
            return { ...table, capacity: totalCapacity };
          }
          return table;
        })
        .filter((table) => !table.isMerge || (table.isMerge && table.hierarchy === 'PARENT'));

      setOriginalZoneData(processedData);
      setTableData(processedData);
      const preprocessedData = processedData.map((item) => ({
        ...item,
        status: item.status.toLowerCase(),
      }));

      const statusOrder = {
        'need assistance': 1,
        active: 2,
        occupied: 3,
        empty: 4,
        default: 5,
      };

      preprocessedData.sort((a, b) => {
        const aStatusOrder = statusOrder[a.status] || statusOrder.default;
        const bStatusOrder = statusOrder[b.status] || statusOrder.default;

        return aStatusOrder - bStatusOrder;
      });

      return preprocessedData;
    } catch (e) {
      if ((e as AxiosError).response?.status === 401) {
        waiterLogin();
      }
    }
  }, [businessId, userDetails?.id, zoneId, waiterLogin]);

  const { isLoading, error, data } = useQuery({
    queryKey: ['zones', businessId],
    queryFn: result,
    enabled: !!businessId && !!userDetails?.id && !!zoneId,
  });

  const handleTableClick = useCallback(
    (tableData: ITable) => {
      setTableLocal(tableData);
    },
    [setTableLocal],
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }
  const goToHome = () => {
    toast.error('Session has ended Please login again');
    router.push(`/r/${businessId}/login`);
  };

  const searchTables = () => {
    return tableData.filter((tables: ITable) => tables.name.toLowerCase().includes(search.toLowerCase()));
  };
  const searchResults = searchTables();

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <button onClick={goToHome} className="btn" type="button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <div className="bg-secondary sticky top-0 z-50">
        <section className="mx-4 mt-4 flex items-center justify-between">
          <div className="text-base-content font-bold capitalize">{zoneName}</div>

          <div className="relative">
            <input
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              value={search}
              type="search"
              id="simple-search"
              className="focus:border-primary block rounded-xl border border-gray-300 p-1.5 pl-4 text-sm text-gray-900 focus:outline-none"
              placeholder="Search"
              required
            />
          </div>
        </section>
        <div className="sticky mx-6 mt-6 flex justify-between pb-6 ">
          {filterButtons.map(({ name, Icon, text }, index) => (
            <HeaderButton
              onClick={() => handleOnclick(name)}
              key={`${index}${name}`}
              className={activeButton === name ? 'focus:text-primary focus:bg-primary/10 bg-blue-500 focus:rounded-full focus:font-[500] ' : ''}
            >
              <Icon className="text-primary -ml-1 mr-1 mt-1" />
              {text}
            </HeaderButton>
          ))}
        </div>
      </div>
      <div className="mb-[4rem]">
        <div className="grid-col-1 grid items-center gap-0 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {search.length === 0 ? (
            <>
              {data?.map((ele: ITable, index: number) => (
                <Link key={`${ele.id + zoneId}search${index}`} href={`${newRoutes[PAGE_TYPES.SINGLE_TABLE](businessId, zoneId, ele?._id)}`} passHref>
                  <div
                    onClick={() => handleTableClick(ele)}
                    className={`${classByStatus[ele?.status?.toLowerCase() || 'empty']?.classNames} ${ele.isMerge ? 'bg-[#d6ebda]' : ''}`}
                  >
                    <div className={`${classByStatus[ele?.status?.toLowerCase() || 'empty']?.businessNameClasses} text-black`}>
                      {ele.isMerge
                        ? ele.mergeTables.map((table) => (table.name.length > 4 ? `${table.name.slice(0, 4)}...` : table.name)).join(' + ')
                        : ele.name}
                    </div>
                    <MdOutlinePeopleOutline className={`${classByStatus[ele?.status?.toLowerCase() || 'empty']?.tableClasses}`} />
                    <div className={`${classByStatus[ele?.status?.toLowerCase() || 'empty']?.numberClasses}`}>
                      {ele?.activeUser < 10 ? `0${ele?.activeUser}` : ele?.activeUser == null ? '00' : ele?.activeUser}/
                      {ele?.capacity < 10 ? `0${ele?.capacity}` : ele?.capacity}
                    </div>
                    {ele?.status?.toLowerCase() !== 'empty' && ele?.status?.toLowerCase() !== 'reserved' && (
                      <div>
                        <div className="text-primary absolute left-6 top-3 text-sm font-[500]">{ele?.time}</div>
                      </div>
                    )}
                    <div className="text-base-content/40 absolute bottom-2 left-6 text-sm font-normal capitalize">
                      {ele.status}
                      {ele.isMerge ? ' (Merged) ' : ''}
                    </div>
                    {ele?.status?.toLowerCase() !== 'empty' && ele?.status?.toLowerCase() !== 'reserved' && (
                      <div>
                        <MdOutlineDinnerDining className="absolute right-[5.5rem] top-6 text-[1rem] opacity-50" />
                        <div className="text-primary absolute bottom-6 right-20 text-sm font-[500]">
                          {ele?.totalDishQuantity < 10 ? `0${ele?.deliverdDish}` : ele?.deliverdDish == null ? '00' : ele?.deliverdDish}/
                          {ele?.totalDishQuantity < 10 ? `0${ele?.totalDishQuantity}` : ele?.totalDishQuantity}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </>
          ) : (
            <>
              {searchResults?.map((ele: ITable, index: number) => (
                <Link key={`${ele.id + zoneId}search${index}`} href={`${newRoutes[PAGE_TYPES.SINGLE_TABLE](businessId, zoneId, ele?._id)}`} passHref>
                  <div
                    onClick={() => handleTableClick(ele)}
                    className={`${classByStatus[ele?.status?.toLowerCase() || 'empty']?.classNames} ${ele.isMerge ? 'bg-[#d6ebda]' : ''}`}
                  >
                    <div className={`${classByStatus[ele?.status?.toLowerCase() || 'empty']?.businessNameClasses} text-black`}>
                      {ele.isMerge
                        ? ele.mergeTables.map((table) => (table.name.length > 4 ? `${table.name.slice(0, 4)}...` : table.name)).join(' + ')
                        : ele.name}
                    </div>
                    <MdOutlinePeopleOutline className={`${classByStatus[ele?.status?.toLowerCase() || 'empty']?.tableClasses}`} />
                    <div className={`${classByStatus[ele?.status?.toLowerCase() || 'empty']?.numberClasses}`}>
                      {ele?.activeUser < 10 ? `0${ele?.activeUser}` : ele?.activeUser == null ? '00' : ele?.activeUser}/
                      {ele?.capacity < 10 ? `0${ele?.capacity}` : ele?.capacity}
                    </div>
                    {ele?.status?.toLowerCase() !== 'empty' && ele?.status?.toLowerCase() !== 'reserved' && (
                      <div>
                        <div className="text-primary absolute left-6 top-3 text-sm font-[500]">{ele?.time}</div>
                      </div>
                    )}
                    <div className="text-base-content/40 absolute bottom-2 left-6 text-sm font-normal capitalize">
                      {ele.status}
                      {ele.isMerge ? ' (Merged) ' : ''}
                    </div>
                    {ele?.status?.toLowerCase() !== 'empty' && ele?.status?.toLowerCase() !== 'reserved' && (
                      <div>
                        <MdOutlineDinnerDining className="absolute right-[5.5rem] top-6 text-[1rem] opacity-50" />
                        <div className="text-primary absolute bottom-6 right-20 text-sm font-[500]">
                          {ele?.totalDishQuantity < 10 ? `0${ele?.deliverdDish}` : ele?.deliverdDish == null ? '00' : ele?.deliverdDish}/
                          {ele?.totalDishQuantity < 10 ? `0${ele?.totalDishQuantity}` : ele?.totalDishQuantity}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(Table);
