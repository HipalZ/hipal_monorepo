import BottomPopUp from "@/components/atoms/bottomPopUp";
import { useReview } from "@/components/store/useReview";
import { cn, reviewColors } from "@/components/utils/helpers";
import { memo, useCallback } from "react";

const MemoStaffs = () => {
  const {
    showSuggestions,
    selectedEmoji,
    staffs,
    selectedStaff,
    tempSelectedStaff,
    setTempSelectedStaff,
    setShowSuggestions,
    setSelectedStaff,
    setStoreStaffId,
  } = useReview((s) => ({
    showSuggestions: s.showSuggestions,
    selectedEmoji: s.selectedEmoji,
    staffs: s.staffs,
    selectedStaff: s.selectedStaff,
    tempSelectedStaff: s.tempSelectedStaff,
    setTempSelectedStaff: s.setTempSelectedStaff,
    setShowSuggestions: s.setShowSuggestions,
    setSelectedStaff: s.setSelectedStaff,
    setStoreStaffId: s.setStoreStaffId,
  }));

  const handleSelectStaff = useCallback(
    (name, staffId) => {
      setTempSelectedStaff(name);
      setStoreStaffId(staffId);
    },
    [setStoreStaffId],
  );

  const handleSaveStaff = useCallback(() => {
    setSelectedStaff(tempSelectedStaff);
    setShowSuggestions(false);
  }, [tempSelectedStaff, showSuggestions, selectedStaff]);

  const handleCloseSuggestions = useCallback(() => {
    setTempSelectedStaff(selectedStaff);
    setShowSuggestions(false);
  }, [selectedStaff, showSuggestions, tempSelectedStaff]);
  return (
    <>
      {selectedEmoji !== null ? (
        <div className="flex flex-wrap gap-2 mx-6 mt-2">
          {selectedStaff &&
            selectedStaff.length > 0 &&
            selectedStaff?.map((staff) => (
              <div key={staff} className="flex">
                <span
                  style={{
                    backgroundColor:
                      reviewColors[selectedEmoji]?.buttonTextColor,
                  }}
                  className={cn("px-4 py-1 my-2 rounded-md text-sm")}
                >
                  {staff}
                </span>
              </div>
            ))}
        </div>
      ) : null}
      {showSuggestions && selectedEmoji !== null && (
        <BottomPopUp show={showSuggestions} onClose={handleCloseSuggestions}>
          <section className="text-black bg-[#FBFEFC] rounded-t-2xl">
            <ul
              className="w-full h-[60vh] mt-0 overflow-y-auto"
              style={{ zIndex: 2 }}
            >
              <center className="my-4 text-2xl font-semibold !text-black">
                Staff Members
              </center>
              {staffs.length > 0 ? (
                staffs?.map((staff, index) => (
                  <li
                    key={staff?.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectStaff(staff?.name, staff?._id);
                    }}
                    className={cn(
                      "!bg-[#FBFEFC] h-10 rounded-xl flex items-center m-2 p-4 text-lg cursor-pointer transition-colors duration-200",
                    )}
                  >
                    <input
                      type="checkbox"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectStaff(staff?.name, staff?._id);
                      }}
                      checked={tempSelectedStaff?.includes(staff?.name)}
                      className={cn(
                        "h-[1rem] aspect-square border border-1",
                        "mr-2 rounded-2xl",
                      )}
                      style={{
                        borderColor:
                          reviewColors[selectedEmoji]?.buttonTextColor,
                      }}
                    />
                    <span className="flex-grow text-base !text-black">
                      {staff?.name.length > 14
                        ? `${staff?.name.slice(0, 14)}...`
                        : staff?.name}
                    </span>
                  </li>
                ))
              ) : (
                <center className="my-4 text-lg text-gray-500">
                  No Staffs Found
                </center>
              )}
            </ul>
            <button
              type="button"
              onClick={handleSaveStaff}
              className="bottom_btn w-full h-10 rounded-full text-sm font-semibold text-[#FBFEFC] !bg-black"
            >
              Save
            </button>
          </section>
        </BottomPopUp>
      )}
    </>
  );
};

const Staffs = memo(MemoStaffs);
export default Staffs;
