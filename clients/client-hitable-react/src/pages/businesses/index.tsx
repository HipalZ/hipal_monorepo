import bookmarkAfter from '@/assets/svg/bookmarkAfter.svg';
import bookmarkBefore from '@/assets/svg/bookmarkBefore.svg';
import ProfileHeader from '@/components/liteAlerts/profileHeader';
import useBusinessData from '@/components/store/useBusinessData';
import { useHiClientZ } from '@/components/store/useHiClientzData';
import { useLiteStore } from '@/components/store/useLiteStore';
import type { CustomRole } from '@/components/types/hiClientzData';
import { apiRpc } from '@hi/common';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';

const BusinessesMemo = memo(() => {
  const captainData = useHiClientZ((s) => s.captainData);
  const setSelectedBiz = useHiClientZ((s) => s.setSelectedBiz);

  const navigate = useNavigate();

  const setTriggerSound = useLiteStore((s) => s.setTriggerSound);
  const activeCustomRoles = captainData?.customRole?.filter((role) => role?.isDeleted !== true) ?? [];

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
      {/* 🏢 Businesses List Section */}
      <section className="mx-4 mt-8 sm:mx-6 lg:mx-8">
  <h2 className="mb-5 text-xl font-bold text-gray-800">Your Businesses</h2>

  <div className="grid gap-4 sm:gap-5 lg:gap-6">
    {/* Force single column on mobile, 2 columns on large screens */}
    <div className={`grid gap-4 ${activeCustomRoles.length ? 'grid-cols-1 lg:grid-cols-2' : ''}`}>
      {activeCustomRoles.length > 0 ? (
        activeCustomRoles.map((biz) => (
          <div
            key={biz?.businessId?._id}
            onClick={() => exploreBusiness(biz)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && exploreBusiness(biz)}
            role="button"
            tabIndex={0}
            className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <article className="flex flex-1 items-center space-x-4 overflow-hidden">
              <img
                src={biz?.businessId?.logo}
                alt={`${biz?.businessId?.name} Logo`}
                width={56}
                height={56}
                className="h-14 w-14 flex-shrink-0 rounded-full border-2 border-indigo-400 object-cover p-0.5"
              />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-semibold text-gray-800">
                  {biz?.businessId?.name}
                </h3>
                <p className="truncate text-sm text-gray-500">
                  {biz?.businessId?.address || 'Address not available'}
                </p>
              </div>
            </article>

            <img
              src={biz.bookMark ? bookmarkAfter : bookmarkBefore}
              alt={biz.bookMark ? 'Bookmarked' : 'Not Bookmarked'}
              width={20}
              height={20}
              className="ml-4 flex-shrink-0"
            />
          </div>
        ))
      ) : (
        <div className="col-span-full rounded-xl bg-white py-16 text-center text-gray-500 shadow-md">
          <p className="text-lg">No Businesses Found.<br />Please contact support if this seems incorrect.</p>
        </div>
      )}
    </div>
  </div>
</section>
    </main>
  );
});

const Businesses = memo(BusinessesMemo);
export default Businesses;
