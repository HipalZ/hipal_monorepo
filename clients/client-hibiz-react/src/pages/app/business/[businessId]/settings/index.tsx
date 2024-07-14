import { useSettings } from "@/components/store/useSettings";
import SettingsForm from "@/components/templates/settingsForm/mainSetting";
import { memo, startTransition, useCallback } from "react";
import HiSiteMiddleImage from "@/assets/hisite/hisiteHeader.png";
import MemoizedHeader from "@/components/molecules/header";
import { useNavigate } from "react-router-dom";
import useBusinessData from "@/components/store/useBusinessData";
import OutletForm from "@/components/templates/settingsForm/outletForm";
import BusinessForm from "@/components/templates/settingsForm/businessForm";

const MemoSettingsForm = () => {
  const { pageToggle, setPageToggle } = useSettings((s) => ({
    pageToggle: s.pageToggle,
    setPageToggle: s.setPageToggle,
  }));
  const businessData = useBusinessData((s) => s.businessData);
  const navigate = useNavigate();

  const goBack = useCallback(() => {
    if (pageToggle === "OUTLET_FORM" || pageToggle === "BUSINESS_FORM") {
      setPageToggle("MAIN");
    } else {
      startTransition(() => navigate(`/app/business/${businessData?._id}`));
    }
  }, [pageToggle, setPageToggle, businessData, navigate]);

  return (
    <main>
      <header className="linear_gradient_background">
        <MemoizedHeader
          onBack={goBack}
          isIconBusinessShow={false}
          title={
            pageToggle === "OUTLET_FORM"
              ? "Outlet Setting"
              : pageToggle === "BUSINESS_FORM"
                ? "Business Setting"
                : ""
          }
        >
          {pageToggle === "MAIN" && (
            <>
              <img
                src={HiSiteMiddleImage}
                alt="HiSiteMiddleImage"
                loading="lazy"
              />
              <h1 className="mt-4 mb-2 text-2xl font-semibold">Settings</h1>
              <p className="mx-16 pb-4 text-[#7D7D7D]">
                Manage outlet & business settings
              </p>
            </>
          )}
        </MemoizedHeader>
      </header>
      {pageToggle === "MAIN" && <SettingsForm />}
      {pageToggle === "OUTLET_FORM" && <OutletForm />}
      {pageToggle === "BUSINESS_FORM" && <BusinessForm />}
    </main>
  );
};

const Settings = memo(MemoSettingsForm);
export default Settings;
