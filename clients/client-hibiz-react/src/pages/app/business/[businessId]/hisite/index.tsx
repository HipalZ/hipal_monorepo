import HiSiteMiddleImage from '@/assets/hisite/hisiteHeader.png';
import { hisiteServices } from '@/components/templates/businessForm/businessCtrlStore';
import { lazy, memo, startTransition, useCallback, useEffect } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
const HisiteHeader = lazy(() => import('@/components/molecules/hisiteHeader'));

const MemoHiSites = () => {
  const businessId = useParams()?.businessId || '';

  const navigate = useNavigate();

  const handleRoute = useCallback(
    (navigateTo: string) => {
      startTransition(() => {
        navigate(`/app/business/${businessId}/${navigateTo}`);
      });
    },
    [businessId],
  );

  const handleThemes = useCallback(() => {
    startTransition(() => {
      navigate(`/app/business/${businessId}/businesscontrol`);
    });
  }, [businessId]);

  const goBack = useCallback(() => {
    startTransition(() => {
      navigate(`/app/business/${businessId}`);
    });
  }, []);

  useEffect(() => {
    localStorage.removeItem('banner-store');
  }, []);

  return (
    <main>
      <header className="linear_gradient_background pb-4">
        <HisiteHeader
          onBack={goBack}
          leftIcon={<FaArrowLeft />}
          rightButton={
            <button onClick={handleThemes} type="button" className="rounded-full bg-white px-4 py-1">
              Themes & Layout
            </button>
          }
          isIconBusinessShow={false}
        >
          <img src={HiSiteMiddleImage} alt="HiSiteMiddleImage" loading="lazy" />
          <h1 className="mb-2 mt-4 text-2xl font-semibold">Hi-sites</h1>
          <p className="mx-16 text-[#7D7D7D]">Manage Your business, dishes, offers, rewards and many more</p>
        </HisiteHeader>
      </header>
      <section className="flex flex-col gap-4 p-6 lg:flex-row">
        {hisiteServices.map((service) => {
          return (
            <button
              type="button"
              onClick={() => handleRoute(service?.navigateTo)}
              key={service?._id}
              className="h-[7rem] w-full max-w-[28rem] rounded-2xl bg-white p-4"
            >
              <header className="relative mb-6 flex items-center space-x-4">
                <img src={service?.icon} alt={service?.icon} loading="lazy" />
                <h1 className="text-2xl">{service?.title}</h1>
                <div className="absolute right-2 top-2 -rotate-45">
                  <FaArrowRight />
                </div>
              </header>
              <p className="float-start">{service?.description}</p>
            </button>
          );
        })}
      </section>
    </main>
  );
};

const HiSites = memo(MemoHiSites);
export default HiSites;
