import promoAvatar from '@/assets/img/promoCardAvatar.png';
import bookmarkAfter from '@/assets/svg/bookmarkAfter.svg';
import bookmarkBefore from '@/assets/svg/bookmarkBefore.svg';
import FooterSectionMemo from '@/components/atoms/footerSection';
import { useHiClientZ } from '@/components/store/useHiClientzData';
import { useLiteStore } from '@/components/store/useLiteStore';
import ProfileHeader from '@/components/liteAlerts/profileHeader';
import { CustomRole } from '@/components/types/hiClientzData';
import { memo, startTransition } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const BusinessesMemo = memo(() => {
  // store
  const { captainData, setSelectedBiz } = useHiClientZ();
  const navigate = useNavigate();
  const { businessId } = useParams<{ businessId: string }>();
  const location = useLocation();
  const setTriggerSound = useLiteStore((s) => s.setTriggerSound);
  const inBusinesses = location.pathname.includes('businesses');
  const handleUpdateDefault = (e:Event) => {
    e.stopPropagation();
  };

  const exploreBusiness = (biz: CustomRole) => {
    setSelectedBiz(biz);
    setTriggerSound(true);
    startTransition(() => {
      navigate(`/l/${businessId}/viewInBiz`);
    });
  };

  return (
    <main className="h-screen">
      <header className="flex h-[5rem] items-center justify-between px-6 py-4">
        <h1 className="text-xl font-medium">Hi, {captainData?.name}</h1>
        <ProfileHeader position={inBusinesses} />
      </header>
      <article style={{ backgroundColor: '#4C4DDC' }} className="flex h-[6rem] w-full items-center overflow-hidden">
        <img src={promoAvatar} alt="promoAvatar" width={70} loading="lazy" />
        <h1 className="mr-4 text-right text-base text-white">Welcoming to an amazing journey of connecting with your clients like never before</h1>
      </article>
      <br />
      <h1 className="mx-5 mb-4 text-2xl text-black">You are added to</h1>
      <section className="mx-5 lg:grid lg:grid-cols-2">
        {captainData?.customRole?.map((biz) => {
          return (
            <section
              onClick={() => exploreBusiness(biz)}
              key={biz?.businessId?._id}
              className="my-4 flex h-[6rem] items-center justify-between rounded-2xl p-4"
              style={{ backgroundColor: '#f2f2f2' }}
            >
              <article className="flex items-center">
                <img src={biz?.businessId?.logo} alt="logo" width={65} height={65} className="border-1 rounded-full border border-black" />
                <div className="ml-4">
                  <h1 className="text-xl font-medium">{biz?.businessId?.businessName}</h1>
                  <p title={biz?.businessId?.address} className="w-48 truncate text-base font-medium">
                    {biz?.businessId?.address}
                  </p>
                </div>
              </article>
              <div>
                <img onClick={(e) => handleUpdateDefault(e, biz._id)} src={biz.bookMark ? bookmarkAfter : bookmarkBefore} alt="bookmark" />
              </div>
            </section>
          );
        })}
      </section>
      <FooterSectionMemo />
    </main>
  );
});

const Businesses = memo(BusinessesMemo);
export default Businesses;
