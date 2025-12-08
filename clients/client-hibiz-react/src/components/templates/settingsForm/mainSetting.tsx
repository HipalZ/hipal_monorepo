import useBusinessData from '@/components/store/useBusinessData';
import { useBusinessFormStore, useOutletFormStore } from '@/components/store/useOutlet';
import { type SettingPageTypes, useSettings } from '@/components/store/useSettings';
import { apiRpc } from '@hi/common';
import { memo, useCallback } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { settingServices } from './settingStore';

const MemoSettings = () => {
  const setPageToggle = useSettings((s) => s.setPageToggle);
  const setEntireFormData = useOutletFormStore((s) => s.setEntireFormData);
  const setEntireBusinessFormData = useBusinessFormStore((s) => s.setEntireBusinessFormData);
  const businessData = useBusinessData((s) => s.businessData);

  const getBusinessInfo = async () => {
    const res = await apiRpc.businesses.outletInfo[':businessId'].$get({
      param: {
        businessId: businessData?._id,
      },
    });
    const response = (await res.json()).data;
    if (res.status === 200 || res.status === 201) {
      setEntireFormData(response);
      console.log('response', response);
      useBusinessData.getState().setOutletInfo(response);
    }
  };

  const getSettingsInfo = async () => {
    const res = await apiRpc.settings[':businessId'].$get({
      param: {
        businessId: businessData?._id,
      },
    });
    const response = (await res.json()).data;
    if (res.status === 200 || res.status === 201) {
      setEntireBusinessFormData(response);
    }
  };

  const goToForm = useCallback((navigateTo: SettingPageTypes) => {
    if (navigateTo === 'OUTLET_FORM') {
      getBusinessInfo();
    }
    if (navigateTo === 'BUSINESS_FORM') {
      getSettingsInfo();
    }
    setPageToggle(navigateTo);
  }, []);

  return (
    <section className="m-4 flex flex-col flex-wrap gap-4 lg:flex-row">
      {settingServices.map((service) => {
        return (
          <article
            onClick={() => goToForm(service?.navigateTo)}
            onKeyDown={() => goToForm(service?.navigateTo)}
            key={service?._id}
            className="h-[6.5rem] w-[100%] rounded-2xl bg-white p-4 shadow-lg lg:max-w-[21.5rem]"
          >
            <header className="relative mb-4 flex items-center space-x-4">
              <article className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-700">
                <service.icon className="text-white" />
              </article>
              <h1 className="text-xl font-normal">{service?.title}</h1>
              <button type="button" className="absolute right-2 top-2 -rotate-45">
                <FaArrowRight />
              </button>
            </header>
            <p className="opacity-50">{service?.description}</p>
          </article>
        );
      })}
    </section>
  );
};

const SettingsForm = memo(MemoSettings);
export default SettingsForm;
