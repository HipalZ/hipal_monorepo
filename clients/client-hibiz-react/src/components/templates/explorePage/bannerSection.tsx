import { type CSSProperties, memo } from "react";
import SubHeader from "@/components/atom/subHeader";
import PlusButton from "@/components/atom/plusButton";
import { useExploreStore } from "@/components/store/useExploreStore";
import { BannerType } from "./explorePageStore";
import type { IBannerPayload, TextAlign } from "@/components/types/businessData";

interface IProps {
    handleNavigation: () => void
}
const MemoBannerSection = (props: IProps) => {
    const { handleNavigation } = props;
    const banners = useExploreStore((s) => s.banners)
    return (
        <section className='mb-4'>
            <SubHeader text='Banners' />
            <article className='flex items-center p-2 overflow-x-auto bg-white rounded-lg flex-nowrap'>
                {banners.length > 0 ?
                    <section className="flex items-center w-full h-[10rem] lg:h-[12rem] space-x-2 lg:space-x-4">
                        {banners.map((banner: IBannerPayload) => {
                            const headingStyles: CSSProperties = {
                                color: banner?.headingColor, fontWeight: banner?.headingFontWeight, textAlign: banner?.headingAlign as TextAlign, scale:'0.75'
                            }
                            const paragraphStyles: CSSProperties = { color: banner?.paragraphColor, fontWeight: banner?.paragraphFontWeight, textAlign: banner?.paragraphAlign as TextAlign, scale:'0.5' }
                            const buttonStyles: CSSProperties = { color: banner?.buttonColor, border: `1px solid ${banner?.buttonColor}`, scale:'0.5' }
                            return (
                                <div key={banner._id}>
                                    {banner.bannerType === BannerType.BANNER_TYPE_1 && (
                                        <article style={{ backgroundColor: banner?.backgroundColor }} className='aspect-square border flex-1 rounded-xl h-[8.5rem] lg:h-[12rem]'>
                                            <h1 style={headingStyles} className='text-xs'>{banner.heading || 'heading'}</h1>
                                            <p style={paragraphStyles}>{banner.paragraph || 'Lorem Ipsum has been the industrys standard dummy text ever since the 1500s'}</p>
                                            <button style={buttonStyles} type="button" className='border border-black rounded-full border-1'>{banner?.callToAction ? banner?.callToAction : 'LINK'}</button>
                                        </article>
                                    )}
                                    {banner.bannerType === BannerType.BANNER_TYPE_2 && (
                                        <article style={{ backgroundImage: `url(${banner?.bannerImage})`}} className='aspect-square bg-cover flex-1 rounded-xl h-[8.5rem] lg:h-[12rem]'>
                                            <h1 style={headingStyles} className='text-xs'>{banner.heading || 'heading'}</h1>
                                            <p style={paragraphStyles}>{banner.paragraph || 'Lorem Ipsum has been the industrys standard dummy text ever since the 1500s'}</p>
                                            <button style={buttonStyles} type="button" className='border border-black rounded-full border-1'>{banner?.callToAction ? banner?.callToAction : 'LINK'}</button>
                                        </article>
                                    )}
                                    {banner.bannerType === BannerType.BANNER_TYPE_3 && (
                                        <section style={{ height:'8.5rem'}} className='flex flex-col justify-between flex-1 bg-white border aspect-square rounded-xl'>
                                            <figure className='h-1/2'>
                                                <img src={banner?.bannerImage} alt="banner" className='object-cover w-full h-full' />
                                            </figure>
                                            <article className='flex flex-col justify-between h-1/2'>
                                                <div>
                                                    <h1 style={headingStyles} className='text-xs'>{banner.heading || 'heading'}</h1>
                                                    <p style={paragraphStyles}>{banner.paragraph || 'Lorem Ipsum has been the industrys standard dummy text ever since the 1500s'}</p>
                                                </div>
                                                <button style={buttonStyles} type="button" className='border border-black rounded-full border-1'>{banner?.callToAction ? banner?.callToAction : 'LINK'}</button>
                                            </article>
                                        </section>
                                    )}
                                </div>
                            )
                        })}
                    </section>
                    : null}
                <div className='ml-2 aspect-square shrink-0 relative rounded-xl h-[8.5rem] lg:h-[12rem] border-dashed border-2 border-[#8C63FF]' onClick={handleNavigation}>
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