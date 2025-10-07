import React, { memo, useEffect } from "react";
import { useOrderStore } from "../../store/useOrder";

const ErrorPayment = () => {
  const setOrderStatus =useOrderStore((s) => s.setOrderStatus);

  useEffect(() => {
    setTimeout(() => {
      setOrderStatus("");
    }, 3000);
    return () => clearTimeout();
  }, [setOrderStatus]);

  return (
    <section className="relative h-[60vh] overflow-hidden">
      <center className="top-[60%] text-[5rem] left-[50%] -translate-x-[50%] -translate-y-[50%] absolute z-2">
        😭
      </center>
      <center className="w-[200%] h-[200%] -top-[80%] left-0 -translate-x-[25%] -translate-y-[37%] bg-base-300 rounded-full absolute z-0" />
      <center className="mt-[45vh] text-xl font-bold mb-2 text-[#F03838]">
        Payment failed
      </center>
      <center className="mx-6 text-sm opacity-50">Please try again!</center>
    </section>
  );
};

const MemoErrorPayment = memo(ErrorPayment);
export default MemoErrorPayment;
