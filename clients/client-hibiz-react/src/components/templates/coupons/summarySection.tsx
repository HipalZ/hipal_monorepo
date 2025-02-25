import Background from "@/components/atom/feildBackground";
import PopUp from "@/components/atom/popUp";
import type { IAnalytics } from "@/hooks/useCoupon";
import { memo, useCallback, useState } from "react";
import { BsPersonFill } from "react-icons/bs";

const MemoSummarySection = ({ analytics }: { analytics?: IAnalytics }) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  if (!analytics) {
    return (
      <section>
        <p>No analytics data available.</p>
      </section>
    );
  }

  const getKey = useCallback((key: string) => {
    if (key === "totalGrabbed") {
      console.log("totalGrabbed");
      setOpenModal(true);
    }
  }, []);

  return (
    <section className="flex gap-4 mx-4 mt-4 lg:mx-0 lg:max-w-[28rem]">
      {Object.keys(analytics)
        .slice(0, 3)
        .map((key, index) => {
          return (
            <button
              type="button"
              key={index}
              onClick={() => getKey(key)}
              className="rounded-2xl w-full max-w-[7.75rem] lg:w-[8.5rem] lg:max-w-[9.25rem] bg-[#FFFFFF] py-3 capitalize text-[#6F649B]"
            >
              <h3 className="text-sm">{key?.slice(5)}</h3>
              <p className="mt-2 text-xl font-semibold text-black">
                {analytics?.[key]}
              </p>
            </button>
          );
        })}
      {openModal && (
        <PopUp onClose={() => setOpenModal(false)} show={openModal}>
          <section className="m-4 min-h-[50dvh]">
            <center className="text-2xl font-bold">Grabbed Users</center>
            <section className="flex flex-wrap gap-4 mt-4 md:gap-2">
              {analytics?.grabUsers.length > 0 &&
                analytics?.grabUsers?.map((user) => {
                  console.log(user);
                  return (
                    <section
                      key={user?.userId?._id}
                      className="w-full md:max-w-[15rem]"
                    >
                      <Background className="flex items-center gap-2 !my-0 !py-2">
                        <article className="bg-[#6A31DF50] p-2 rounded-2xl">
                          <BsPersonFill size={24} />
                        </article>
                        <section className="font-semibold">
                          <h3 className="w-[100%]">{user?.userId?.name}</h3>
                          <p className="opacity-60">{user?.userId?.phone}</p>
                        </section>
                      </Background>
                    </section>
                  );
                })}
            </section>
          </section>
        </PopUp>
      )}
    </section>
  );
};

const SummarySection = memo(MemoSummarySection);

export default SummarySection;
