import { memo } from "react";
import GetBill from "./getBill";

const MemoBill = () => {
  return (
    <div>
      <GetBill />
    </div>
  );
};

const Bill = memo(MemoBill);
export default Bill;
