import PlusButton from '@/components/atom/plusButton'
import SubHeader from '@/components/atom/subHeader'
import { type ChangeEvent, memo } from 'react'

interface IFooterBanner{
    img:{logo:string, banner:string,footer:string}
    handleImageChange:(e:ChangeEvent<HTMLInputElement>)=>void
}
const MemoFooterBanner = (props:IFooterBanner) => {
    const { img, handleImageChange } = props
    return (
        <section>
            <SubHeader text="Footer Banner" />
            <article className='relative rounded-xl h-[18rem] w-full border-dashed border-2 inline-block border-[#8C63FF]' >
                <input onClick={() => document.getElementById('footerInput')?.click()} type='file' id='footerInput' style={{ display: 'none' }} onChange={handleImageChange} data-type="footer" />
                <label htmlFor='footerInput' className='w-full h-full flex justify-center items-center cursor-pointer overflow-hidden rounded-xl'>
                    {img.footer ? <img src={img.footer} alt="footer" /> : <PlusButton />}
                </label>
            </article>
        </section>
    )
}

const FooterBanner = memo(MemoFooterBanner)
export default FooterBanner