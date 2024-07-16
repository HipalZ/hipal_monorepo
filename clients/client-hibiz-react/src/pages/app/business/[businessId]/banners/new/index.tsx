import { lazy, memo, startTransition, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBannerStore } from '@/components/store/useBannerStore';
import { BannerType, bannerTypes } from '@/components/templates/explorePage/explorePageStore';
import BannerDummy from '@/assets/hisite/bannerDummy.jpg';
import layout3 from '@/assets/hisite/layout3.jpg';

// Lazy load components
const HisiteHeader = lazy(() => import('@/components/molecules/hisiteHeader'));
const CreateBanner = lazy(() => import('@/components/templates/explorePage/createBanner'));


const MemoNewBanner = () => {
    const navigate = useNavigate();
    const businessId = useParams()?.businessId;
    const { setSelectedBannerType, selectedBannerType } = useBannerStore((s) => ({
        setSelectedBannerType: s.setSelectedBannerType,
        selectedBannerType: s.selectedBannerType,
    }));

    const handleBannerType = (id: string) => {
        setSelectedBannerType(id);
    };

    const handleBack = () => {
        startTransition(() => {
            navigate(`/app/business/${businessId}/banners`)
        })
        setSelectedBannerType(BannerType.BANNER_TYPE_0);
    }

    return (
        <Suspense fallback={<div>Loading ...</div>}>
            {selectedBannerType === BannerType.BANNER_TYPE_0 ? (
                <main className='relative h-screen'>
                    <article onClick={handleBack} className='fixed top-0 w-full bg-white shadow-lg'>
                        <HisiteHeader onBack={handleBack} title='Choose Banner Type' isIconBusinessShow={false} />
                    </article>
                    <section className='flex flex-col justify-center items-center m-6 pb-[5rem] mt-24 md:grid md:grid-cols-2 lg:grid-cols-3'>
                        {bannerTypes.map((banner) => (
                            <div key={banner._id}>
                                <input onClick={() => handleBannerType(banner._id)} type="radio" id={`banner-${banner._id}`} name="banner" />
                                <label htmlFor={`banner-${banner._id}`} className='ml-2 text-[#807C83]'>{banner.title}</label>
                                {banner.bannerType === BannerType.BANNER_TYPE_1 && (
                                    <article className='bg-white mt-4 p-4 rounded-2xl h-[16rem] aspect-square flex flex-col justify-between'>
                                        <h1 className='text-sm'>Heading</h1>
                                        <p className='text-xs'>{banner.description}</p>
                                        <button type="button" className='w-full px-4 py-1 text-xs border border-black rounded-full border-1'>Link</button>
                                    </article>
                                )}
                                {banner.bannerType === BannerType.BANNER_TYPE_2 && (
                                    <article style={{ backgroundImage: `url(${BannerDummy})` }} className='h-[16rem] aspect-square flex flex-col justify-end bg-cover mt-4 p-4 rounded-2xl'>
                                        <h1 className='text-sm'>Heading</h1>
                                        <div>
                                            <p className='text-xs'>{banner.description}</p>
                                            {/* <button type="button" className='w-full px-4 py-1 text-xs border border-black rounded-full border-1'>Link</button> */}
                                        </div>
                                    </article>
                                )}
                                {banner.bannerType === BannerType.BANNER_TYPE_3 && (
                                    <section className='relative h-[16rem] aspect-square grid mt-4 overflow-hidden bg-white border rounded-2xl border-1'>
                                    <div className='row-span-3'>
                                      <img src={layout3} alt="BannerDummy" className='w-full h-full bg-cover' />
                                    </div>
                                    <section className='absolute bottom-0 flex items-center justify-between w-full px-2 '>
                                      <article className='w-full p-2 mt-1 mb-2 bg-white rounded'>
                                        <h1 className='text-sm'>Heading</h1>
                                        <p className='my-1 text-xs'>{banner.description}</p>
                                        <button type="button" className='w-full px-4 py-1 text-xs border border-black rounded-full border-1'>Link</button>
                                      </article>
                                    </section>
                                  </section>
                                )}
                                <br /><br />
                            </div>
                        ))}
                    </section>
                </main>
            ) : (
                <CreateBanner />
            )}
        </Suspense>
    );
};


const NewBanner = memo(MemoNewBanner);
export default NewBanner;
