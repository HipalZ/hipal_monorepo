import { IStaffs, ITables } from '@/components/types/businessData';
import React, { memo, useEffect, useState } from 'react';
import { BsFillPersonFill } from 'react-icons/bs';

type ITableObj = {
  name: string;
  capacity: number | undefined;
  businessId: string;
  staffs?: string[];
};
const EditTables = ({ postZones, setPostZones, table, closeModal, closePopUpModal, getTableUpdatedData, postStaffs }: any) => {
  const [activeClick, setActiveClick] = useState<Array<string>>([]);
  const [tableData, setTableData] = useState<ITableObj>({});
  const [staffs, setStaffs] = useState<IStaffs[]>([]);
  const [eachZoneId, setEachZoneId] = useState('');
  useEffect(() => {
    setActiveClick(table?.staff || []);
    setTableData(table);
    setStaffs(postStaffs);
  }, [table, postStaffs]);
  const EditTable = async () => {
    getTableUpdatedData(tableData);
    closePopUpModal();
    closeModal();
  };
  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTableData((tableData: ITables) => {
      return {
        ...tableData,
        name: e.target.value,
      };
    });
  }
  function handleCapacityChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTableData((tableData: ITables) => {
      return {
        ...tableData,
        capacity: e.target.value,
      };
    });
  }

  function handleActiveClick(id: string) {
    setActiveClick((prev) => {
      if (prev.includes(id)) {
        return prev.filter((activeId) => activeId !== id);
      }
      {
        return [...prev, id];
      }
    });
  }
  const handleZonesData = (newZoneId: string) => {
    // Find and update the old zone to remove the table's ID
    const updatedZones = postZones.map((zone) => {
      if (zone._id === tableData.zoneId) {
        // Remove the table's ID from the old zone
        const updatedTables = zone.tables.filter((tableId) => tableId !== table._id);
        return { ...zone, tables: updatedTables };
      } else if (zone._id === newZoneId) {
        // Add the table's ID to the new zone
        const updatedTables = [...zone.tables, table._id];
        return { ...zone, tables: updatedTables };
      }
      return zone;
    });

    // Update the postZones updatedTables
    setPostZones(updatedZones);

    // Update other states as previously
    const selectedZone = postZones.find((zone) => zone._id === newZoneId);
    const newStaffs = postStaffs.filter((staff) => selectedZone?.staff?.includes(staff._id));
    setStaffs(newStaffs);
    setEachZoneId(newZoneId);
    setTableData({ ...tableData, zoneId: newZoneId });
  };

  useEffect(() => {
    setTableData((tableData: ITables) => {
      return {
        ...tableData,
        staffs: activeClick,
      };
    });
  }, [activeClick]);
  return (
    <div className="rounded-t-[1.5rem] bg-[#F5F5F5]">
      <div className="max-h-[85vh] overflow-y-auto">
        <h1 className="px-6 pt-6 text-2xl text-[#2B354D]">Edit Tables</h1>
        <div className="border-1 mx-6 my-5 rounded-lg border border-[#CACACA] bg-white px-4">
          <div className="my-4">
            <h1 className="my-4 text-base">Name of the Table</h1>
            <input value={tableData?.name} onChange={handleNameChange} maxLength={50} className="w-full rounded-md" type="text" placeholder="Name" />
          </div>
          <div className="my-4">
            <h1 className="my-4 text-base">Capacity of the Table</h1>
            <input
              value={tableData?.capacity}
              onChange={handleCapacityChange}
              maxLength={5}
              className="w-full rounded-md"
              type="text"
              placeholder="Capacity"
            />
          </div>
          <div className="my-4">
            {staffs?.map((staff: IStaffs) => {
              return (
                <div
                  key={staff?._id}
                  onClick={() => handleActiveClick(staff?._id)}
                  className={`${
                    activeClick.includes(staff?._id) ? 'border-2  border-[#2B354D]' : ' border-1 border-[#CACACA]'
                  } my-5 rounded-md border bg-white p-3`}
                >
                  <div className="flex items-center">
                    <input type="checkbox" checked={activeClick.includes(staff?._id)} className="mr-2 rounded-sm" readOnly />
                    <BsFillPersonFill />
                    <h1 className="mx-2 text-base">{staff?.name}</h1>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <p className="text-sm text-[#2B354D]/70">{staff?.role}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="sticky bottom-5 mx-6 my-6">
          <button type="button" onClick={EditTable} className="on_active_bounce w-full rounded-md bg-[#2B354D] py-2.5 text-white">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(EditTables);
