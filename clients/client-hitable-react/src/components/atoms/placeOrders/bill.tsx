import { useOrderStore } from "@/components/store/useOrderData";
import { memo, useState } from "react";
import BillWarning from "./billWarning";
import GetBill from "./getBill";
import TransferWarning from "./transferWarning";

const MemoBill = () => {
  const { paymentSteps, selectedTable } = useOrderStore();

  // local state to track transfer confirmation
  const [transferConfirmed, setTransferConfirmed] = useState(false);

  // 1) If isTransfer === true and not yet confirmed, show TransferWarning
  if (selectedTable?.isTransfer && !transferConfirmed) {
    return <TransferWarning onConfirm={() => setTransferConfirmed(true)} />;
  }

  return (
    <div>
      {paymentSteps === 0 && <BillWarning />}
      {paymentSteps === 1 && <GetBill />}
    </div>
  );
};

const Bill = memo(MemoBill);
export default Bill;
