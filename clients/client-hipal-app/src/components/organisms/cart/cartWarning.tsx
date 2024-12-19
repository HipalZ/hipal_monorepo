import Link from "next/link";
import { motion } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";
import useTableData from "@/components/store/useTableData";
import { useParams } from "next/navigation";
import { memo } from "react";

const MemoCartWarning = () => {
  const customLink = useParams()?.businessId as string;
  const tableName = useTableData((state) => state.tableName);
  return (
    <>
      {!tableName && (
        <Link href={`/${customLink}/scan`}>
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed left-0 right-0 w-11/12 max-w-lg p-4 mx-auto rounded-lg shadow-lg bg-[#000000] bottom-6"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-center space-x-3">
              <FaExclamationTriangle
                className="w-12 h-12 text-[#ffffff]"
                aria-hidden="true"
              />
              <p className="text-sm font-medium text-[#ffffff]">
                Table Name is Missing. Please scan the Table QR to share your
                cart with the Captain.
                <span className="ml-1">Click here to scan the table..</span>
              </p>
            </div>
          </motion.section>
        </Link>
      )}
    </>
  );
};

const CartWarning = memo(MemoCartWarning);

export default CartWarning;
