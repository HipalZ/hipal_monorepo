import { dashBoard } from "@/test";
import { memo } from "react";
import { PiPersonArmsSpreadFill, PiThumbsUp } from "react-icons/pi";
import { BiStar } from "react-icons/bi";
import { LiaThumbsDown } from "react-icons/lia";
import { FaArrowDownLong, FaArrowUpLong } from "react-icons/fa6";

const symbol = ["💸", "🔁", "⭐", "👥"];
const typeArr = ["₹", "%", "", "%"];
const MemoSummary = () => {
  return (
    <>
      <article className="p-6 mx-4 text-white mt-6 bg-[#5197F8] rounded-2xl">
        <h6>Total subscribers</h6>
        <h3 className="flex items-center gap-4 mt-4 text-3xl">
          <PiPersonArmsSpreadFill size={32} />
          2,65,5000
        </h3>
      </article>
      <section className="flex flex-col lg:flex-row pb-[3rem]">
        <section className="flex-1">
          <h3 className="text-[#5197F8] py-6 pl-6">Target Groups</h3>
          <div className="flex items-end justify-center px-6 pb-4 space-x-3 overflow-hidden flex-nowrap h-30">
          {dashBoard.groups.slice(0,5).map((group, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className="w-12 bg-[#5197F8] rounded-t"
                style={{
                  height: group.userPercentage,
                  backgroundColor: group.groupColor,
                }}
              />
              <span className="mt-2 text-sm">{group.userCount}</span>
            </div>
          ))}
        </div>
          {dashBoard.groups.map((group, index) => (
            <div
              key={index}
              className="overflow-hidden lg:w-[30rem] mb-4 rounded-2xl mx-4 lg:mx-0"
            >
              <section className="flex items-center justify-between w-full px-6 pt-6 bg-white ">
                <article className="flex-1" style={{ color: group.groupColor }}>
                  <section className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: group.groupColor }}
                    />
                    <h3 className="font-semibold capitalize">
                      {group.groupName}
                    </h3>
                  </section>
                  <h3 className="mt-2 ml-8">{group.userCount}</h3>
                </article>
                <article className="">
                  <h3 className="flex items-start gap-1 mb-2 justify-evenly">
                    visit{" "}
                    {group.visitType === "ABOVE" ? (
                      <FaArrowUpLong />
                    ) : (
                      <FaArrowDownLong />
                    )}{" "}
                    in{" "}
                    <span className="text-[#FFA500]">
                      {group.duration} days
                    </span>{" "}
                  </h3>
                  <h3 className="flex items-start gap-1 justify-evenly">
                    spend{" "}
                    {group.spendType === "ABOVE" ? (
                      <FaArrowUpLong />
                    ) : (
                      <FaArrowDownLong />
                    )}{" "}
                    Rs {group.spendAmount}
                  </h3>
                </article>
              </section>
              <div className="pb-4 pt-2 bg-[#ffffff] px-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Engagement
                  </span>
                  <span className="text-sm font-medium font-semibold text-black">
                    {group.userPercentage}%
                  </span>
                </div>
                <div className="w-full rounded-full">
                  <div
                    className="bg-[#5197F8] h-2 rounded-full"
                    style={{
                      width: `${group.userPercentage}%`,
                      backgroundColor: group.groupColor,
                    }}
                  />
                </div>
              </div>
              {index < dashBoard.groups.length - 1 && (
                <hr className="border-gray-300 opacity-30" />
              )}
            </div>
          ))}
        </section>

        <section className="flex-1 lg:mt-12 max-w-[36rem]">
          <article className="my-4 business_system_cards">
            {Object.entries(dashBoard?.aboutCustomers).map(
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
                    {value ? value : ""}
                    {typeArr[index]}
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
            {Object.keys(dashBoard.userReviews).map((key) => (
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
                    {dashBoard?.userReviews?.[key]?.likePercentage}%
                  </section>
                  <section className="flex items-center gap-1">
                    <LiaThumbsDown size={20} />{" "}
                    {dashBoard?.userReviews?.[key]?.dislikePercentage}%
                  </section>
                </section>
              </article>
            ))}
          </article>
        </section>
      </section>
    </>
  );
};

const Summary = memo(MemoSummary);

export default Summary;
