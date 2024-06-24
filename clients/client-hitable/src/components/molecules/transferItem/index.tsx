import axios from '@/axios';
import { TransferData } from '@/components/atoms/transferMultipleDishes';
import { useBusinessStore } from '@/components/store/useBusinessData';
import { useTable } from '@/components/store/useTable';
import type { ITable } from '@/components/types/hiTableData';
import { Disclosure } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { toast } from 'react-toastify';

interface TransferItemProps {
  handleNextStep: () => void;
  handleUpdateTransferData: (newValues: Partial<TransferData>) => void;
}

const TransferItem: FC<TransferItemProps> = ({ handleNextStep, handleUpdateTransferData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const businessId = useBusinessStore((s) => s.businessData?._id);
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };
  const tableData = useTable((s) => s.tableData);

  const fetchZones = async () => {
    try {
      const res = await axios.get(`/v1/zones/WithTables/Zones?businessId=${businessId}`);
      return res.data;
    } catch (error) {
      toast.error('Failed to fetch zones');
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['zones', businessId],
    queryFn: fetchZones,
    enabled: !!businessId,
  });

  let allTables: ITable[] = [];
  if (data) {
    allTables = data?.flatMap((zone) =>
      zone?.tables?.filter(
        (table: ITable) => table?.hierarchy !== 'CHILD' && !tableData.mergeTables?.some((mergeTable) => mergeTable._id === table._id),
      ),
    );
  }

  const filteredTables = allTables.filter((table) => table?.name.toLowerCase().includes(searchTerm) && table?._id !== tableData?._id);

  const handleSelectTable = (table: ITable) => {
    handleUpdateTransferData({
      toTableId: table._id,
      toZoneId: table.zoneId,
      name: table.name,
    });
    handleNextStep();
  };

  return (
    <div className="max-h-[80vh] min-h-[25vh] overflow-auto p-4 pb-16">
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
            <div key={table?._id} className="bg-base-100 mx-auto mt-6 w-full max-w-md rounded-2xl border p-4">
              <div className="flex justify-between">
                <div>{table?.name}</div>
                <button onClick={() => handleSelectTable(table)} className="text-primary border-primary rounded-2xl border px-4 py-1 font-medium">
                  Transfer
                </button>
              </div>
            </div>
          ))}
        </>
      ) : (
        <>
          {data
            ?.filter((zone) => zone?.tables?.length > 0)
            ?.map((zone) => (
              <div
                id={zone?.zoneName}
                key={zone?.zoneName}
                className="bg-base-100 mx-auto mt-6 w-full max-w-md scroll-mt-[13.2rem] rounded-2xl border p-4"
              >
                <Disclosure>
                  {({ open }) => (
                    <>
                      <div>
                        <Disclosure.Button className="flex w-full justify-between rounded-2xl px-4 text-left text-lg font-medium">
                          <div className="-ml-4 mt-[0.125rem] w-[80%]">{zone?.zoneName}</div>
                          <span className="-mr-4 mt-1">{zone?.tables?.length}</span>
                          <FiChevronDown className={`${open ? 'rotate-180 transform' : ''} -mr-2 mt-2 h-5 w-5`} />
                        </Disclosure.Button>
                        <div>
                          {open && (
                            <Disclosure.Panel className="pb-2 pt-4 text-sm text-gray-500 transition-all duration-300">
                              <div className="bg-primary h-[0.125rem]"></div>
                              <div className="mt-2 ">
                                {zone?.tables
                                  .filter((table) => !table.isMerge || (table.isMerge && table.hierarchy === 'PARENT'))
                                  .map((table) => (
                                    <div key={table._id} className="mb-2 flex items-center justify-between border-b border-dashed py-4">
                                      <div>{table?.name}</div>
                                      {table._id !== tableData._id && (
                                        <div className="on_active_bounce">
                                          <button
                                            onClick={() => handleSelectTable(table)}
                                            className="text-primary border-primary rounded-2xl border px-4 py-1 font-medium"
                                          >
                                            Transfer
                                          </button>
                                        </div>
                                      )}
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
    </div>
  );
};

export default TransferItem;
