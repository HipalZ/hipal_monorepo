import { memo, startTransition, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import promoAvatar from '@/assets/img/promoCardAvatar.png'
import logo from "@/assets/img/dummyLogo.png";
import bookmarkBefore from '@/assets/svg/bookmarkBefore.svg'
import bookmarkAfter from '@/assets/svg/bookmarkAfter.svg'
import { FooterSection } from '@/components/atoms/footerSection';
import { useHiClientZ } from '@/components/store/useHiClientzData';
import ProfileHeader from '@/components/templates/liteAlerts/profileHeader';
import { CustomRole } from '@/components/types/hiClientzData';

const Businesses = memo(() => {
    const initialBusinesses = [
        { _id: '1', name: 'White Mango', location: 'Defense Colony, Secunderabad', logo: logo, default: true },
        { _id: '2', name: 'White Mango', location: 'Defense Colony, Secunderabad', logo: logo, default: false },
        { _id: '3', name: 'White Mango', location: 'Defense Colony, Secunderabad', logo: logo, default: false },
        { _id: '4', name: 'White Mango', location: 'Defense Colony, Secunderabad', logo: logo, default: false },
    ];
    const [businesses, setBusinesses] = useState(initialBusinesses);
    // store
    const { captainData,setSelectedBiz } = useHiClientZ();
    const navigate = useNavigate();
    const { businessId } = useParams<{ businessId: string }>();
    const location = useLocation();
    const inBusinesses = location.pathname.includes('businesses')
    const handleUpdateDefault = (e, id: string) => {
        e.stopPropagation();
        const updatedBusinesses = businesses.map(biz => {
            if (biz._id === id) {
                return { ...biz, default: true };
            } else {
                return { ...biz, default: false };
            }
        });
        setBusinesses(updatedBusinesses);
    };

    const exploreBusiness = (biz:CustomRole) => {
        setSelectedBiz(biz)
        startTransition(() => {
            navigate(`/l/${businessId}/viewInBiz`)
        })
    }

    return (
        <main className="h-screen">
            <header className="h-[5rem] flex items-center justify-between px-6 py-4">
                <h1 className="text-xl font-medium">Hi, {captainData?.name}</h1>
                <ProfileHeader position={inBusinesses}/>
            </header>
            <article style={{ backgroundColor: '#4C4DDC' }} className="flex items-center h-[6rem] w-full overflow-hidden">
                <img src={promoAvatar} alt="promoAvatar" width={70} loading="lazy"/>
                <h1 className="text-right text-white text-base mr-4">Welcoming to an amazing journey of connecting with your clients like never before</h1>
            </article>
            <br />
            <h1 className="text-2xl text-black mx-5 mb-4">You are added to</h1>
            <section className="mx-5 lg:grid lg:grid-cols-2">
                {captainData?.customRole?.map((biz) => {
                    return (
                        <section onClick={()=>exploreBusiness(biz)} key={biz?.businessId?._id} className="my-4 rounded-2xl h-[6rem] flex items-center justify-between p-4" style={{ backgroundColor: '#f2f2f2' }}>
                            <article className="flex items-center">
                                <img src={biz?.businessId?.logo} alt="logo" width={65} height={65} className="border border-1 border-black rounded-full" />
                                <div className="ml-4">
                                    <h1 className="text-xl font-medium">{biz?.businessId?.businessName}</h1>
                                    <p className="text-base font-medium">{biz?.businessId?.address}</p>
                                </div>
                            </article>
                            <div>
                                <img onClick={(e) => handleUpdateDefault(e, biz._id)} src={biz.bookMark ? bookmarkAfter : bookmarkBefore} alt="bookmark" />
                            </div>
                        </section>
                    )
                })}
            </section>
            <FooterSection />
        </main>
    )
});

export default Businesses;