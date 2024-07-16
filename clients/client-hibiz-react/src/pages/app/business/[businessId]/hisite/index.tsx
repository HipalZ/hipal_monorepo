import { lazy, memo, startTransition, useCallback } from 'react'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import HiSiteMiddleImage from '@/assets/hisite/hisiteHeader.png'
import { hisiteServices } from '@/components/templates/businessForm/businessCtrlStore';
import { useNavigate, useParams } from 'react-router-dom';
const HisiteHeader = lazy(() => import('@/components/molecules/hisiteHeader'));

const RightButton = () =>{
    return(
        <button type="button" className='px-4 py-1 bg-white rounded-full'>
            Themes & Layout
        </button>
    )
}

const MemoHiSites = () => {
    const businessId = useParams()?.businessId || ''
    const navigate= useNavigate();
    const handleRoute = useCallback((navigateTo:string)=>{
        startTransition(()=>{
            navigate(`/app/business/${businessId}/${navigateTo}`)
        })
    },[businessId])
    const goBack = useCallback(()=>{
        startTransition(()=>{
            navigate(`/app/business/${businessId}`)
        })
    },[])
    return (
        <main>
            <header className="pb-4 linear_gradient_background">
                <HisiteHeader onBack={goBack} leftIcon={<FaArrowLeft />} rightButton={<RightButton/>} isIconBusinessShow={false}>
                    <img src={HiSiteMiddleImage} alt="HiSiteMiddleImage" loading="lazy"/>
                    <h1 className='mt-4 mb-2 text-2xl font-semibold'>Hi-sites</h1>
                    <p className='mx-16 text-[#7D7D7D]'>Manage Your business, dishes, offers, rewards and many more</p>
                </HisiteHeader>
            </header>
            <section className='p-6 space-y-6'>
                {hisiteServices.map((service) => {
                    return (
                        <article onClick={()=>handleRoute(service?.navigateTo)} key={service?._id} className='bg-white h-[7rem] rounded-2xl p-4'>
                            <header className='relative flex items-center mb-6 space-x-4'>
                                <img src={service?.icon} alt={service?.icon} loading="lazy" />
                                <h1 className='text-2xl'>{service?.title}</h1>
                                <div className="absolute -rotate-45 right-2 top-2"><FaArrowRight /></div>
                            </header>
                            <p>{service?.description}</p>
                        </article>
                    )
                })}
            </section>
        </main>
    )
}

const HiSites = memo(MemoHiSites)
export default HiSites 