import { memo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { useWhatsappTempStore } from "@/components/store/useWhatsappTempStore";
import { useAddGroup } from "@/hooks/useTemplates";
import { CgClose } from "react-icons/cg";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import ExportOptions from "./exportOptions";
import { FILTER_OPTIONS, getStatusStyle } from "@/components/utils/helper";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 40;

const MemoPhoneNumbersTable = () => {
  const {
    setStatus,
    status,
    openExport,
    selectedCampaign,
    pageNumber,
    setPageNumber,
    campaignsData,
    selectedPhones,
    addPhone,
    removePhone,
    clearSelectedPhones,
  } = useWhatsappTempStore((s) => ({
    status: s.status,
    setStatus: s.setStatus,
    openExport: s.openExport,
    selectedCampaign: s.selectedCampaign,
    pageNumber: s.pageNumber,
    setPageNumber: s.setPageNumber,
    campaignsData: s.campaignsData,
    selectedPhones: s.selectedPhones,
    addPhone: s.addPhone,
    removePhone: s.removePhone,
    clearSelectedPhones: s.clearSelectedPhones,
  }));

  const startIndex = (pageNumber - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const filteredData = campaignsData.campaignAnalytics.filter(
    (item) => !status || item.status === status,
  );
  const currentData = filteredData.slice(startIndex, endIndex);

  const { addGroupMutation } = useAddGroup();

  const handleNextData = useCallback(async () => {
    const newPageNumber = pageNumber + 1;
    setPageNumber(newPageNumber);
  }, [pageNumber, setPageNumber]);

  const handlePreviousData = useCallback(async () => {
    const newPageNumber = pageNumber - 1;
    setPageNumber(newPageNumber);
  }, [pageNumber, setPageNumber]);

  const clearFilter = useCallback(async () => {
    setStatus("");
    setPageNumber(1);
  }, [setStatus, setPageNumber]);

  const handleFilterClick = useCallback(
    async (filterStatus: string) => {
      setStatus(filterStatus);
      setPageNumber(1);
    },
    [setStatus, setPageNumber],
  );

  const handleCheckboxChange = (phone: string) => {
    if (selectedPhones.includes(phone)) {
      removePhone(phone);
    } else {
      addPhone(phone);
    }
  };

  const handleAddGroup = () => {
    if (selectedPhones.length === 0) {
      toast.error("Please select at least one phone number.");
      return;
    }

    const payload = {
      usersArray: selectedPhones.map((phone) => ({ phone })),
      campaignName: selectedCampaign?.campaignName || "Campaign",
      businessId: selectedCampaign?.businessId,
    };

    addGroupMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Group added successfully.");
        clearSelectedPhones();
      },
      onError: () => {
        toast.error("Failed to add group.");
      },
    });
  };

  return (
    <section
      className="bg-white rounded-lg shadow-sm"
      aria-label="Phone Numbers"
    >
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Customer Data</h2>
        <div className="flex items-center gap-4">
          {status && (
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 text-sm rounded-full ${getStatusStyle(
                status,
              )}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <button
                type="button"
                onClick={clearFilter}
                className="hover:opacity-75"
              >
                <CgClose className="w-4 h-4" />
              </button>
            </span>
          )}
          <Menu as="div" className="relative inline-block text-left">
            <MenuButton className="px-4 py-2 text-sm font-medium text-white bg-[#25D369] border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <Filter className="inline-block w-4 h-4 mr-2 " />
              Filter
            </MenuButton>
            <MenuItems className="absolute right-0 z-10 mt-2 bg-white border rounded shadow-md">
              <div className="py-1 min-w-28">
                {FILTER_OPTIONS.map((filterOption) => (
                  <MenuItem key={filterOption?.id}>
                    {({ active }) => (
                      <button
                        type="button"
                        className={`${
                          active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                        } block w-full px-4 py-2 text-left text-sm`}
                        onClick={() => handleFilterClick(filterOption?.status)}
                      >
                        {filterOption?.label.charAt(0).toUpperCase() +
                          filterOption?.label.slice(1)}
                      </button>
                    )}
                  </MenuItem>
                ))}
                <MenuItem>
                  {({ active }) => (
                    <button
                      type="button"
                      className={`${
                        active ? "bg-gray-100 text-red-700" : "text-red-700"
                      } block w-full px-4 py-2 text-left text-sm`}
                      onClick={() => handleFilterClick("")}
                    >
                      Clear
                    </button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full overflow-hidden align-middle border-b border-gray-200 shadow sm:rounded-lg">
          {currentData.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-base font-medium tracking-wider text-left text-black"
                  >
                    PHONE NUMBER
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-base font-medium tracking-wider text-left text-black"
                  >
                    DATA
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-base font-medium tracking-wider text-left text-black"
                  >
                    STATUS
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-base font-medium tracking-wider text-left text-black"
                  >
                    SELECT (ALL)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.map((item) => (
                  <tr
                    key={item._id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-base font-medium text-gray-900">
                        {item.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-base text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`capitalize inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-medium ${getStatusStyle(
                          item.status,
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedPhones.includes(item.phone)}
                        onChange={() => handleCheckboxChange(item.phone)}
                        className="w-4 h-4 text-blue-600 rounded-sm form-checkbox"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No data available for this campaign.
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center">
          <span className="font-medium">
            Showing {currentData.length} contacts
          </span>
        </div>
        <div className="flex justify-between flex-1 sm:justify-end">
          <button
            type="button"
            onClick={handlePreviousData}
            disabled={pageNumber === 1}
            className="relative inline-flex items-center text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            onClick={handleNextData}
            disabled={currentData.length === 0}
            className="relative inline-flex items-center ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight />
          </button>
          <button
            type="button"
            disabled={currentData.length === 0}
            onClick={handleAddGroup}
            className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-white bg-purple-500 border border-gray-300 rounded-md hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Group
          </button>
        </div>
      </div>
      {openExport && <ExportOptions />}
    </section>
  );
};

const PhoneNumbersTable = memo(MemoPhoneNumbersTable);
export default PhoneNumbersTable;
