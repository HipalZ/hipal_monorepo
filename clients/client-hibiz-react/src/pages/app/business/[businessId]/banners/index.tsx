import { lazy, memo, startTransition, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBannerStore } from '@/components/store/useBannerStore';
import { useExploreStore } from '@/components/store/useExploreStore';
import { useUserToken } from '@/components/store/useUserToken';
import { BannerType } from '@/components/templates/explorePage/explorePageStore';
import type { Banner } from '@/components/types/businessData';
import { apiRpc } from '@hi/common';
import { useQuery } from '@tanstack/react-query';

// Lazy load components
const BannerCards = lazy(() => import('@/components/templates/explorePage/bannerCards'));
const BottomButton = lazy(() => import('@/components/atom/bottomButton'));
const MiddlePopUp = lazy(() => import('@/components/atom/middlePopUp'));
const Paragraph = lazy(() => import('@/components/atom/paragraph'));
const SubHeader = lazy(() => import('@/components/atom/subHeader'));
const Header = lazy(() => import('@/components/molecules/header'));


const MemoBanners = () => {
    const navigate = useNavigate();
    const banners = useExploreStore((s) => s.banners)
    const setBanners = useExploreStore((s) => s.setBanners)
    const businessId = useParams()?.businessId
    const { accessToken, refreshToken } = useUserToken(s => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken
    }))
    const { setSelectedBanner } = useBannerStore((s) => ({
        setSelectedBanner: s.setSelectedBanner
    }))
    const { addSpotlight, setAddSpotlight, setSelectedNewBanner, setSelectedBannerType } = useBannerStore((s) => ({
        selectedNewBanner: s.selectedNewBanner,
        setSelectedNewBanner: s.setSelectedNewBanner,
        addSpotlight: s.addSpotlight,
        setAddSpotlight: s.setAddSpotlight,
        setSelectedBannerType: s.setSelectedBannerType
    }))
    const config = {
        x_access_token: accessToken,
        x_refresh_token: refreshToken
    }
    const handleNewSpotlight = () => {
        setAddSpotlight(true)
        setSelectedBannerType(BannerType.BANNER_TYPE_0)
    }

    const handleNewBanner = () => {
        startTransition(() => {
            navigate(`/app/business/${businessId}/banners/new`)
        })
        setSelectedNewBanner(true)
        setAddSpotlight(false)
    }

    const handleEditBanner = (banner: Banner) => {
        setSelectedBanner(banner)
        startTransition(() => {
            navigate(`/app/business/${businessId}/banners/${banner?._id}`)
        })
    }

    const handleNavigate = () => {
        startTransition(() => {
            navigate(`/app/business/${businessId}/explorePage`)
        })
    }

    useQuery({
        queryKey: ['banners', businessId],
        queryFn: async () => {
            const res = await apiRpc.settings.banners[':businessId'].$get({
                header: config,
                param: {
                    businessId: businessId
                },
            });
            const response = (await res.json()).data
            setBanners(response)
            return response;
        },
    })

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <main className='h-screen'>
                <Header title='Banners' isIconBusinessShow={false} onBack={handleNavigate} />
                &nbsp;
                <section className='mx-6'>
                    <SubHeader text='Spotlights' color='#000' />
                    <Paragraph text='Create amazing new design and promote it with your customers' />
                    &nbsp;
                    <article>
                        <h1>Banners</h1>
                    </article>
                    <BannerCards banners={banners}  handleEditBanner={handleEditBanner} sizeInPx='268px'/>
                    <BottomButton text='Add new Spotlight' onClick={handleNewSpotlight} />
                </section>
                {addSpotlight ? <MiddlePopUp show={addSpotlight} onClose={() => { setAddSpotlight(false) }} onlyPopUp={false}>
                    <section className='p-4'>
                        <h1 className='my-4 text-2xl font-semibold'>Select One</h1>
                        <p className='my-4 text-xl'>Create New Banner or continue with drafts</p>
                        <article className='flex gap-10 my-4'>
                            <button onClick={handleNewBanner} type='button' className='on_active_bounce h-16 bg-[#F1EAFA] text-black rounded-2xl w-full p-2'>New Banner</button>
                            <button type='button' disabled={true} className='bg-[#F1EAFA] opacity-50 text-black rounded-2xl w-full p-2'>From Drafts</button>
                        </article>
                    </section>
                </MiddlePopUp>
                    : null}
            </main>
        </Suspense>
    )
}

const Banners = memo(MemoBanners)
export default Banners