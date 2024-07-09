import { memo } from 'react'
import Header from '@/components/molecules/header';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import HiSiteMiddleImage from '@/assets/hisite/hisiteHeader.png'
import { hisiteServices } from '@/components/templates/businessForm/businessCtrlStore';
import { Link, useParams } from 'react-router-dom';

const RightButton = () =>{
    return(
        <button type="button" className='bg-white px-4 py-1 rounded-full'>
            Themes & Layout
        </button>
    )
}

const MemoHiSites = () => {
    const businessId = useParams()?.businessId || ''
    return (
        <main>
            <header className="pb-4 linear_gradient_background">
                <Header leftIcon={<FaArrowLeft />} rightButton={<RightButton/>} isIconBusinessShow={false}>
                    <img src={HiSiteMiddleImage} alt="HiSiteMiddleImage" loading="lazy"/>
                    <h1 className='text-2xl mb-2 mt-4 font-semibold'>Hi-sites</h1>
                    <p className='mx-16 text-[#7D7D7D]'>Manage Your business, dishes, offers, rewards and many more</p>
                </Header>
            </header>
            <section className='p-6 space-y-6'>
                {hisiteServices.map((service) => {
                    return (
                        <article key={service?._id} className='bg-white h-[7rem] rounded-2xl p-4'>
                            <header className='flex space-x-4 mb-6 items-center relative'>
                                <img src={service?.icon} alt={service?.icon} loading="lazy" />
                                <h1 className='text-2xl'>{service?.title}</h1>
                                <Link to={`/app/business/${businessId}/${service?.navigateTo}`} className="absolute right-2 top-2 -rotate-45"><FaArrowRight /></Link>
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