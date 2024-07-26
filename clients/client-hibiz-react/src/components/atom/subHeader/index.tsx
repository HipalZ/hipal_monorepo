import { memo } from "react";

const MemoSubHeader = ({
  text,
  color = "#807C83",
}: { text: string; color?: string }) => (
  <h1 style={{ color: color }} className="mb-2 text-xl">
    {text}
  </h1>
);

const SubHeader = memo(MemoSubHeader);
export default SubHeader;
