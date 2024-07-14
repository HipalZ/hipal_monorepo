import { memo } from "react";

const MemoRightButton = () => (
    <button type="button" style={{ background: "linear-gradient(259.68deg, #7F66FE 9.06%, #4D6FF9 104.24%)" }} className='px-4 py-1 rounded-full text-white'>
        Preview
    </button>
);

const RightButton = memo(MemoRightButton)
export default RightButton;