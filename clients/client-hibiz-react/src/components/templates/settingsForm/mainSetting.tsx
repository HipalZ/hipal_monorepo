import { memo, useCallback } from "react";
import { FaArrowRight } from "react-icons/fa";
import { settingServices } from "./settingStore";
import { type SettingPageTypes, useSettings } from "@/components/store/useSettings";
import { useOutletFormStore, useBusinessFormStore } from "@/components/store/useOutlet";
import { apiRpc } from "@hi/common";
import { useUserToken } from "@/components/store/useUserToken";
import useBusinessData from "@/components/store/useBusinessData";

const MemoSettings = () => {
  const { setPageToggle } = useSettings((s) => ({
    setPageToggle: s.setPageToggle,
    pageToggle: s.pageToggle,
  }))

  const { setEntireFormData } = useOutletFormStore(s => ({
    formData: s.formData,
    setFormData: s.setFormData,
    setEntireFormData: s.setEntireFormData,

  }))

  const { setEntireBusinessFormData } = useBusinessFormStore(s => ({
    businessFormData: s.businessFormData,
    setBusinessFormData: s.setBusinessFormData,
    setEntireBusinessFormData: s.setEntireBusinessFormData,
  }))
  const businessData = useBusinessData((s) => s.businessData);


  const { accessToken, refreshToken } = useUserToken(s => ({
    accessToken: s.accessToken,
    refreshToken: s.refreshToken
  }))

  const getBusinessInfo = async () => {
    const res = await apiRpc.businesses.outletInfo[":businessId"].$get({
      header: {
        x_access_token: accessToken,
        x_refresh_token: refreshToken
      },
      param: {
        businessId: businessData?._id
      }
    })
    const response = (await res.json()).data
    if (res.status === 200 || res.status === 201) {
      setEntireFormData(response);
      console.log(response);
    }
  }

  const getSettingsInfo = async () => {
    const res = await apiRpc.settings[":businessId"].$get({
      header: {
        x_access_token: accessToken,
        x_refresh_token: refreshToken
      },
      param: {
        businessId: businessData?._id
      }
    })
    const response = (await res.json()).data
    if (res.status === 200 || res.status === 201) {
      setEntireBusinessFormData(response);
      console.log(response);
    }
  }

  const goToForm = useCallback((navigateTo: SettingPageTypes) => {
    if (navigateTo === "OUTLET_FORM") {
      getBusinessInfo()
    }
    if (navigateTo === "BUSINESS_FORM") {
      getSettingsInfo()
    }
    setPageToggle(navigateTo)
  }, [])

  return (

    <section className="p-6 space-y-6">
      {settingServices.map((service) => {
        return (
          <article
            key={service?._id}
            className="bg-white h-[6.5rem] rounded-2xl p-4"
          >
            <header className="relative flex items-center mb-4 space-x-4">
              <article className="flex items-center justify-center w-8 h-8 bg-purple-700 rounded-full">
                <service.icon className="text-white" />
              </article>
              <h1 className="text-xl font-normal">{service?.title}</h1>
              <button
                type="button"
                onClick={() => goToForm(service?.navigateTo)}
                className="absolute -rotate-45 right-2 top-2"
              >
                <FaArrowRight />
              </button>
            </header>
            <p>{service?.description}</p>
          </article>
        );
      })}
    </section>
  );
};

const SettingsForm = memo(MemoSettings);
export default SettingsForm;
