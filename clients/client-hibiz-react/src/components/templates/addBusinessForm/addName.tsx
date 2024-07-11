import useBusinessCtrl from "@/components/store/useBusinessCtrl";
import { useUserToken } from "@/components/store/useUserToken";
import { apiRpc } from "@hi/common";
import { memo, useCallback, useState, useEffect } from "react";
import { debounce } from "lodash";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";

const AddName = () => {
  const {
    setStep,
    step,
    businessName,
    setBusinessName,
    setCustomLink,
    customLink,
    businessType,
  } = useBusinessCtrl((s) => ({
    setStep: s.setStep,
    step: s.step,
    businessName: s.businessName,
    setBusinessName: s.setBusinessName,
    setCustomLink: s.setCustomLink,
    customLink: s.customLink,
    businessType: s.businessType,
  }));

  const { accessToken, refreshToken } = useUserToken((s) => ({
    accessToken: s.accessToken,
    refreshToken: s.refreshToken,
  }));

  const { user } = useOwnerLogin((s) => ({
    user: s.user,
  }));

  const [validCustomLink, setValidCustomLink] = useState(false);
  const [validBusinessName, setValidBusinessName] = useState(false);
  const [isButtonActive, setIsButtonActive] = useState(false);

  const addBusinessName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusinessName(e.target.value);
  };

  const debouncedApiCall = useCallback(
    debounce(async (link) => {
      const res = await apiRpc.businesses[":customLink"].$post({
        header: {
          x_access_token: accessToken,
          x_refresh_token: refreshToken,
        },
        param: {
          customLink: link,
        },
      });

      if (res.status === 200) {
        setIsButtonActive(true);
        setValidCustomLink(false);
      } else if (res.status === 409) {
        setValidCustomLink(true);
        setIsButtonActive(false);
      }
    }, 3000),
    [accessToken, refreshToken],
  );

  const addCustomLink = (e: React.ChangeEvent<HTMLInputElement>) => {
    const link = e.target.value;
    setCustomLink(link);
    setIsButtonActive(false);
    debouncedApiCall(link);
  };

  const goNext = useCallback(async () => {
    if (businessName === "") {
      setValidBusinessName(true);
      return;
    }
    if (customLink === "") {
      setValidCustomLink(true);
      return;
    }
    const res = await apiRpc.businesses.$post({
      header: {
        x_access_token: accessToken,
        x_refresh_token: refreshToken,
      },
      json: {
        businessType: businessType,
        name: businessName,
        customLink: customLink,
        staffIds: [user._id],
      },
    });
    
    if (res.status === 200 || res.status === 201) {
      setStep(step + 1);
    }
  }, [
    step,
    businessName,
    customLink,
    accessToken,
    refreshToken,
    businessType,
    user,
  ]);

  return (
    <main>
      <section className="mx-6 mt-4 space-y-2">
        <h5 className="text-lg">Your Outlet name*</h5>
        <input
          type="text"
          value={businessName}
          className="w-full px-4 py-3 border border-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          placeholder="Enter your name"
          maxLength={20}
          onChange={addBusinessName}
          required
        />
        {validBusinessName && (
          <span className="text-red-500">Please enter a valid name</span>
        )}
      </section>
      <section className="mx-6 mt-8 space-y-2">
        <h5 className="text-lg">Your customized Link*</h5>
        <span className="opacity-50">
          Your customers will access your website thought this link
        </span>
        <div className="relative w-full overflow-hidden">
          <input
            type="text"
            value={customLink}
            className="w-full px-4 py-3 pr-20 border border-black rounded-2xl"
            placeholder="Custom Link"
            maxLength={15}
            onChange={addCustomLink}
            required
          />
          <span className="absolute text-[#2900FF] bg-[#E4E0F9] py-3 px-4 transform -translate-y-1/2 right-0 top-1/2 rounded-r-2xl">
            .hipal.life
          </span>
        </div>
        {validCustomLink && (
          <span className="text-red-500">Please enter a valid link</span>
        )}
      </section>
      <button
        type="button"
        onClick={goNext}
        className="bottom_btn"
        disabled={!isButtonActive}
      >
        Next
      </button>
    </main>
  );
};

const MemoiseAddName = memo(AddName);
export default MemoiseAddName;
