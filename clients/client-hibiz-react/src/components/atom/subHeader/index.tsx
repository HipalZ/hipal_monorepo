import { memo } from "react";

const MemoSubHeader = ({ text, color = '#807C83' }: { text: string, color?: string }) => (
    <h1 style={{ color: color }} className="text-xl mb-4">{text}</h1>
);

const SubHeader = memo(MemoSubHeader)
export default SubHeader;