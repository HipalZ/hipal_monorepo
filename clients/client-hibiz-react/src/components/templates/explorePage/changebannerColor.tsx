import { memo } from "react"
import { colors } from "./explorePageStore"
import { IoMdColorPalette } from "react-icons/io"

type Color = {
    _id: string
    textColor: string
    bgColor: string
}
interface ChangeBannerColorProps {
    handleColorChange: (color: Color) => void

}
const MemoChangeBannerColor = (props:ChangeBannerColorProps) => {
    const { handleColorChange } = props

    return (
        <section className='mt-[30rem] grid grid-cols-3 place-items-center mx-6 gap-10'>
            {colors?.map((color) => {
                return (
                    <article key={color?._id} className='text-center'>
                        <h1 style={{
                            backgroundColor: color?.bgColor,
                            height: '4rem',
                            width: '4rem',
                            padding: '0.5rem',
                        }} className='rounded-2xl'>
                            <IoMdColorPalette color={color?.textColor} size={48} />
                        </h1>
                        <input type="radio" name="color" className='mt-2 text-black' onChange={() => handleColorChange(color)} />
                    </article>
                )
            })}
        </section>
    )
}

const ChangeBannerColor = memo(MemoChangeBannerColor)
export default ChangeBannerColor