import { memo } from "react"

const MemoParagraph = ({ text }: { text: string }) => (
    <p className='text-[#807C83]'>{text}</p>
)

const Paragraph = memo(MemoParagraph)
export default Paragraph