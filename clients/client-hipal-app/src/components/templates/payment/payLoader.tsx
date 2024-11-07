import React, { memo } from "react";
import hipalLoader from "@/assets/hipalLoader.png";
import Image from "next/image";

const PayLoader = ({ selectedMode }) => {
  return (
    <section className="relative h-[70vh] overflow-hidden">
      <article className="hipal_loader">
        <Image width={210} height={210} src={hipalLoader} alt="loader" />
      </article>
      <center className="w-[200%] h-[200%] -top-[80%] left-0 -translate-x-[25%] -translate-y-[37%] bg-base-300 rounded-full absolute z-0" />
      <center className="mt-[58vh] text-xl mb-2 text-primary">
        In progress
      </center>
      <center className="mx-6 text-sm opacity-50">
        We are processing your payment{" "}
        {`${selectedMode === "ONLINE" ? "by Razor pay" : ""}`} please wait.
      </center>
    </section>
  );
};

const MemoPayLoader = memo(PayLoader);
export default MemoPayLoader;
