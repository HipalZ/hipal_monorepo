import { useSettings } from "@/components/store/useSettings";
import SettingsForm from "@/components/templates/settingsForm/mainSetting";
import { memo, useCallback } from "react";
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
      navigate(`/app/business/${businessData?._id}`);
    }
  }, [pageToggle, setPageToggle, businessData, navigate]);

  let headerTitle = "Settings";
  if (pageToggle === "OUTLET_FORM") {
    headerTitle = "Outlet Setting";
  } else if (pageToggle === "BUSINESS_FORM") {
    headerTitle = "Business Setting";
  }

  return (
    <main>
      <header className="linear_gradient_background">
        <MemoizedHeader
          onBack={goBack}
          isIconBusinessShow={false}
          title={headerTitle}
        />
      </header>
      {pageToggle === "MAIN" && <SettingsForm />}
      {pageToggle === "OUTLET_FORM" && <OutletForm />}
      {pageToggle === "BUSINESS_FORM" && <BusinessForm />}
    </main>
  );
};

const Settings = memo(MemoSettingsForm);
export default Settings;
