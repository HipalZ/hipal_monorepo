import { useWhatsappTempStore } from '@/components/store/useWhatsappTempStore';
import { FILTER_OPTIONS, getStatusStyle } from '@/components/utils/helper';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { CloudDownload, Filter } from 'lucide-react';
import { lazy, memo, useCallback, useMemo, useState } from 'react';
import { BiHide, BiShow } from 'react-icons/bi';
import { CgClose } from 'react-icons/cg';

const PhoneBottomButtons = lazy(() => import('./phoneBottomButtons'));
const ExportOptions = lazy(() => import('./exportOptions'));
const ITEMS_PER_PAGE = 40;

const maskPhoneNumber = (phone: string) => {
  if (!phone) return '';
  const visibleDigits = 4;
  if (phone.length <= visibleDigits) return phone;
  return '*'.repeat(phone.length - visibleDigits) + phone.slice(-visibleDigits);
};

const MemoPhoneNumbersTable = () => {
  const {
    setStatus,
    status,
    openExport,
    setOpenExport,
    pageNumber,
    setPageNumber,
    campaignsData,
    selectedPhones,
    addPhone,
    removePhone,
    clearSelectedPhones,
    addMultiplePhones,
  } = useWhatsappTempStore((s) => ({
    status: s.status,
    setStatus: s.setStatus,
    openExport: s.openExport,
    setOpenExport: s.setOpenExport,
    pageNumber: s.pageNumber,
    setPageNumber: s.setPageNumber,
    campaignsData: s.campaignsData,
    selectedPhones: s.selectedPhones,
    addPhone: s.addPhone,
    removePhone: s.removePhone,
    clearSelectedPhones: s.clearSelectedPhones,
    addMultiplePhones: s.addMultiplePhones,
  }));
  const [isMasked, setIsMasked] = useState(true);
  const isAllSelected = useMemo(
    () => campaignsData?.campaignAnalytics?.length > 0 && campaignsData.campaignAnalytics.every((item) => selectedPhones.includes(item.phone)),
    [campaignsData.campaignAnalytics, selectedPhones],
  );
  const currentData = useMemo(() => {
    const startIndex = (pageNumber - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const filteredData = campaignsData.campaignAnalytics.filter((item) => !status || item.status === status);
    return filteredData.slice(startIndex, endIndex);
  }, [pageNumber, status, campaignsData.campaignAnalytics]);

  const clearFilter = useCallback(async () => {
    setStatus('');
    setPageNumber(1);
  }, [setStatus, setPageNumber]);

  const handleFilterClick = useCallback(
    async (filterStatus: string) => {
      setStatus(filterStatus);
      setPageNumber(1);
    },
    [setStatus, setPageNumber],
  );

  const handleCheckboxChange = useCallback(
    (phone: string) => {
      if (selectedPhones.includes(phone)) {
        removePhone(phone);
      } else {
        addPhone(phone);
      }
    },
    [selectedPhones, removePhone, addPhone],
  );

  const handleSelectAll = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
        // Select all phone numbers across all filters
        const allPhones = campaignsData.campaignAnalytics.map((item) => item.phone);
        addMultiplePhones(allPhones);
      } else {
        // Deselect all
        clearSelectedPhones();
      }
    },
    [campaignsData.campaignAnalytics, addMultiplePhones, clearSelectedPhones],
  );

  return (
    <section className="rounded-lg bg-white shadow-sm" aria-label="Phone Numbers">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h2 className="text-xl font-semibold text-gray-900">Total {campaignsData?.campaignAnalytics?.length} contacts</h2>
        <div className="flex items-center gap-4">
          {status && (
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${getStatusStyle(status)}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <button type="button" onClick={clearFilter} className="hover:opacity-75">
                <CgClose className="h-4 w-4" />
              </button>
            </span>
          )}
          <Menu as="div" className="relative inline-block text-left">
            <MenuButton className="rounded-md border bg-[#25D369] px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <Filter className="mr-2 inline-block h-4 w-4" />
              Filter
            </MenuButton>
            <MenuItems className="absolute right-0 z-10 mt-2 rounded border bg-white shadow-md">
              <div className="min-w-28 py-1">
                {FILTER_OPTIONS.map((filterOption) => (
                  <MenuItem key={filterOption?.id}>
                    {({ active }) => (
                      <button
                        type="button"
                        className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block w-full px-4 py-2 text-left text-sm`}
                        onClick={() => handleFilterClick(filterOption?.status)}
                      >
                        {filterOption?.label.charAt(0).toUpperCase() + filterOption?.label.slice(1)}
                      </button>
                    )}
                  </MenuItem>
                ))}
                <MenuItem>
                  {({ active }) => (
                    <button
                      type="button"
                      className={`${active ? 'bg-gray-100 text-red-700' : 'text-red-700'} block w-full px-4 py-2 text-left text-sm`}
                      onClick={() => handleFilterClick('')}
                    >
                      Clear
                    </button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
          <button
            type="button"
            onClick={() => setOpenExport(true)}
            disabled={currentData.length === 0}
            className="rounded-md bg-purple-500 px-4 py-2 text-sm text-white disabled:cursor-not-allowed"
          >
            <CloudDownload className="mr-2 inline-block h-4 w-4" />
            Export
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full overflow-hidden border-b border-gray-200 align-middle shadow sm:rounded-lg">
          {currentData.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="flex items-center px-6 py-3 text-left text-base font-medium tracking-wider text-black">
                    Phone Number
                    <button
                      type="button"
                      onClick={() => setIsMasked(!isMasked)}
                      className="pl-2 focus:outline-none"
                      title={isMasked ? 'Show numbers' : 'Hide numbers'}
                    >
                      {isMasked ? <BiShow size={20} className="text-blue-700" /> : <BiHide size={20} className="text-red-700" />}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-base font-medium tracking-wider text-black">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-base font-medium tracking-wider text-black">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-base font-medium tracking-wider text-black">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="form-checkbox mr-1 inline-block h-4 w-4 rounded-sm text-blue-600"
                    />{' '}
                    Select (All)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {currentData.map((item) => (
                  <tr key={item._id} className="transition-colors hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-base font-medium text-gray-900">
                        {isMasked ? maskPhoneNumber(item?.userId?.phone || item?.phone) : item?.userId?.phone || item?.phone}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-base text-gray-900">{item?.userId?.name || item?.name}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-base font-medium capitalize ${getStatusStyle(
                          item.status,
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedPhones.includes(item.phone)}
                        onChange={() => handleCheckboxChange(item.phone)}
                        className="form-checkbox h-4 w-4 rounded-sm text-blue-600"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-4 text-center text-gray-500">No data available for this campaign.</div>
          )}
        </div>
      </div>
      <PhoneBottomButtons currentData={currentData} />
      {openExport && <ExportOptions />}
    </section>
  );
};

const PhoneNumbersTable = memo(MemoPhoneNumbersTable);
export default PhoneNumbersTable;
