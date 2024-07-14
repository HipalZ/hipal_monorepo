import BottomButton from '@/components/atom/bottomButton'
import PlusButton from '@/components/atom/plusButton'
import SubHeader from '@/components/atom/subHeader'
import { useExploreStore } from '@/components/store/useExploreStore'
import { type FormEvent, memo, type ChangeEvent } from 'react'

export interface IProps {
    img: { banner: string, logo: string, footer:string }
    handleImageChange: (e: ChangeEvent<HTMLInputElement>) => void
    handleBizName?: (e: ChangeEvent<HTMLInputElement>) => void
    handleSaveExplorePage:(e:FormEvent<HTMLFormElement>)=>void;
}
const MemoExplorePageSection = (props: IProps) => {
    const bizInfo = useExploreStore((s)=>s.bizInfo)
    const { img, handleImageChange, handleBizName , handleSaveExplorePage} = props
    console.log('img',img)
    return (
        <main className='px-4 overflow-y-auto h-[75vh] pb-[10rem]'>
            <section className='mb-4'>
                &nbsp;
                <SubHeader text="Banner" />
                <article
                    className='relative rounded-xl h-[18rem] w-full border-dashed border-2 inline-block border-[#8C63FF]'>
                    <input onClick={() => document.getElementById('bannerInput')?.click()} type='file' id='bannerInput' style={{ display: 'none' }} onChange={handleImageChange} data-type="banner" />
                    <label htmlFor='bannerInput' className='flex items-center justify-center w-full h-full overflow-hidden cursor-pointer rounded-xl'>
                        {img.banner ? <img src={img.banner} alt="Banner" /> : <PlusButton />}
                    </label>
                </article>
            </section>
            &nbsp;
            <SubHeader text="Basic Info" />
            <section className='flex items-center justify-between mt-4 space-x-4'>
                <article className='shrink-0 relative rounded-xl h-[8rem] w-[8rem] border-dashed border-2 inline-block border-[#8C63FF]' >
                    <input onClick={() => document.getElementById('logoInput')?.click()} type='file' id='logoInput' style={{ display: 'none' }} onChange={handleImageChange} data-type="logo" />
                    <label htmlFor='logoInput' className='flex items-center justify-center w-full h-full overflow-hidden cursor-pointer rounded-xl'>
                        {img.logo ? <img src={img.logo} alt="Logo" /> : <PlusButton />}
                    </label>
                </article>
                <input value={bizInfo?.name} minLength={4} maxLength={30} type="text" className='w-full rounded-xl' placeholder='Business Name' onChange={handleBizName} />
            </section>
            &nbsp;
            <section>
                <SubHeader text="Footer Banner" />
                <article className='relative rounded-xl h-[18rem] w-full border-dashed border-2 inline-block border-[#8C63FF]' >
                    <input onClick={() => document.getElementById('footerInput')?.click()} type='file' id='footerInput' style={{ display: 'none' }} onChange={handleImageChange} data-type="footer" />
                    <label htmlFor='footerInput' className='flex items-center justify-center w-full h-full overflow-hidden cursor-pointer rounded-xl'>
                        {img.footer ? <img src={img.footer} alt="footer" /> : <PlusButton />}
                    </label>
                </article>
            </section>
            <BottomButton text='Save' onClick={handleSaveExplorePage}/>
        </main>
    )
}

const ExplorePageTopSection = memo(MemoExplorePageSection)
export default ExplorePageTopSection