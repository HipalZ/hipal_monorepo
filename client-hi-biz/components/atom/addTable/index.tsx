import React, { memo, useState } from "react";
import PopUp from "../popUp";
import CreateTables from "../createTable";
import AddBulkTables from "../addBulkTables";

const AddTables = ({ postZones, zoneId, staffs, closeModal, postStaffs, setTableModal }: any) => {
  const [activeClick, setActiveClick] = useState<number | null>(null);
  const [createTable, setCreateTable] = useState(false);
  const [existingTableModal, setExistingTableModal] = useState(false);
  function handleActiveClick(index: number) {
    setActiveClick(index);
    if (index === 0) {
      setCreateTable(true);
    } else if (index === 1) {
      setExistingTableModal(true);
    }
  }

  const addTables = [
    {
      id: 1,
      text: "Create new tables",
      description: "Create a new table",
    },
    {
      id: 2,
      text: "Add bulk tables",
      description: "Add many tables at once",
    },
  ];
  function closePopUpModal() {
    setCreateTable(false);
    setTableModal(false);
  }
  function closeEditPopModal() {
    setExistingTableModal(false);
  }
  return (
    <>
      <div className="bg-[#F5F5F5] rounded-t-[1.5rem]">
        <div className="px-6 py-5">
          <h1 className="text-2xl text-[#2B354D]">Add Tables</h1>
          {addTables.map((addTable, index) => {
            return (
              <div
                key={addTable?.id}
                onClick={() => handleActiveClick(index)}
                onKeyUp={() => handleActiveClick(index)}
                className={`${addTable?.id === 2 ? "opacity-50 pointer-events-none" : ""} ${activeClick === index
                  ? "border-[#2B354D] border-2"
                  : " border-1 border-[#CACACA]"
                  } bg-white rounded-md my-5 p-3 border`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="table"
                    className="mr-1"
                  />
                  <h1 className="mx-1 text-[#2B354D] text-base">
                    {addTable.text}
                  </h1>
                </div>
                <div className="flex justify-between mt-3">
                  <p className="text-sm text-[#2B354D]/70">
                    {addTable.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        {createTable && (
          <PopUp show={createTable} onClose={closePopUpModal}>
            <CreateTables
              postZones={postZones}
              zoneId={zoneId}
              closeModal={closeModal}
              closePopUpModal={closePopUpModal}
              postStaffs={postStaffs}
            />
          </PopUp>
        )}
        {existingTableModal && (
          <PopUp show={existingTableModal} onClose={closeEditPopModal}>
            <AddBulkTables
              zoneId={zoneId}
              staffs={staffs}
              closeModal={closeModal}
              closeEditPopModal={closeEditPopModal}
            />
          </PopUp>
        )}
      </div>
    </>
  );
};

export default memo(AddTables);
