import { useOrderStore } from "@/components/store/useOrderData";
import { memo, useCallback, useState } from "react";
import BillWarning from "./billWarning";
import GetBill from "./getBill";
import TransferWarning from "./transferWarning";
import CommonBottomButton from "../bottomButton";
import { useScreenSize } from "@/hooks/useScreenSize";

const MemoBill = () => {
  const screenSize = useScreenSize();

  const { paymentSteps, selectedTable, setOpenOrderModal } = useOrderStore();

  // local state to track transfer confirmation
  const [transferConfirmed, setTransferConfirmed] = useState(false);

  // 1) If isTransfer === true and not yet confirmed, show TransferWarning
  if (selectedTable?.isTransfer && !transferConfirmed) {
    return <TransferWarning onConfirm={() => setTransferConfirmed(true)} />;
  }

  const closeOrderModalHandler = useCallback(() => {
    setOpenOrderModal(false);
  }, [setOpenOrderModal]);

  return (
    <div>
      {paymentSteps === 0 && <BillWarning />}
      {paymentSteps === 1 && <GetBill />}
      <CommonBottomButton
        fixed={true}
        maxWidth={screenSize === "xs" ? "30rem" : "48rem"}
        backgroundColor={screenSize === "xs" ? "" : "white"}
        buttons={[
          {
            text: "Back",
            onClick: closeOrderModalHandler,
            className: "rounded-md w-full",
          },
        ]}
      />
    </div>
  );
};

const Bill = memo(MemoBill);
export default Bill;
