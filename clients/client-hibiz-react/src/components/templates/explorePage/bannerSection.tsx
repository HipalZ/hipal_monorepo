import { memo } from "react";
import SubHeader from "@/components/atom/subHeader";
import PlusButton from "@/components/atom/plusButton";
import { useExploreStore } from "@/components/store/useExploreStore";
import { BannerType, type IBannerPayload } from "./explorePageStore";

interface IProps {
    handleNavigation: () => void
}
const MemoBannerSection = (props: IProps) => {
    const { handleNavigation } = props;
    const banners = useExploreStore((s) => s.banners)
    return (
        <section className='mb-4'>
            <SubHeader text='Banners' />
            <article className='flex overflow-x-auto bg-white flex-nowrap'>
                {banners.length > 0 ?
                    <section className="flex justify h-36">
                        {banners.map((banner: IBannerPayload) => {
                            const headingStyles = {
                                color: banner?.headingColor, fontWeight: banner?.headingFontWeight, textAlign: banner?.headingAlign
                            }
                            const paragraphStyles = { color: banner?.paragraphColor, fontWeight: banner?.paragraphFontWeight, textAlign: banner?.paragraphAlign }
                            const buttonStyles = { color: banner?.buttonColor, border: `1px solid ${banner?.buttonColor}` }
                            return (
                                <div key={banner._id} style={{ transform: 'scale(0.45)', transformOrigin: 'top left', width: '268px', height: '268px' }}>
                                    {banner.bannerType === BannerType.BANNER_TYPE_1 && (
                                        <article style={{ backgroundColor: banner?.backgroundColor, height: '100%', width: '100%' }} className='p-4 py-6 space-y-4 border shrink-0 rounded-2xl'>
                                            <h1 style={headingStyles} className='text-xs'>{banner.heading || 'heading'}</h1>
                                            <p style={paragraphStyles}>{banner.paragraph || 'Lorem Ipsum has been the industrys standard dummy text ever since the 1500s'}</p>
                                            <button style={buttonStyles} type="button" className='px-4 py-2 border border-black rounded-full border-1'>{banner?.callToAction ? banner?.callToAction : 'LINK'}</button>
                                        </article>
                                    )}
                                    {banner.bannerType === BannerType.BANNER_TYPE_2 && (
                                        <article style={{ backgroundImage: `url(${banner?.bannerImage})`, height: '100%', width: '100%' }} className='p-4 py-6 space-y-10 bg-cover shrink-0 rounded-2xl'>
                                            <h1 style={headingStyles} className='text-xs'>{banner.heading || 'heading'}</h1>
                                            <p style={paragraphStyles} className='my-4'>{banner.paragraph || 'Lorem Ipsum has been the industrys standard dummy text ever since the 1500s'}</p>
                                            <button style={buttonStyles} type="button" className='px-4 py-2 border border-black rounded-full border-1'>{banner?.callToAction ? banner?.callToAction : 'LINK'}</button>
                                        </article>
                                    )}
                                    {banner.bannerType === BannerType.BANNER_TYPE_3 && (
                                        <section style={{ height: '100%', width: '100%' }} className='flex flex-col justify-between bg-white border shrink-0 rounded-2xl'>
                                            <figure className='h-1/2'>
                                                <img src={banner?.bannerImage} alt="banner" className='object-cover w-full h-full' />
                                            </figure>
                                            <article className='flex flex-col justify-between p-4 h-1/2'>
                                                <div>
                                                    <h1 style={headingStyles} className='text-xs'>{banner.heading || 'heading'}</h1>
                                                    <p style={paragraphStyles} className='my-4'>{banner.paragraph || 'Lorem Ipsum has been the industrys standard dummy text ever since the 1500s'}</p>
                                                </div>
                                                <button style={buttonStyles} type="button" className='px-4 py-2 border border-black rounded-full border-1'>{banner?.callToAction ? banner?.callToAction : 'LINK'}</button>
                                            </article>
                                        </section>
                                    )}
                                </div>
                            )
                        })}
                    </section>
                    : null}
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