import { memo } from "react"
import { CiTextAlignLeft } from "react-icons/ci"
import { MdFontDownload } from "react-icons/md"
import { TfiPaintBucket } from "react-icons/tfi"

interface IProps {
    element: string
    colorWheel:boolean
    setColorWheel: (value: boolean) => void
    onAlignmentChange: (element: string, alignment: string) => void
    onFontWeightChange: (element: string) => void
    onColorChange: (element: string, color: string) => void
    isColorPickerVisible: boolean
    setIsColorPickerVisible: (value: boolean) => void
}

const MemoStylingsIcons = ({ element,colorWheel, setColorWheel,onAlignmentChange, onFontWeightChange, onColorChange }:IProps) => {
    return (
        <aside className='flex mt-4 space-x-4'>
            <article onClick={() => onFontWeightChange(element)} className='px-3 py-2 border border-black on_active_bounce rounded-2xl border-1'>
                <span><MdFontDownload size={16} /></span>
            </article>
            <article onClick={() => onAlignmentChange(element, 'left')} className='px-3 py-2 border border-black on_active_bounce rounded-2xl border-1'>
                <span><CiTextAlignLeft size={16} /></span>
            </article>
            <article onClick={() => onAlignmentChange(element, 'center')} className='px-3 py-2 border border-black on_active_bounce rounded-2xl border-1'>
                <span><CiTextAlignLeft size={16} style={{ transform: 'rotate(90deg)' }} /></span>
            </article>
            <article onClick={() => onAlignmentChange(element, 'right')} className='px-3 py-2 border border-black on_active_bounce rounded-2xl border-1'>
                <span><CiTextAlignLeft size={16} style={{ transform: 'rotate(180deg)' }} /></span>
            </article>
            <article onClick={()=>setColorWheel(!colorWheel)} className='px-3 py-2 border border-black on_active_bounce rounded-2xl border-1'>
                <span><TfiPaintBucket size={16} /></span>
            </article>
            {colorWheel ? <input type="color" onChange={(e) => onColorChange(element, e.target.value)}/>: null}
        </aside>
    )
}
const StylingsIcons = memo(MemoStylingsIcons)
export default StylingsIcons