import { memo } from "react";
import dummyImage from '@/assets/hisite/placeholder.png';
import SubHeader from "@/components/atom/subHeader";
import PlusButton from "@/components/atom/plusButton";
import { useExploreStore } from "@/components/store/useExploreStore";

interface IProps{
    handleNavigation:()=>void
}
const MemoBannerSection = (props:IProps) => {
    const {handleNavigation} = props;
    const banners = useExploreStore((s)=>s.banners)
    return (
        <section className='mb-4'>
            <SubHeader text='Banners' />
            <article className='flex gap-3 p-6 overflow-x-auto bg-white flex-nowrap'>
                {banners.length>0 ? banners.map((banner) => {
                    return (
                        <div onKeyDown={handleNavigation} key={banner._id} className='shrink-0 relative rounded-xl h-[6.5rem] w-[10rem] border-dashed border-2 inline-block border-[#8C63FF]' onClick={handleNavigation}>
                            <label htmlFor={`bannerSection${banner._id}`} className='flex items-center justify-center w-full h-full overflow-hidden cursor-pointer rounded-xl'>
                                {banner?.bannerImage ? <img src={banner.bannerImage || dummyImage} alt="Dish" /> : <PlusButton />}
                            </label>
                        </div>
                    )
                }):null}
                <div onKeyDown={handleNavigation} className='shrink-0 relative rounded-xl h-[6.5rem] w-[6.5rem] border-dashed border-2 inline-block border-[#8C63FF]' onClick={handleNavigation}>
                    <label className='flex items-center justify-center w-full h-full overflow-hidden cursor-pointer rounded-xl'>
                        <PlusButton />
                    </label>
                </div>
            </article>
        </section>
    )
}

const BannerSection = memo(MemoBannerSection)
export default BannerSection