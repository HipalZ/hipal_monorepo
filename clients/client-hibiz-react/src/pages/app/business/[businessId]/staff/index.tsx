import Staff from "@/components/templates/staff";
import { memo } from "react";

const StaffPage = () => {
  return <Staff />;
};

const MemoStaffPage = memo(StaffPage);

export default MemoStaffPage;
