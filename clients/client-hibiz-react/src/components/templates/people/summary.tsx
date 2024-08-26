import { memo } from "react";
import { PiPersonArmsSpreadFill, PiThumbsUp } from "react-icons/pi";
import { BiStar } from "react-icons/bi";
import { LiaThumbsDown } from "react-icons/lia";
import { FaArrowDownLong, FaArrowUpLong } from "react-icons/fa6";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import { useSummarizedPeopleData } from "@/hooks/usePeopleData";
import { hexToRgba } from "@/components/utils/helper";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import DateRangePicker from "./dateRangePicker";
import PopUp from "@/components/atom/popUp";
import { SlCalender } from "react-icons/sl";
import { format } from "date-fns";
import NoData from "@/assets/nodata.jpg";

const symbol = ["💸", "🔁", "⭐", "👥"];
const typeArr = ["₹", "%", "", "%"];
const MemoSummary = () => {
  const { peopleData } = useHiPeopleStore();
  console.log(peopleData);
  const {
    openDatePickerModal,
    setOpenDatePickerModal,
    dateInTimeStamp,
    dateRange,
  } = useHiPeopleStore((state) => ({
    dateRange: state.dateRange,
    setOpenDatePickerModal: state.setOpenDatePickerModal,
    openDatePickerModal: state.openDatePickerModal,
    dateInTimeStamp: state.dateInTimeStamp,
  }));

  const [from, to] = dateRange;

  const formattedFrom = from
    ? format(from, "dd MMM yyyy")
    : "Select Start Date";
  const formattedTo = to ? format(to, "dd MMM yyyy") : "Select End Date";
  const { isLoading } = useSummarizedPeopleData(
    dateInTimeStamp.from,
    dateInTimeStamp.to,
  );

  if (isLoading)
    return (
      <div>
        <LoadingSpinner />
      </div>
    );

  return (
    <>
      <article className="p-6 mx-4 text-white mt-6 lg:mt-0 bg-[#5197F8] rounded-2xl">
        <h6>Total subscribers</h6>
        <h3 className="flex items-center gap-4 mt-4 text-3xl">
          <PiPersonArmsSpreadFill size={32} />
          {peopleData?.totalSubscriberCount?.toLocaleString()}
        </h3>
      </article>
      <section className="flex flex-col lg:flex-row pb-[3rem]">
        <section className="flex-1">
          <h3 className="text-[#5197F8] py-6 pl-6">Target Groups</h3>
          {peopleData?.groups && peopleData.groups.length > 0 ? (
            <>
              <div className="flex items-end justify-center px-6 pb-4 space-x-3 overflow-hidden flex-nowrap h-30">
                {peopleData.groups.slice(0, 4).map((group) => (
                  <article key={group._id}>
                    <h3 className="text-xs text-center text-[#5197F8]">
                      {group.userPercentage}%
                    </h3>
                    <div className="flex flex-col items-center">
                      <div
                        className="w-16 lg:w-20 bg-[#5197F8] rounded-t"
                        style={{
                          height: group.userPercentage,
                          backgroundColor: group.groupColor,
                        }}
                      />
                      <span className="mt-2 text-sm">{group.userCount}</span>
                    </div>
                  </article>
                ))}
              </div>
              {peopleData.groups.slice(0, 4).map((group, index) => (
                <div
                  key={group._id}
                  className="overflow-hidden lg:w-[30rem] mb-4 rounded-2xl mx-4 lg:mx-0"
                >
                  <section className="flex items-center justify-between w-full p-4 bg-white">
                    <article
                      className="flex-1"
                      style={{ color: group?.groupColor }}
                    >
                      <section className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full bg-[#5197F8]"
                          style={{ backgroundColor: group?.groupColor }}
                        />
                        <h3 className="font-semibold capitalize">
                          {group?.groupName}
                        </h3>
                      </section>
                      <h3 className="pt-3 ml-8">{group?.userCount}</h3>
                    </article>
                    <article className="">
                      <h3 className="flex items-start mb-3 justify-evenly">
                        visit{" "}
                        {group?.visitType === "ABOVE" ? (
                          <FaArrowUpLong className="text-[#52B763]" />
                        ) : (
                          <FaArrowDownLong className="text-[#E51919]" />
                        )}{" "}
                        in{" "}
                        <span className="text-[#FFA500] ml-1">
                          {group?.duration} days
                        </span>{" "}
                      </h3>
                      {group?.spendAmount && group?.spendAmount > 0 && (
                        <h3 className="flex items-start gap-1 justify-evenly">
                          spend{" "}
                          {group.spendType === "ABOVE" ? (
                            <FaArrowUpLong className="text-[#52B763]" />
                          ) : (
                            <FaArrowDownLong className="text-[#E51919]" />
                          )}{" "}
                          Rs {group?.spendAmount}
                        </h3>
                      )}
                    </article>
                  </section>
                  <div
                    style={{
                      backgroundColor: hexToRgba(group?.groupColor),
                    }}
                    className="px-4 py-2"
                  >
                    <div className="flex justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-700 ">
                        Engagement
                      </h3>
                      <span className="text-sm font-semibold text-black">
                        {group?.userPercentage}%
                      </span>
                    </div>
                    <div className="w-full rounded-full">
                      <div
                        className="bg-[#5197F8] h-2 rounded-full"
                        style={{
                          width: `${group?.userPercentage}%`,
                          backgroundColor: group?.groupColor,
                        }}
                      />
                    </div>
                  </div>
                  {index < peopleData?.groups?.length - 1 && (
                    <hr className="border-gray-300 opacity-30" />
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <img src={NoData} alt="No Data Found" className="h-auto w-[80%] rounded-2xl" />
              <h3 className="text-[#5197F8] mt-4">No Data Found</h3>
            </div>
          )}
        </section>

        <section className="flex-1 lg:mt-12 max-w-[36rem]">
          <section className="flex items-center justify-between mx-4 mt-6 text-white lg:mt-14">
            <article className="flex items-center gap-2">
              <PiPersonArmsSpreadFill size={30} className="bg-[#5197f8]" />
              <h3 className="text-[#5197f8] text-sm">
                About Customer <br /> {formattedFrom} - {formattedTo}
              </h3>
            </article>
            <button
              onClick={() => setOpenDatePickerModal(true)}
              type="button"
              className="w-[6rem] gap-2 py-2 flex justify-center items-center bg-[#5197F8] rounded-full text-white"
            >
              <SlCalender /> Date
            </button>
          </section>
          <article className="my-4 business_system_cards">
            {peopleData?.aboutCustomer &&
              Object.entries(peopleData?.aboutCustomer).map(
                ([key, value], index) => (
                  <article
                    key={key}
                    className="p-6 text-[#6F649B] mt-6 bg-[#FFFFFF] rounded-2xl"
                  >
                    <p className="flex items-center gap-2 mb-2">
                      {symbol[index]}{" "}
                      {key
                        ?.replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </p>
                    <h3>
                      {typeArr[index] === "₹"
                        ? `${typeArr[index]} ${value ? value : 0}`
                        : `${value ? value : 0} ${typeArr[index]}`}
                    </h3>
                  </article>
                ),
              )}
          </article>
          <article className="p-6 mx-4 text-[#6F649B] -mt-[3.5rem] bg-[#FFFFFF] rounded-2xl">
            <h6 className="flex items-center gap-2">
              <BiStar />
              Avg reviews
            </h6>
            {peopleData?.userReviews &&
              Object.keys(peopleData?.userReviews).map((key) => (
                <article
                  key={key}
                  className="flex items-center justify-between gap-4 mt-4"
                >
                  <section className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#6F649B] rounded-full" />
                    <h3>{key}</h3>
                  </section>
                  <section className="flex items-center gap-4">
                    <section className="flex items-center gap-1">
                      <PiThumbsUp size={18} />{" "}
                      {peopleData?.userReviews?.[key]?.likePercentage}%
                    </section>
                    <section className="flex items-center gap-1">
                      <LiaThumbsDown size={20} />{" "}
                      {peopleData?.userReviews?.[key]?.dislikePercentage}%
                    </section>
                  </section>
                </article>
              ))}
          </article>
        </section>
      </section>
      {openDatePickerModal && (
        <PopUp
          show={openDatePickerModal}
          onClose={() => setOpenDatePickerModal(false)}
          width="w-[30rem]"
          height="h-[30rem]"
        >
          <section className="h-[75vh]">
            <DateRangePicker />
          </section>
        </PopUp>
      )}
    </>
  );
};

const Summary = memo(MemoSummary);

export default Summary;
