import { timestampToDateTime } from "@/components/utils/helper";
import Online from "@/assets/online.png";
import { memo } from "react";
import type { Payment } from "@/components/types/businessData";

interface Props {
  data: Payment;
}
const MemoOnlineImgCard = (props: Props) => {
  const { data } = props;
  return (
    <>
      <section className="flex justify-between">
        <section className="mb-2">
          <figure className="flex items-center space-x-4">
            <img src={Online} alt="online" />
            <figcaption className="text-[0.825rem] opacity-50">
              <h6>{data._id?.slice(-6)}</h6>
              <h6>{timestampToDateTime(data?.date)}</h6>
            </figcaption>
          </figure>
        </section>
        <section>
          <h3
            style={{
              color: "#23B371",
            }}
            className="text-2xl"
          >
            ₹ {data?.total}
          </h3>
        </section>
      </section>
      <section className="flex justify-between py-2">
        <article>
          <h1 className="mb-2 text-base">
            Bill value :{" "}
            <span className="font-semibold">{data?.billValue}</span>
          </h1>
          {data?.reviewId && (
            <small className="text-base">
              Review :{" "}
              {[...Array(data?.reviewId?.reviewRating)].map((_, index) => (
                <span key={index.toString()} className="text-lg">
                  &#9733;
                </span>
              ))}
            </small>
          )}
        </article>
        <article className="text-base">
          {data?.waiterName ? (
            <h1>
              Captain :{" "}
              <span className="font-semibold">{data?.waiterName}</span>
            </h1>
          ) : null}
          {data?.tips ? (
            <h1>
              Tips : ₹ <span className="font-semibold">{data?.tips}</span>
            </h1>
          ) : null}
        </article>
      </section>
    </>
  );
};

const OnlineImgCard = memo(MemoOnlineImgCard);
export default OnlineImgCard;
