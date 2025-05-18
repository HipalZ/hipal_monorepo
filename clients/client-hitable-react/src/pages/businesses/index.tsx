import bookmarkAfter from "@/assets/svg/bookmarkAfter.svg";
import bookmarkBefore from "@/assets/svg/bookmarkBefore.svg";
import ProfileHeader from "@/components/liteAlerts/profileHeader";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { useLiteStore } from "@/components/store/useLiteStore";
import type { CustomRole } from "@/components/types/hiClientzData";
import { memo } from "react";
import { FiDownload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import smartPhone from "@/assets//img/smartphone.png";
import { apiRpc } from "@hi/common";
import useBusinessData from "@/components/store/useBusinessData";

const BusinessesMemo = memo(() => {
  // store
  const { captainData, setSelectedBiz } = useHiClientZ((s) => ({
    captainData: s.captainData,
    setSelectedBiz: s.setSelectedBiz,
  }));
  const navigate = useNavigate();

  const setTriggerSound = useLiteStore((s) => s.setTriggerSound);

  const getBusinessInfo = async (id: string) => {
    const res = await apiRpc.businesses.outletInfo[":businessId"].$get({
      param: {
        businessId: id,
      },
    });
    const loyaltyResponse = await apiRpc.businesses[":businessId"].loyalty.$get(
      {
        param: {
          businessId: id,
        },
      },
    );
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
    getBusinessInfo(biz?.businessId?._id);
    navigate("/viewInBiz");
  };

  return (
    <main className="relative h-screen">
      <header className="flex h-[5rem] items-center justify-between px-6 py-4">
        <h1 className="text-xl font-medium">Hi, {captainData?.name}</h1>
        <ProfileHeader />
      </header>
      <article
        style={{ backgroundColor: "#4C4DDC" }}
        className="flex h-[7rem] gap-4 w-full items-center overflow-hidden"
      >
        <img
          src={smartPhone}
          alt="promoAvatar"
          width={90}
          loading="lazy"
          className="ml-4"
        />
        <article className="space-y-2 text-white">
          <h1>For Better & Faster Experience use Android Application</h1>
          <a
            href="https://assets.hipalz.com/hiclient-3.apk"
            className="flex items-center gap-2 p-2 ml-auto text-sm font-semibold text-black bg-white w-36 rounded-xl"
          >
            <FiDownload size={16} /> <span>Download App</span>
          </a>
        </article>
      </article>
      <br />
      <h1 className="mx-5 mb-4 text-2xl text-black">You are added to</h1>
      <section className="mx-5 lg:grid lg:grid-cols-2">
        {captainData?.customRole ? (
          captainData?.customRole?.map((biz) => (
            <section
              onClick={() => exploreBusiness(biz)}
              onKeyDown={() => exploreBusiness(biz)}
              key={biz?.businessId?._id}
              className="my-4 flex h-[6rem] items-center justify-between rounded-2xl p-4"
              style={{ backgroundColor: "#f2f2f2" }}
            >
              <article className="flex items-center">
                <img
                  src={biz?.businessId?.logo}
                  alt="logo"
                  width={65}
                  height={65}
                  className="border border-black rounded-full border-1"
                />
                <div className="ml-4">
                  <h1 className="text-xl font-medium">
                    {biz?.businessId?.businessName}
                  </h1>
                  <p
                    title={biz?.businessId?.address}
                    className="w-48 text-base font-medium truncate"
                  >
                    {biz?.businessId?.address}
                  </p>
                </div>
              </article>
              <div>
                <img
                  src={biz.bookMark ? bookmarkAfter : bookmarkBefore}
                  alt="bookmark"
                />
              </div>
            </section>
          ))
        ) : (
          <center>No Business Found</center>
        )}
      </section>
    </main>
  );
});

const Businesses = memo(BusinessesMemo);
export default Businesses;
