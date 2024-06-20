import { useState } from "react";
import axios from "@/components/utils/axios";
import { Disclosure } from "@headlessui/react";
import { FiChevronDown } from "react-icons/fi";
import { HiX } from "react-icons/hi";
import DayOutPopup from "@/components/atoms/dayoutPopup";
import { useTable } from "@/components/store/useTable";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import { toast } from "react-toastify";
import Loader from "@/components/atoms/loader";
import { useQuery } from "@tanstack/react-query";
import { useLogin } from "@/components/store/useLogin";
import { useNavigate, useParams } from "react-router-dom";

function Switch({setCurrentView}:any) {
  const navigate = useNavigate();
  const { businessId, zoneId } = useParams<{
    businessId: string;
    zoneId: string;
  }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetTable, setTargetTable] = useState<any>(null);
  const tableData = useTable((s) => s.tableData);
  const [businesses, setBusinesses] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const userDetails = useLogin((s) => s.userDetails);

  const handleSearchChange = (event:Event) => {
    const value = (event.target as HTMLInputElement).value;
    setSearchTerm(value.toLowerCase());
  };

  const openModal = (table) => {
    setTargetTable(table);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const allTables = businesses.flatMap((zone) => zone.tables);

  const filteredTables = allTables.filter(
    (table) =>
      table.name.toLowerCase().includes(searchTerm) &&
      table.status.toLowerCase() === "empty"
  );
  const fetchZones = async () => {
		try {
			const res = await axios.get(
				`/v1/zones/${zoneId}/tablesByZones?businessId=${businessId}`,
			);
			setBusinesses([res?.data?.data]);
			return res?.data;
		} catch (error) {
			toast.error("Error fetching tables");
		}
	};

	const { isLoading } = useQuery({
		queryKey: ["tables", businessId, zoneId],
		queryFn: fetchZones,
		enabled: !!zoneId && !!businessId,
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Loader />
			</div>
		);
	}

  const handleTableTransfer = async (toTable) => {
    if (tableData._id === toTable._id) {
      toast.error("You cannot switch to the same table.");
      return;
    }
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
      const res = await axios.put("/v1/kitchens/update/transferTable", body);
      if (res.status === 200) {
        closeModal();
        toast.success(
          `Table ${tableData.name} transferred to ${toTable.name} successfully`
        );
        navigate(routePaths[PAGE_TYPES.TABLES](businessId || '', zoneId || ''));
      }
    } catch (error) {
      toast.error("Error transferring table");
      console.error("Error transferring table:", error);
    }
  };
  return (
    <div className="relative w-full bg-secondary min-h-screen px-6 pb-[10rem] pt-6 overflow-auto scroll-smooth">
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
          className="w-full p-2 border border-[#cacaca] rounded-md bg-base-100"
        />
      </div>

      {searchTerm ? (
        <>
          {filteredTables.map((table) => (
            <div
              key={table._id}
              className="w-full max-w-md p-4 mx-auto mt-6 border bg-base-100 rounded-2xl"
            >
              <div className="flex justify-between">
                <div>{table.name}</div>
                <button
                type="button"
                  onClick={() => openModal(table)}
                  className="px-4 py-1 font-medium border text-primary border-primary rounded-2xl"
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
            <div
              id={zone.zoneId}
              key={zone.zoneId}
              className="w-full max-w-md border mx-auto p-4 mt-6 bg-base-100 rounded-2xl scroll-mt-[13.2rem]"
            >
              <Disclosure>
                {({ open }) => (
                  <>
                    <div>
                      <Disclosure.Button className="flex justify-between w-full px-4 text-lg font-medium text-left rounded-2xl">
                        <div className="w-[80%] mt-[0.125rem] -ml-4">
                          {zone.zoneName}
                        </div>
                        <span className="mt-1 -mr-4">{zone.tables.length}</span>
                        <FiChevronDown
                          className={`${
                            open ? "rotate-180 transform" : ""
                          } h-5 w-5 mt-2 -mr-2`}
                        />
                      </Disclosure.Button>
                      <div>
                        {open && (
                          <Disclosure.Panel className="pt-4 pb-2 text-sm text-gray-500 transition-all duration-300">
                            <div className="h-[0.125rem] bg-primary" />
                            <div className="mt-2 ">
                              {zone.tables
                                .filter(
                                  (table) =>
                                    table.status.toLowerCase() === "empty"
                                )
                                .map((table) => (
                                  <div
                                    onClick={() => openModal(table)}
                                    key={table._id}
                                    className="flex items-center justify-between py-4 mb-2 border-b border-dashed"
                                  >
                                    <div>{table?.name}</div>
                                    <div className="on_active_bounce">
                                      <button type="button" className="px-4 py-1 font-medium border text-primary border-primary rounded-2xl">
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
        <div className="mt-4 ml-4 text-xl font-bold capitalize text-base-content">
          {tableData?.name}
        </div>
        <div className="mt-4 ml-4 font-semibold">
          Do you want to switch {tableData?.name} to {targetTable?.name} in zone{" "}
          ?
        </div>
        <div className="flex justify-between mx-12 mt-6 pb-9">
          <span onClick={closeModal} className="text-sm">
            Cancel
          </span>
          <button
          type="button"
            onClick={() => handleTableTransfer(targetTable)}
            className="px-6 py-2 -mr-6 text-sm bg-primary text-base-100 rounded-3xl"
          >
            Switch
          </button>
        </div>
      </DayOutPopup>
    </div>
  );
}

export default Switch;
