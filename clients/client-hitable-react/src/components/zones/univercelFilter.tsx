import { memo } from "react";
import { useLiteStore } from "../store/useLiteStore";
import TableSearch from "./tableSearch";
import PaymentFilter from "./paymentFilter";

const MemoUnivercelFilter = () => {
  const { selectedNavItem } = useLiteStore();

  return (
    <div>
      {selectedNavItem === "Tables" && <TableSearch />}
      {selectedNavItem === "payments" && (
        <PaymentFilter />
      )}
    </div>
  );
};

const UnivercelFilter = memo(MemoUnivercelFilter);
export default UnivercelFilter;
