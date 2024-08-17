import useHiPeopleStore from "@/components/store/useHipeopleStore";
import { cn, timestampToDateTime } from "@/components/utils/helper";
import { memo } from "react";
import { GiTwoCoins } from "react-icons/gi";

const MemoCoinzUsage = () => {
  const { userCoinzDetails } = useHiPeopleStore((s) => ({
    userCoinzDetails: s.userCoinzDetails,
  }));

  return (
    <section className="relative grid md:grid-cols-2 lg:grid-cols-3 pb-[10rem] gap-4 mx-4 mt-4 lg:mx-0">
      {userCoinzDetails && userCoinzDetails.length > 0 ? (
        userCoinzDetails.map((data) => (
          <section key={data?._id} className="payment_card_ui">
            <section className="flex justify-between">
              <section className="mb-2">
                <figure className="flex items-center space-x-4">
                  {data?.status === "PLUS" ? (
                    <span
                      className="px-3 py-1.5 rounded-lg"
                      style={{
                        background: "radial-gradient(circle, white, green)",
                      }}
                    >
                      +
                    </span>
                  ) : (
                    <span
                      className="px-3.5 py-1.5 rounded-lg"
                      style={{
                        background: "radial-gradient(circle, white, red)",
                      }}
                    >
                      -
                    </span>
                  )}
                  <figcaption className="text-[0.825rem] opacity-50">
                    <h6>{data._id?.slice(-6)}</h6>
                    <h6>{timestampToDateTime(data?.date)}</h6>
                  </figcaption>
                </figure>
              </section>
              <section>
                <h3 className="text-base">
                  Bill value:
                  <span className="ml-1 font-semibold">
                    {data?.order_id?.billValue?.toLocaleString("en-IN") || 0}
                  </span>
                </h3>
              </section>
            </section>
            <section className="flex justify-between py-2">
              <article>
                <h1 className="flex items-center mb-2 space-x-4 text-base">
                  <GiTwoCoins
                    className={cn(
                      data?.status === "PLUS"
                        ? "text-green-500"
                        : "text-red-500",
                    )}
                    size={36}
                  />{" "}
                  <span
                    className={cn(
                      "text-xl font-semibold",
                      data?.status === "PLUS"
                        ? "text-green-500"
                        : "text-red-500",
                    )}
                  >
                    {data?.rewards}{" "}
                    <span className="text-sm">
                      {data?.status === "PLUS" ? "Earned" : "Used"}
                    </span>
                  </span>
                </h1>
              </article>
              <article className="text-base">
                {data?.waiterName ? (
                  <h1>
                    Captain :{" "}
                    <span className="font-semibold">{data?.waiterName}</span>
                  </h1>
                ) : null}
              </article>
            </section>
          </section>
        ))
      ) : (
        <div className="absolute text-2xl text-center -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
          No Data Found
        </div>
      )}
    </section>
  );
};

const CoinzUsage = memo(MemoCoinzUsage);
export default CoinzUsage;
