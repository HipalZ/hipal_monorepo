import { useSettings } from "@/components/store/useSettings";
import SettingsForm from "@/components/templates/settingsForm/mainSetting";
import { memo } from "react";

const MemoSettingsForm = () => {
  const { pageToggle, setPageToggle } = useSettings((s) => ({
    pageToggle: s.pageToggle,
    setPageToggle: s.setPageToggle,
  }));

  return <>{pageToggle === "MAIN" && <SettingsForm />}</>;
};

const Settings = memo(MemoSettingsForm);
export default Settings;
