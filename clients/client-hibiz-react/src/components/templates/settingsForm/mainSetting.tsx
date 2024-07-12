import { memo } from "react";
import Header from "@/components/molecules/header";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import HiSiteMiddleImage from "@/assets/hisite/hisiteHeader.png";
import { Link, useParams } from "react-router-dom";
import { settingServices } from "./settingStore";

const MemoSettings = () => {
  const businessId = useParams()?.businessId || "";
  return (
    <main>
      <header className="pb-4 linear_gradient_background">
        <Header leftIcon={<FaArrowLeft />} isIconBusinessShow={false}>
          <img src={HiSiteMiddleImage} alt="HiSiteMiddleImage" loading="lazy" />
          <h1 className="mt-4 mb-2 text-2xl font-semibold">Settings</h1>
          <p className="mx-16 text-[#7D7D7D]">
            Manage outlet & business settings
          </p>
        </Header>
      </header>
      <section className="p-6 space-y-6">
        {settingServices.map((service) => {
          return (
            <article
              key={service?._id}
              className="bg-white h-[7rem] rounded-2xl p-4"
            >
              <header className="relative flex items-center mb-6 space-x-4">
                <article className="w-6 h-6 bg-purple-700">
                  <service.icon className="text-white" />
                </article> 
                <h1 className="text-2xl">{service?.title}</h1>
                <Link
                  to={`/app/business/${businessId}/${service?.navigateTo}`}
                  className="absolute -rotate-45 right-2 top-2"
                >
                  <FaArrowRight />
                </Link>
              </header>
              <p>{service?.description}</p>
            </article>
          );
        })}
      </section>
    </main>
  );
};

const SettingsForm = memo(MemoSettings);
export default SettingsForm;
