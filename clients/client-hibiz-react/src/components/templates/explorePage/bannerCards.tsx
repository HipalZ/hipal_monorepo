import { memo } from 'react';
import { BannerType, type IBannerPayload } from './explorePageStore'

interface IBanner {
    banners:IBannerPayload[];
    handleEditBanner?:(banner:IBannerPayload)=>void;
    sizeInPx?:string;
}
const MemoBannerCards = (props:IBanner) => {
    const {banners, handleEditBanner,sizeInPx} = props
    return (
        <section className='md:grid md:grid-cols-2 lg:grid-cols-3'>
            {banners.map((banner:IBannerPayload) => {
                const headingStyles = {
                    color: banner?.headingColor, fontWeight: banner?.headingFontWeight, textAlign: banner?.headingAlign
                }
                const paragraphStyles = { color: banner?.paragraphColor, fontWeight: banner?.paragraphFontWeight, textAlign: banner?.paragraphAlign }
                const buttonStyles = { color: banner?.buttonColor, border: `1px solid ${banner?.buttonColor}` }
                return (
                    <div onClick={() => handleEditBanner(banner)} key={banner._id} >
                        {banner.bannerType === BannerType.BANNER_TYPE_1 && (
                            <article style={{ backgroundColor: banner?.backgroundColor, height: sizeInPx , width: sizeInPx }} className='p-4 py-6 mt-4 space-y-4 border rounded-2xl'>
                                <h1 style={headingStyles} className='text-xl'>{banner.heading || 'heading'}</h1>
                                <p style={paragraphStyles}>{banner.paragraph || 'Lorem Ipsum has been the industrys standard dummy text ever since the 1500s'}</p>
                                <button style={buttonStyles} type="button" className='px-4 py-2 border border-black rounded-full border-1'>{banner?.callToAction ? banner?.callToAction : 'LINK'}</button>
                            </article>
                        )}
                        {banner.bannerType === BannerType.BANNER_TYPE_2 && (
                            <article style={{ backgroundImage: `url(${banner?.bannerImage})`, height: sizeInPx , width: sizeInPx }} className='p-4 py-6 mt-4 space-y-10 bg-cover rounded-2xl'>
                                <h1 style={headingStyles} className='text-xl'>{banner.heading || 'heading'}</h1>
                                <p style={paragraphStyles} className='my-4'>{banner.paragraph || 'Lorem Ipsum has been the industrys standard dummy text ever since the 1500s'}</p>
                                <button style={buttonStyles} type="button" className='px-4 py-2 border border-black rounded-full border-1'>{banner?.callToAction ? banner?.callToAction : 'LINK'}</button>
                            </article>
                        )}
                        {banner.bannerType === BannerType.BANNER_TYPE_3 && (
                            <section className='flex items-center justify-between w-full py-6 mt-4 overflow-hidden bg-white rounded-2xl '>
                                <article style={{ height: sizeInPx , width: sizeInPx }} className='p-4 mt-4 '>
                                    <h1 style={headingStyles} className='text-xl'>{banner.heading || 'heading'}</h1>
                                    <p style={paragraphStyles} className='my-4'>{banner.paragraph || 'Lorem Ipsum has been the industrys standard dummy text ever since the 1500s'}</p>
                                    <button style={buttonStyles} type="button" className='px-4 py-2 border border-black rounded-full border-1'>{banner?.callToAction ? banner?.callToAction : 'LINK'}</button>
                                </article>
                                <figure>
                                    <img src={banner?.bannerImage} alt="banner" className='overflow-hidden' />
                                </figure>
                            </section>
                        )}
                    </div>
                )
            })}

        </section>
    )
}

const BannerCards = memo(MemoBannerCards)
export default BannerCards