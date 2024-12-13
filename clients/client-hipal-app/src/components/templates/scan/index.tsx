"use client";

import { memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Scanner, type IDetectedBarcode } from "@yudiel/react-qr-scanner";
import Image from "next/image";
import HipalLogo from "@/assets/img/HipalZ_logo_title.png";
import poweredBy from "@/assets/img/powered_hipalz.png";

function Scan() {
  const router = useRouter();

  const gotoExplore = () => {
    router.back();
  };

  const onDecode = useCallback(
    (detectedCodes: IDetectedBarcode[]) => {
      if (!detectedCodes || detectedCodes.length === 0) {
        return;
      }
      const result = detectedCodes[0].rawValue;
      console.log("QR Code detected:", result);
      router.push(result);
    },
    [router],
  );

  const onError = useCallback((error: unknown) => {
    console.error("QR Scanner Error:", error);
  }, []);

  return (
    <main className="bg-[#fbfbfb] h-screen">
      <div className="pl-5 flex justify-between pt-2.5 pr-8">
        <div>
          <Image src={HipalLogo} alt="HipalLogo" loading="lazy" />
        </div>
        <div
          onKeyDown={gotoExplore}
          onClick={gotoExplore}
          className="text-[#393939] text-xl"
        >
          <p>Skip</p>
        </div>
      </div>

      <div className="px-8 mt-20 text-center">
        <div className="w-full">
          <Scanner
            onScan={onDecode}
            onError={onError}
            constraints={{ facingMode: "environment" }}
            styles={{
              container: { width: "100%", margin: "0 auto" },
              video: { borderRadius: "15px" },
            }}
          />
        </div>
        <p className="mt-6 text-sm font-normal opacity-90">
          Scan the QR on the table &amp; start ordering
        </p>
      </div>

      <center className="fixed bottom-0 flex justify-center bg-black w-full max-w-[30rem] py-3">
        <figure>
          <Image src={poweredBy} alt="HiLogo" loading="lazy" />
        </figure>
      </center>
    </main>
  );
}

export default memo(Scan);
