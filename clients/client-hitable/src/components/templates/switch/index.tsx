import axios from '@/axios';
import DayOutPopup from '@/components/atoms/dayoutPopup';
import Loader from '@/components/atoms/loader';
import { useLogin } from '@/components/store/useLogin';
import { useTable } from '@/components/store/useTable';
import { PAGE_TYPES, routePaths } from '@/components/utils/routes';
import { Disclosure } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { HiX } from 'react-icons/hi';
import { toast } from 'react-toastify';

function Switch({ setCurrentView }) {
  const router = useRouter();
  const { businessId, zoneId } = router.query as {
    businessId: string;
    zoneId: string;
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetTable, setTargetTable] = useState<any>(null);
  const tableData = useTable((s) => s.tableData);
  const [businesses, setBusinesses] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const userDetails = useLogin((s) => s.userDetails);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const openModal = (table) => {
    setTargetTable(table);
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

  const handleTableTransfer = async (toTable) => {
    if (tableData._id === toTable._id) {
      toast.error('You cannot switch to the same table.');
      return;
    }
    console.log('tableData', tableData);
    const body = {
      businessId: businessId,
      fromZoneId: tableData.zoneId,
      fromTableId: tableData._id,
      fromTableName: tableData.name,
      toZoneId: toTable.zoneId,
      toTableId: toTable._id,
      toTableName: toTable.name,
      switchedBy: userDetails.name,
    };

    try {
      const res = await axios.put('/v1/kitchens/update/transferTable', body);
      if (res.status === 200) {
        closeModal();
        toast.success(`Table ${tableData.name} transferred to ${toTable.name} successfully`);
        router.push(routePaths[PAGE_TYPES.TABLES](businessId, zoneId));
      }
    } catch (error) {
      toast.error('Error transferring table');
      console.error('Error transferring table:', error);
    }
  };
  return (
    <div className="bg-secondary relative min-h-screen w-full overflow-auto scroll-smooth px-6 pb-[10rem] pt-6">
      <div className="flex items-center justify-between text-xl font-medium">
        <div>Switch Table</div>
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
          {filteredTables.map((table) => (
            <div key={table._id} className="bg-base-100 mx-auto mt-6 w-full max-w-md rounded-2xl border p-4">
              <div className="flex justify-between">
                <div>{table.name}</div>
                <button
                  type="button"
                  onClick={() => openModal(table)}
                  className="text-primary border-primary rounded-2xl border px-4 py-1 font-medium"
                >
                  Switch
                </button>
              </div>
            </div>
          ))}
        </>
      ) : (
        <>
          {businesses?.map((zone) => (
            <div id={zone.zoneId} key={zone.zoneId} className="bg-base-100 mx-auto mt-6 w-full max-w-md scroll-mt-[13.2rem] rounded-2xl border p-4">
              <Disclosure>
                {({ open }) => (
                  <>
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
                                .filter((table) => table.status.toLowerCase() === 'empty')
                                .map((table) => (
                                  <div
                                    onClick={() => openModal(table)}
                                    key={table._id}
                                    className="mb-2 flex items-center justify-between border-b border-dashed py-4"
                                  >
                                    <div>{table?.name}</div>
                                    <div className="on_active_bounce">
                                      <button type="button" className="text-primary border-primary rounded-2xl border px-4 py-1 font-medium">
                                        Switch
                                      </button>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </Disclosure.Panel>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </Disclosure>
            </div>
          ))}
        </>
      )}

      <DayOutPopup show={isModalOpen} onClose={closeModal}>
        <div className="text-base-content ml-4 mt-4 text-xl font-bold capitalize">{tableData?.name}</div>
        <div className="ml-4 mt-4 font-semibold">
          Do you want to switch {tableData?.name} to {targetTable?.name} in zone ?
        </div>
        <div className="mx-12 mt-6 flex justify-between pb-9">
          <span onClick={closeModal} className="text-sm">
            Cancel
          </span>
          <button
            type="button"
            onClick={() => handleTableTransfer(targetTable)}
            className="bg-primary text-base-100 -mr-6 rounded-3xl px-6 py-2 text-sm"
          >
            Switch
          </button>
        </div>
      </DayOutPopup>
    </div>
  );
}

export default Switch;
