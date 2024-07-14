import { lazy, memo, startTransition, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBannerStore } from '@/components/store/useBannerStore';
import { BannerType, bannerTypes } from '@/components/templates/explorePage/explorePageStore';
import BannerDummy from '@/assets/hisite/bannerDummy.jpg';
import layout3 from '@/assets/hisite/layout3.jpg';

// Lazy load components
const Header = lazy(() => import('@/components/molecules/header'));
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
                    <article onKeyDown={handleBack} onClick={handleBack} className='fixed top-0 w-full bg-white shadow-lg'>
                        <Header onBack={handleBack} title='Choose Banner Type' isIconBusinessShow={false} />
                    </article>
                    <section className='m-6 pb-[5rem] mt-24'>
                        {bannerTypes.map((banner) => (
                            <div key={banner._id}>
                                <input onClick={() => handleBannerType(banner._id)} type="radio" id={`banner-${banner._id}`} name="banner" />
                                <label htmlFor={`banner-${banner._id}`} className='ml-2 text-[#807C83]'>{banner.title}</label>
                                {banner.bannerType === BannerType.BANNER_TYPE_1 && (
                                    <article className='bg-white mt-4 p-4 rounded-2xl h-[16rem] space-y-10 py-6'>
                                        <h1 className='text-xl'>Heading</h1>
                                        <p>{banner.description}</p>
                                        <button type="button" className='px-4 py-2 border border-black rounded-full border-1'>Link</button>
                                    </article>
                                )}
                                {banner.bannerType === BannerType.BANNER_TYPE_2 && (
                                    <article style={{ backgroundImage: `url(${BannerDummy})` }} className='h-[16rem] space-y-10 py-6 bg-cover mt-4 p-4 rounded-2xl'>
                                        <h1 className='text-xl'>Heading</h1>
                                        <p className='my-4'>{banner.description}</p>
                                        <button type="button" className='px-4 py-2 border border-black rounded-full border-1'>Link</button>
                                    </article>
                                )}
                                {banner.bannerType === BannerType.BANNER_TYPE_3 && (
                                    <section className='mt-4 flex justify-between items-center w-full h-[16rem] py-6 overflow-hidden bg-white rounded-2xl '>
                                        <article className='mt-4 p-4 h-[14.5rem]'>
                                            <h1 className='text-xl'>Heading</h1>
                                            <p className='my-4'>{banner.description}</p>
                                            <button type="button" className='px-4 py-2 border border-black rounded-full border-1'>Link</button>
                                        </article>
                                        <figure>
                                            <img src={layout3} alt="BannerDummy" className='h-[16rem] overflow-hidden' />
                                        </figure>
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
