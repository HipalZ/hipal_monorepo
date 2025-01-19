import { memo, useState } from "react";
import { motion } from "framer-motion";
import ConfettiHeader from "@/components/organisms/confettiHeader";
import Image from "next/image";
import CallTheCaptain from "@/components/organisms/cart/callTheCaptain";
import ScanTable from "@/assets/cart/scanTable.png";
import Scan from "@/components/templates/scan";

const MemoTableNameMissing = () => {
  const [showScan, setShowScan] = useState(false);

  const handleScanClick = () => {
    setShowScan(true);
  };

  if (showScan) {
    return <Scan hide />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative flex flex-col items-center justify-center h-screen p-6 bg-white"
    >
      <ConfettiHeader direction="top" />
      <Image
        src={ScanTable}
        alt="cart-friend"
        width={300}
        height={135}
        className="mt-8"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6 text-center"
      >
        <h3 className="mt-4 text-2xl font-bold text-gray-800 space-grotesk-700">
          Table number is missing!
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Please scan the QR placed on your table
        </p>
      </motion.div>

      <button
        type="button"
        onClick={handleScanClick}
        className="bg-[#008800] mb-4 w-full text-sm text-white px-4 py-3 rounded-md"
      >
        Scan
      </button>
      <CallTheCaptain />
    </motion.div>
  );
};

const TableNameMissing = memo(MemoTableNameMissing);
export default TableNameMissing;
