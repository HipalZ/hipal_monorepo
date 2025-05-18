import { memo } from "react";
import { useLiteStore } from "../store/useLiteStore";
import TableSearch from "./tableSearch";
import PaymentFilter from "./paymentFilter";
import { NavItemTypesEnum } from "../types/hiClientzData";

const MemoUnivercelFilter = () => {
  const { selectedNavItem } = useLiteStore();

  return (
    <div>
      {selectedNavItem === NavItemTypesEnum.TABLES && <TableSearch />}
      {selectedNavItem === NavItemTypesEnum.ALERTS && <PaymentFilter />}
    </div>
  );
};

const UnivercelFilter = memo(MemoUnivercelFilter);
export default UnivercelFilter;
