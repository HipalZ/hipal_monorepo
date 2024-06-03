import { IStaffs, ITables, IZones } from "@/components/types/businessData";
import React, { memo, useEffect, useState } from "react";
import { BsFillPersonFill } from "react-icons/bs";


type ITableObj = {
    name: string,
    capacity: number | undefined,
    businessId: string,
    staffs?: string[]
}
const EditTables = ({ postZones, setPostZones, table, closeModal, closePopUpModal, getTableUpdatedData, postStaffs }: any) => {
    const [activeClick, setActiveClick] = useState<Array<string>>([]);
    const [tableData, setTableData] = useState<ITableObj>({});
    const [staffs, setStaffs] = useState<IStaffs[]>([]);
    const [eachZoneId, setEachZoneId] = useState('');
    useEffect(() => {
        setActiveClick(table?.staff || []);
        setTableData(table)
        setStaffs(postStaffs)
    }, [table, postStaffs])
    const EditTable = async () => {
        getTableUpdatedData(tableData)
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
            } {
                return [...prev, id];
            }
        });
    }
    const handleZonesData = (newZoneId: string) => {
        // Find and update the old zone to remove the table's ID
        const updatedZones = postZones.map((zone) => {
            if (zone.id === tableData.zoneId) {
                // Remove the table's ID from the old zone
                const updatedTables = zone.tables.filter(tableId => tableId !== table.id);
                return { ...zone, tables: updatedTables };
            } else if (zone.id === newZoneId) {
                // Add the table's ID to the new zone
                const updatedTables = [...zone.tables, table.id];
                return { ...zone, tables: updatedTables };
            }
            return zone;
        });

        // Update the postZones updatedTables 
        setPostZones(updatedZones);

        // Update other states as previously
        const selectedZone = postZones.find(zone => zone.id === newZoneId);
        const newStaffs = postStaffs.filter(staff => selectedZone?.staff?.includes(staff.id));
        setStaffs(newStaffs);
        setEachZoneId(newZoneId);
        setTableData({ ...tableData, zoneId: newZoneId });
    };

    useEffect(() => {
        setTableData((tableData: ITables) => {
            return {
                ...tableData,
                staffs: activeClick
            }
        })
    }, [activeClick])
    return (
        <div className="bg-[#F5F5F5] rounded-t-[1.5rem]">
            <div className="overflow-y-auto max-h-[85vh]">
                <h1 className="px-6 pt-6 text-[#2B354D] text-2xl">Edit Tables</h1>
                <div className="bg-white rounded-lg mx-6 my-5 border border-1 border-[#CACACA] px-4">
                    <div className="my-4">
                        <h1 className="my-4 text-base">Name of the Table</h1>
                        <input
                            value={tableData?.name}
                            onChange={handleNameChange}
                            maxLength={50}
                            className="w-full rounded-md"
                            type="text"
                            placeholder="Name"
                        />
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
                                    key={staff?.id}
                                    onClick={() => handleActiveClick(staff?.id)}
                                    className={`${activeClick.includes(staff?.id)
                                        ? "border-[#2B354D]  border-2"
                                        : " border-1 border-[#CACACA]"
                                        } bg-white rounded-md my-5 p-3 border`}
                                >
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={activeClick.includes(staff?.id)}
                                            className="mr-2 rounded-sm"
                                            readOnly
                                        />
                                        <BsFillPersonFill />
                                        <h1 className="mx-2 text-base">{staff?.name}</h1>
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        <p className="text-sm text-[#2B354D]/70">{staff?.role}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="sticky mx-6 my-6 bottom-5">
                    <button
                        type="button"
                        onClick={EditTable}
                        className="on_active_bounce text-white rounded-md bg-[#2B354D] py-2.5 w-full"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default memo(EditTables);
