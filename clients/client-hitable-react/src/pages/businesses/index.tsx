import smartPhone from '@/assets//img/smartphone.png';
import bookmarkAfter from '@/assets/svg/bookmarkAfter.svg';
import bookmarkBefore from '@/assets/svg/bookmarkBefore.svg';
import ProfileHeader from '@/components/liteAlerts/profileHeader';
import useBusinessData from '@/components/store/useBusinessData';
import { useHiClientZ } from '@/components/store/useHiClientzData';
import { useLiteStore } from '@/components/store/useLiteStore';
import type { CustomRole } from '@/components/types/hiClientzData';
import { apiRpc } from '@hi/common';
import { memo } from 'react';
import { FiDownload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const BusinessesMemo = memo(() => {
  const captainData = useHiClientZ((s) => s.captainData);
  const setSelectedBiz = useHiClientZ((s) => s.setSelectedBiz);

  const navigate = useNavigate();

  const setTriggerSound = useLiteStore((s) => s.setTriggerSound);

  const getBusinessInfo = async (id: string) => {
    const res = await apiRpc.businesses.outletInfo[':businessId'].$get({
      param: {
        businessId: id,
      },
    });
    const loyaltyResponse = await apiRpc.businesses[':businessId'].loyalty.$get({
      param: {
        businessId: id,
      },
    });
    const response = (await res.json()).data;
    const loyalty = (await loyaltyResponse.json()).data;
    if (res.status === 200 || res.status === 201) {
      useBusinessData.getState().setOutletInfo(response);
      useBusinessData.getState().setExistingLoyalty(loyalty);
    }
  };

  const exploreBusiness = (biz: CustomRole) => {
    setSelectedBiz(biz);
    setTriggerSound(true);
    if (biz?.businessId?._id) {
      getBusinessInfo(biz.businessId._id);
    }
    navigate('/viewInBiz');
  };

  return (
    <main className="relative min-h-screen bg-gray-50 pb-8">
      <header className="sticky top-0 z-10 flex h-20 items-center justify-between bg-white px-5 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Hello, {captainData?.name?.split(' ')[0] || 'Captain'}!</h1> {/* Simplified greeting */}
        <ProfileHeader />
      </header>
      <article className="mx-5 mt-4 flex items-center gap-4 overflow-hidden rounded-xl p-4 shadow-lg" style={{ backgroundColor: '#4C4DDC' }}>
        <img src={smartPhone} alt="Smartphone Promotion" width={80} loading="lazy" className="flex-shrink-0" />
        <article className="flex-grow space-y-1 text-white">
          <h1 className="text-lg font-semibold leading-snug">Experience Better & Faster Service with our Android App</h1>
          <a
            href="https://assets.hipalz.com/hiclient-share-cart.apk"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-indigo-700 transition duration-200 hover:bg-gray-100 hover:shadow-md"
            aria-label="Download the Android Application"
          >
            <FiDownload size={16} /> <span>Download App</span>
          </a>
        </article>
      </article>
      {/* 🏢 Businesses List Section */}
      <section className="mx-5 mt-8">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Your Businesses</h2> {/* Changed to H2 for semantics, bolder style */}
        <div className={`grid gap-4 ${captainData?.customRole?.length ? 'lg:grid-cols-2' : ''}`}>
          {captainData?.customRole && captainData.customRole.length > 0 ? (
            captainData.customRole.map((biz) => (
              <div
                onClick={() => exploreBusiness(biz)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') exploreBusiness(biz);
                }}
                role="button" // Added ARIA role for accessibility
                tabIndex={0} // Made div focusable
                key={biz?.businessId?._id}
                className="flex transform cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-md transition duration-300 ease-in-out hover:scale-[1.01] hover:shadow-lg"
              >
                <article className="flex items-center space-x-4">
                  <img
                    src={biz?.businessId?.logo}
                    alt={`${biz?.businessId?.name} Logo`}
                    width={56}
                    height={56}
                    className="flex-shrink-0 rounded-full border-2 border-indigo-400 object-cover p-0.5" // More prominent logo
                  />
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-gray-800">{biz?.businessId?.name}</h3>
                    <p title={biz?.businessId?.address} className="mt-0.5 truncate text-sm font-normal text-gray-500">
                      {biz?.businessId?.address || 'Address not available'}
                    </p>
                  </div>
                </article>
                <div className="ml-4 flex-shrink-0">
                  <img
                    src={biz.bookMark ? bookmarkAfter : bookmarkBefore}
                    alt={biz.bookMark ? 'Bookmarked' : 'Not Bookmarked'}
                    width={16}
                    height={16}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-xl bg-white py-10 text-center text-gray-500 shadow-md">
              <p>😞 No Businesses Found. Please contact support if you believe this is an error.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
});

const Businesses = memo(BusinessesMemo);
export default Businesses;
