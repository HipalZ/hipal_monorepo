import type { IStaffs, ITables } from "@/components/types/businessData";
import { useRouter } from "next/router";
import React, { memo, useState } from "react";
import { BsFillPersonFill } from "react-icons/bs";

const AddBulkTables = ({ zoneId, staffs, closeModal, closeEditPopModal }: any) => {
  const [numTables, setNumTables] = useState<number>(0);
  function handleNumTables(e: any) {
    setNumTables(e.target.value);
    const initialTables = Array.from({ length: numTables }, (_, index) => ({
      id: `${index + 1}`,
      name: "",
      capacity: 0,
    }));

    setArrayTables(initialTables);
  }
  const [arrayTables, setArrayTables] = useState<ITables[]>([]);
  const [tableNamePrefix, setTableNamePrefix] = useState<string>("");
  const [activeClick, setActiveClick] = useState<Array<string>>([]);
  const router = useRouter();

  function createArrayTable() {
    closeModal();
    closeEditPopModal();
  }
  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>, id: any) {
    setArrayTables((currentTables) =>
      currentTables.map((table) =>
        table.id === id ? { ...table, name: e.target.value } : table
      )
    );
  }

  function handleCapacityChange(
    e: React.ChangeEvent<HTMLInputElement>,
    id: any
  ) {
    setArrayTables((currentTables) =>
      currentTables.map((table) =>
        table.id === id ? { ...table, name: e.target.value } : table
      )
    );
  }
  function handleActiveClick(id: string) {
    setActiveClick((prev) => {
      if (prev.includes(id)) {
        return prev.filter((activeId) => activeId !== id);
      }
        return [...prev, id];
    });
  }
  const AddedTables = ({ key, tableObj, index }: any) => {
    return (
      <div
        key={key}
        className="px-4 my-4 rounded-lg border border-1 border-[#CACACA]"
      >
        <div>
          <h1 className="my-2 text-base"> {index + 1}. Name of Table</h1>
          <input
            //value={arrayTables[index]?.name}
            onChange={(e) => handleNameChange(e, index)}
            className="w-full rounded-md"
            type="text"
            placeholder="Name"
          />
          <div className="my-3">
            <h1 className="my-2 text-base">Capacity of the tables</h1>
            <input
              value={tableObj?.capacity}
              onChange={(e) => handleCapacityChange(e, index)}
              className="w-full rounded-md"
              type="text"
              placeholder="Capacity"
            />
          </div>
        </div>

        <div className="my-4">
          {staffs?.map((staff: IStaffs, index: number) => {
            return (
              <div
                key={index}
                className={`${activeClick.includes(staff?.id)
                    ? "border-[#2B354D]  border-2"
                    : " border-1 border-[#CACACA]"
                  } bg-white rounded-md my-5 p-3 border`}
              >
                <div className="flex items-center">
                  <input
                    onClick={() => handleActiveClick(staff?.id)}
                    type="checkbox"
                    className="mr-2 rounded-sm"
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
    );
  };
  return (
    <div className="bg-[#F5F5F5] h-[90vh] overflow-auto rounded-t-[1.5rem]">
      <h1 className="px-6 pt-6 text-[#2B354D] text-2xl">Add Bulk Tables</h1>
      <div className="bg-white rounded-lg mx-6 my-5 pb-2 border border-1 border-[#CACACA] px-4">
        <div className="my-2">
          <h1 className="my-2 text-base">Number of Tables</h1>
          <input
            // value={numTables}
            onChange={(e) => handleNumTables(e)}
            className="w-full rounded-md"
            type="text"
            placeholder="Name"
          />
        </div>
        <div className="my-2">
          <h1 className="my-2 text-base">Table name starts with</h1>
          <input
            onChange={(e) => setTableNamePrefix(e.target.value)}
            className="w-full rounded-md"
            type="text"
            placeholder="Name"
          />
        </div>
      </div>
      <div className="bg-white rounded-lg mx-6 my-5 border border-1 border-[#CACACA] px-4">
        {numTables > 0 && <h1 className="my-2">Added Tables ({numTables})</h1>}
        {Array.from({ length: numTables }).map((_, index) => (
          <AddedTables
            key={index.toString()}
            tableObj={arrayTables[index]}
            index={index}
          />
        ))}
      </div>

      <div className="sticky py-6 mx-6 bottom-5">
        <button
          type="button"
          onClick={() => createArrayTable()}
          className="on_active_bounce text-white rounded-md bg-[#2B354D] py-2.5 w-full"
        >
          Create
        </button>
      </div>
    </div>
  );
};

export default memo(AddBulkTables);
