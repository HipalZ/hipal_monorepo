import { memo } from "react";

const MemoPlusButton = () => (
    <span className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl'>+</span>
);

const PlusButton = memo(MemoPlusButton)
export default PlusButton;