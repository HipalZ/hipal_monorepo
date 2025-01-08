import { memo } from "react";
import { useLiteStore } from "../store/useLiteStore";
import TableSearch from "./tableSearch";

const MemoUnivercelFilter = () => {
  const { selectedNavItem } = useLiteStore();
  return <div>{selectedNavItem === "Tables" && <TableSearch />}</div>;
};

const UnivercelFilter = memo(MemoUnivercelFilter);
export default UnivercelFilter;
