import BottomButton from "@/components/atom/bottomButton";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import type { ICustomerRecord } from "@/components/types/businessData";
import { useGetAllPeoples } from "@/hooks/usePeopleData";
import { memo, useCallback } from "react";
import { FaMoneyBills } from "react-icons/fa6";
import { MdArrowOutward } from "react-icons/md";
import { SlLocationPin } from "react-icons/sl";
import { Link } from "react-router-dom";
import NoData from "@/assets/nodata.jpg";
import { CloudDownload } from "lucide-react";

const MemoUsersList = ({ hide }: { hide?: boolean }) => {
  const {
    toggleUserSelection,
    selectAllUsers,
    clearAllUsers,
    selectedUserIds,
    setAddGroupPage,
  } = useHiPeopleStore();

  const { isLoading, peopleData } = useGetAllPeoples();

  const allSelected = selectedUserIds.length === peopleData?.length;

  const handleSelectUser = useCallback(
    (id: string) => {
      toggleUserSelection(id);
    },
    [toggleUserSelection],
  );

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      clearAllUsers();
    } else {
      selectAllUsers(peopleData?.map((user) => user?.userId?._id));
    }
  }, [allSelected, peopleData, selectAllUsers, clearAllUsers]);

  const downloadSubscribers = () => {
    if (!peopleData || peopleData.length === 0) {
      console.error("No data available to download");
      return;
    }

    // Map only name and phone from peopleData
    const csvData = peopleData.map((user) => {
      const dobRaw = user?.userId?.dob;
      let dobFormatted = "0";
      if (dobRaw) {
        const date = new Date(dobRaw);
        if (!Number.isNaN(date.getTime())) {
          dobFormatted = date.toLocaleDateString();
        }
      }
      return {
        name: user?.userId?.name || "N/A",
        phone: user?.userId?.phone || "N/A",
        dob: dobFormatted,
      };
    });

    // Create CSV string
    const csvRows = [
      ["Name", "Phone", "DOB"], // CSV headers
      ...csvData.map((row) => [row.name, row.phone, row.dob]),
    ]
      .map((row) => row.join(",")) // Join each row with commas
      .join("\n"); // Separate rows with newlines

    // Create a Blob for the CSV
    const blob = new Blob([csvRows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    // Create a temporary link to trigger the download
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log("CSV file generated and downloaded");
  };

  return (
    <>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <main>
          <section className="flex items-center justify-between mb-4 ml-8">
            <article>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
                className="mr-2 text-black rounded-md"
              />
              <span className="text-[#6F649B]">
                Select {selectedUserIds.length}
              </span>
            </article>
            <div>
              <button
                type="button"
                onClick={downloadSubscribers}
                disabled={peopleData?.length === 0}
                className="px-4 py-2 text-sm text-white bg-purple-500 rounded-md disabled:cursor-not-allowed"
              >
                <CloudDownload className="inline-block w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          </section>
          <section className="flex flex-wrap justify-start pb-[7rem] gap-4 mx-4 lg:pb-[5rem]">
            {peopleData && peopleData?.length > 0 ? (
              peopleData.map((user: ICustomerRecord) => (
                <article
                  key={user._id}
                  className="shadow-lg relative flex items-center justify-between w-full p-4 bg-white rounded-2xl max-w-[28rem] md:max-w-[19rem] lg:max-w-[21.5rem]"
                >
                  <section className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user?.userId?._id)}
                      onChange={() => handleSelectUser(user?.userId?._id)}
                      className="w-5 h-5 mr-3 text-black rounded"
                    />
                    <div>
                      <h3>{user?.userId?.name}</h3>
                      <p>
                        {user?.userId?.phone?.slice(0, 2)}******
                        {user?.userId?.phone?.slice(-2)}
                      </p>
                    </div>
                  </section>
                  <div className="flex items-center gap-2 text-[#6F649B]">
                    <SlLocationPin />
                    {user?.visitCount} visits
                    <FaMoneyBills />
                    {user?.avgSpend}
                  </div>
                  {!hide && (
                    <Link
                      to={`/app/business/${user?.businessId}/people/${user?.userId?._id}`}
                      className="absolute top-1 right-1"
                    >
                      <MdArrowOutward size={24} />
                    </Link>
                  )}
                </article>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-[70dvh]">
                <img
                  src={NoData}
                  alt="No Data Found"
                  className="w-1/2 h-auto"
                />
                <h3 className="text-[#6F649B] mt-4">No Data Found</h3>
              </div>
            )}
          </section>
          {hide && selectedUserIds.length ? (
            <BottomButton
              buttons={[
                {
                  text: "Save",
                  onClick: () => setAddGroupPage("CREATE GROUP"),
                  type: "button",
                },
              ]}
            />
          ) : null}
        </main>
      )}
    </>
  );
};

const UsersList = memo(MemoUsersList);

export default UsersList;
