import { memo, useState } from 'react';
import CreateTables from '../createTable';
import PopUp from '../popUp';

const AddTables = memo(({ postZones, zoneId, staffs, closeModal, postStaffs, setTableModal }: any) => {
  const [activeClick, setActiveClick] = useState<number | null>(null);
  const [createTable, setCreateTable] = useState(false);
  function handleActiveClick(index: number) {
    setActiveClick(index);
    if (index === 0) {
      setCreateTable(true);
    }
  }

  const addTables = [
    {
      _id: 1,
      text: 'Create new tables',
      description: 'Create a new table',
    },
    {
      _id: 2,
      text: 'Add bulk tables',
      description: 'Add many tables at once',
    },
  ];

  function closePopUpModal() {
    setCreateTable(false);
    setTableModal(false);
  }

  return (
    <div className="rounded-t-[1.5rem] bg-[#F5F5F5]">
      <div className="px-6 py-5">
        <h1 className="text-2xl text-[#2B354D]">Add Tables</h1>
        {addTables.map((addTable, index) => {
          return (
            <div
              key={addTable?._id}
              onClick={() => handleActiveClick(index)}
              onKeyUp={() => handleActiveClick(index)}
              className={`${addTable?._id === 2 ? 'pointer-events-none opacity-50' : ''} ${
                activeClick === index ? 'border-2 border-[#2B354D]' : ' border-1 border-[#CACACA]'
              } my-5 rounded-md border bg-white p-3`}
            >
              <div className="flex items-center">
                <input type="radio" name="table" className="mr-1" />
                <h1 className="mx-1 text-base text-[#2B354D]">{addTable.text}</h1>
              </div>
              <div className="mt-3 flex justify-between">
                <p className="text-sm text-[#2B354D]/70">{addTable.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      {createTable && (
        <PopUp show={createTable} onClose={closePopUpModal}>
          <CreateTables postZones={postZones} zoneId={zoneId} closeModal={closeModal} closePopUpModal={closePopUpModal} postStaffs={postStaffs} />
        </PopUp>
      )}
    </div>
  );
});

export default AddTables;
