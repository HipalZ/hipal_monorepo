import { usePaymentStore } from "@/components/store/usePaymentStore";
import { memo, useEffect } from "react";

interface IPaymentCard {
  offer: number;
  logo: string | undefined;
}

const MemoPaymentCard = (props: IPaymentCard) => {
  const { offer } = props;
  const { billValue } = usePaymentStore((s) => ({
    billValue: s.billValue,
  }));
  useEffect(() => {
    const starContainer = document.getElementById("star-container");
    if (starContainer) {
      for (let i = 0; i < 10; i++) {
        const star = document.createElement("div");
        star.className = "star";
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        starContainer.appendChild(star);
      }
    }
  }, []);
  return (
    <center className="relative h-full mx-4 text-xl text-black bg-white rounded-xl">
      <div id="star-container" className="absolute inset-0 overflow-hidden" />
      <h4 className="pt-2 text-sm font-semibold">You Pay</h4>
      {offer > 0 ? (
        <h4 className="mt-1 text-4xl font-bold">₹ {billValue - offer}</h4>
      ) : null}
      <h4
        className={`${offer > 0 ? "line-through" : "text-4xl font-bold"} pb-2`}
      >
        <span
          className={`${offer > 0 ? "line-through" : "text-3xl font-bold"}`}
        >
          ₹
        </span>{" "}
        {billValue}
      </h4>
    </center>
  );
};

const PaymentCard = memo(MemoPaymentCard);
export default PaymentCard;
