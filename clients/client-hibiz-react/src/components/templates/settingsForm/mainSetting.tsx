import { memo, useCallback } from "react";
import {  FaArrowRight } from "react-icons/fa";
import { settingServices } from "./settingStore";
import { type SettingPageTypes, useSettings } from "@/components/store/useSettings";

const MemoSettings = () => {
  const {setPageToggle} = useSettings((s) => ({
    setPageToggle: s.setPageToggle,
    pageToggle: s.pageToggle,
  }))
  const goToForm = useCallback((navigateTo:SettingPageTypes) => {
    setPageToggle(navigateTo)
  },[])

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
