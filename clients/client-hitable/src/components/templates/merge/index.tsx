import axios from '@/axios';
import DayOutPopup from '@/components/atoms/dayoutPopup';
import Loader from '@/components/atoms/loader';
import { useLogin } from '@/components/store/useLogin';
import { useTable } from '@/components/store/useTable';
import type { ITable, ITransformedTable } from '@/components/types/hiTableData';
import { Disclosure } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { HiX } from 'react-icons/hi';
import { toast } from 'react-toastify';

const MergeTables = ({ setCurrentView }) => {
  const router = useRouter();
  const { businessId, zoneId } = router.query as {
    businessId: string;
    zoneId: string;
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tableData = useTable((s) => s.tableData);
  const [businesses, setBusinesses] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tableDatas, setTableDatas] = useState<ITransformedTable[]>([]);
  const userDetails = useLogin((s) => s.userDetails);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const allTables = businesses.flatMap((zone) => zone.tables);
  const filteredTables = allTables.filter((table) => table.name.toLowerCase().includes(searchTerm) && table.status.toLowerCase() === 'empty');

  const fetchZones = async () => {
    try {
      const res = await axios.get(`/v1/zones/${zoneId}/tablesByZones?businessId=${businessId}`);
      setBusinesses([res?.data]);
      return res?.data;
    } catch (error) {
      toast.error('Error fetching tables');
    }
  };
  const { isLoading, error, data } = useQuery({
    queryKey: ['tables', businessId, zoneId],
    queryFn: fetchZones,
    enabled: !!zoneId && !!businessId,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  const mergeTable = async () => {
    const parentData = {
      tableId: tableData?._id,
      name: tableData.name,
      hierarchy: 'PARENT',
      parentTableId: '',
      parentZoneId: '',
    };
    try {
      const config = {
        method: 'PUT',
        url: `/v1/zones/:zoneId/mergeTables?businessId=${businessId}`,
        data: {
          businessId: businessId,
          tables: [parentData, ...tableDatas],
          mergedBy: userDetails.name,
        },
      };
      const response = await axios(config);
      if (response.status === 200 || response.status === 201) {
        toast.success('Table Merged Successfully');
        setCurrentView('pos');
      } else {
        toast.error('Table Already Merged');
        setCurrentView('kick');
      }
    } catch (err: any) {
      if (err?.response?.status === 400) {
        toast.error('Table Already Merged');
      }
    }
  };
  function transformData(data: ITable): ITransformedTable {
    return {
      tableId: data._id,
      name: data.name,
      hierarchy: 'CHILD',
      parentTableId: tableData?._id,
      parentZoneId: tableData?.zoneId,
    };
  }
  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>, data: any) {
    if (e.target.checked) {
      addTablesData(data);
    } else {
      removeTablesData(data);
    }
  }

  function addTablesData(data: ITable) {
    const transformedData = transformData(data);
    setTableDatas((prev) => [...prev, transformedData]);
  }
  function removeTablesData(data: ITable) {
    setTableDatas((prev) => prev.filter((item) => item?.tableId !== data._id));
  }
  return (
    <div className="bg-secondary relative min-h-screen w-full overflow-auto scroll-smooth px-6 pb-[10rem] pt-6">
      <div className="flex items-center justify-between text-xl font-medium">
        <div>Merge Table</div>
        <div>{tableData?.name}</div>
        <div onClick={() => setCurrentView('kick')}>
          <HiX />
        </div>
      </div>
      <div className="mt-4">
        <input
          type="text"
          placeholder="Search Table"
          value={searchTerm}
          onChange={handleSearchChange}
          className="bg-base-100 w-full rounded-md border border-[#cacaca] p-2"
        />
      </div>

      {searchTerm ? (
        <>
          {filteredTables.map((table) => {
            if (!table?.isMerge) {
              return null;
            }
            if (table.status.toLowerCase() === 'active') {
              return null;
            }
            return (
              <div key={table._id} className="bg-base-100 mx-auto mt-6 w-full max-w-md rounded-2xl border p-4">
                <div className="flex justify-between">
                  <input type="checkbox" />
                  <div>{table.name}</div>
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <>
          {businesses?.map((zone, index) => (
            <div id={zone.zoneId} key={zone.zoneId} className="bg-base-100 mx-auto mt-6 w-full max-w-md scroll-mt-[13.2rem] rounded-2xl border p-4">
              <Disclosure defaultOpen={index === 0}>
                {({ open }) => (
                  <Disclosure>
                    <div>
                      <Disclosure.Button className="flex w-full justify-between rounded-2xl px-4 text-left text-lg font-medium">
                        <div className="-ml-4 mt-[0.125rem] w-[80%]">{zone.zoneName}</div>
                        <span className="-mr-4 mt-1">{zone.tables.length}</span>
                        <FiChevronDown className={`${open ? 'rotate-180 transform' : ''} -mr-2 mt-2 h-5 w-5`} />
                      </Disclosure.Button>
                      <div>
                        {open && (
                          <Disclosure.Panel className="pb-2 pt-4 text-sm text-gray-500 transition-all duration-300">
                            <div className="bg-primary h-[0.125rem]" />
                            <div className="mt-2 ">
                              {zone.tables
                                .filter((table) => table._id !== tableData?._id)
                                .map((table) => {
                                  if (table?.isMerge) {
                                    return null;
                                  }
                                  if (table.status.toLowerCase() === 'active') {
                                    return null;
                                  }
                                  return (
                                    <div key={table._id} className="mb-2 flex items-center justify-start space-x-3 border-b border-dashed py-4">
                                      <label className="flex w-full cursor-pointer items-center justify-start space-x-3">
                                        <input type="checkbox" onChange={(e) => handleCheckboxChange(e, table)} />
                                        <div>{table?.name}</div>
                                      </label>
                                    </div>
                                  );
                                })}
                            </div>
                          </Disclosure.Panel>
                        )}
                      </div>
                    </div>
                  </Disclosure>
                )}
              </Disclosure>
            </div>
          ))}
        </>
      )}

      <DayOutPopup show={isModalOpen} onClose={closeModal}>
        <div className="text-base-content ml-4 mt-4 text-xl font-bold capitalize">{tableData?.name}</div>
        <div className="ml-4 mt-4 font-semibold">
          Do you want to Merge {tableDatas.map((table) => (table.name.length > 4 ? `${table.name.slice(0, 4)}..` : table.name)).join(' + ')} to{' '}
          {tableData?.name} in zone ?
        </div>
        <div className="mx-12 mt-6 flex justify-between pb-9">
          <button type="button" onClick={closeModal} className="text-base-100 -mr-6 rounded-3xl bg-red-500 px-6 py-2 text-sm">
            Cancel
          </button>
          <button type="button" onClick={() => mergeTable()} className="bg-primary text-base-100 -mr-6 rounded-3xl px-6 py-2 text-sm">
            Merge
          </button>
        </div>
      </DayOutPopup>
      <div onClick={() => openModal()} className="mb-5 flex justify-center">
        <button
          type="button"
          className="on_active_bounce bg-primary text-base-100 fixed bottom-6 z-50 w-[20.5rem] rounded-full py-[0.75rem] text-[18px] font-[600] leading-[1.15rem]"
        >
          Merge
        </button>
      </div>
    </div>
  );
};

export default MergeTables;
