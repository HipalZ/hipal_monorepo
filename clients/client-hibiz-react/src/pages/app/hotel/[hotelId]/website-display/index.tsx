import AdvancedBottomButton from '@/components/atom/bottomButton/advancedBottomButton';
import useShowErrorToasts from '@/components/atom/errorToasts';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import EasyReactCropper from '@/components/cropper/cropper';
import { useCheckValidations } from '@/components/helpers/bannersHelper';
import { useCroppedImg, useImageChange } from '@/components/helpers/explorePageHelpers';
import HisiteHeader from '@/components/molecules/hisiteHeader';
import { useExploreStore } from '@/components/store/useExploreStore';
import { useExploreTemp } from '@/components/store/useExploreTemp';
import type { CropperRef as ExploreCropperRef, IBizPayload } from '@/components/types/businessData';
import { storeHotelBannerMediaAfterSave } from '@/components/uploadAdmin/imageUpload';
import { filterPayload } from '@/components/utils/helper';
import { useApiErrorHandler } from '@/hooks/useApiErrorHandler';
import { useOutletInfo } from '@/hooks/useExplore';
import { apiRpc } from '@hi/common';
import { ImagePlus, Images, Link2, PenLine, Save } from 'lucide-react';
import { type FormEvent, lazy, useMemo, useRef } from 'react';
import type { Area } from 'react-easy-crop';
import toast from 'react-hot-toast';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

const HotelRoomImages = lazy(() => import('@/components/templates/explorePage/hotelRoomImages'));
const SocialMediaLinks = lazy(() => import('@/components/templates/explorePage/socialMediaLinks'));
const PopUp = lazy(() => import('@/components/atom/popUp'));

const bannerExtensionByMimeType: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
};

const isFileLike = (file?: File | null): file is File => Boolean(file && typeof file.name === 'string' && typeof file.type === 'string');

const bannerExtensionFromFile = (file?: File | null, mediaType?: string) =>
  (isFileLike(file)
    ? file.name
        .split('.')
        .pop()
        ?.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
    : '') ||
  bannerExtensionByMimeType[mediaType || ''] ||
  mediaType?.split('/')[1]?.replace(/[^a-z0-9]/g, '') ||
  'jpg';

const SectionHeader = ({ icon, title, description }: { icon: JSX.Element; title: string; description: string }) => (
  <div className="mb-4 flex items-start gap-3">
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white">{icon}</span>
    <div>
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  </div>
);

type EasyCropperHandle = {
  getCroppedAreaPixels: () => Area | null;
};

const HotelWebsiteDisplay = () => {
  const navigate = useNavigate();
  const hotelId = useParams()?.hotelId;
  const cropperRef = useRef<EasyCropperHandle>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const { isBizLoading } = useOutletInfo();
  const { checkValidations } = useCheckValidations();
  const { handleCrop } = useCroppedImg();
  const { handleImageChange, imageUploadUrl } = useImageChange();
  const showErrorToasts = useShowErrorToasts();
  const handleEnvelope = useApiErrorHandler().handleEnvelope;

  const { bizInfo, setBizInfo, img, hotelBanners, imageFiles, showCropper, setShowCropper, cropping, setHotelBanners } = useExploreStore((s) => ({
    bizInfo: s.bizInfo,
    setBizInfo: s.setBizInfo,
    img: s.img,
    hotelBanners: s.hotelBanners,
    imageFiles: s.imageFiles,
    showCropper: s.showCropper,
    setShowCropper: s.setShowCropper,
    cropping: s.cropping,
    setHotelBanners: s.setHotelBanners,
  }));

  const { socialMediaLinks, setIsLoading, isLoading } = useExploreTemp((s) => ({
    socialMediaLinks: s.socialMediaLinks,
    setIsLoading: s.setIsLoading,
    isLoading: s.isLoading,
  }));

  const logoPreview = useMemo(() => (typeof img.logo === 'string' ? img.logo : ''), [img.logo]);

  const uploadHotelBanners = async () => {
    const uploadedHotelBanners: string[] = [];
    const hotelBannerSlots = ['first', 'second', 'third'] as const;

    for (let i = 0; i < hotelBanners.length; i++) {
      const mediaPreview = hotelBanners[i];
      if (!mediaPreview) continue;

      const slotType = hotelBannerSlots[i];
      const selectedFile = slotType && isFileLike(imageFiles[slotType]) ? imageFiles[slotType] : null;

      if (selectedFile || mediaPreview.startsWith('data:image') || mediaPreview.startsWith('data:video')) {
        const mediaType = selectedFile?.type || mediaPreview.match(/^data:([^;]+);base64,/)?.[1] || 'image/jpeg';
        const extension = bannerExtensionFromFile(selectedFile, mediaType);
        const blob = await (await fetch(mediaPreview)).blob();
        const file = selectedFile || new File([blob], `hotel-banner.${extension}`, { type: mediaType });
        const url = await storeHotelBannerMediaAfterSave(file, mediaPreview, setIsLoading);

        if (!url) throw new Error('Unable to upload one of the hotel banners');
        uploadedHotelBanners.push(url);
        setHotelBanners((prev) => {
          const updated = [...prev];
          updated[i] = url;
          return updated;
        });
      } else {
        uploadedHotelBanners.push(mediaPreview);
      }
    }

    return uploadedHotelBanners;
  };

  const handleSaveHotelDisplay = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hotelId) return;

    const validSocialMediaLinks = socialMediaLinks.filter((item) => item.link);
    for (const item of validSocialMediaLinks) {
      if (!item.link.startsWith('https://')) {
        toast.error(`Invalid social media link for ${item.icon}. Link should start with https://`);
        return;
      }
    }

    try {
      setIsLoading(true);
      const { logoExplore } = await checkValidations();
      const uploadedHotelBanners = await uploadHotelBanners();

      const payload: IBizPayload = {
        businessId: hotelId,
        name: bizInfo?.name,
        logoUrl: logoExplore,
        hotelBanners: uploadedHotelBanners,
        socialMediaLinks: validSocialMediaLinks.map((item) => ({
          icon: item.icon,
          link: item.link,
        })),
      };

      const filteredPayload = {
        ...filterPayload(payload),
        businessId: hotelId,
        hotelBanners: uploadedHotelBanners,
      };

      let res: { status: number } | undefined;
      if (bizInfo?._id === '') {
        res = await apiRpc.businesses.outletInfo.$post({ json: filteredPayload as any });
      }

      if (bizInfo?._id !== '' || (res && res.status === 409)) {
        const response = await apiRpc.businesses.outletInfo.update[':businessId'].$put({
          json: filteredPayload as any,
          param: { businessId: hotelId },
        });

        const outletInfoData = await handleEnvelope<{
          error?: Parameters<typeof showErrorToasts>[0];
        }>(response);

        if (response.status === 200 || response.status === 201) {
          toast.success('Hotel website display saved successfully');
          navigate(`/app/hotel/${hotelId}/website-display`);
        } else if (response.status === 400 && outletInfoData?.error) {
          showErrorToasts(outletInfoData.error);
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save hotel website display');
    } finally {
      setIsLoading(false);
    }
  };

  const cropConfig = { width: 150, height: 150 };

  if (isBizLoading) return <LoadingSpinner />;

  return (
    <main className="min-h-screen bg-[#F6F4F1] pb-28">
      <HisiteHeader
        onBack={() => navigate(`/app/hotel/${hotelId}`)}
        title="Website Display"
        isIconBusinessShow={false}
        classes="linear_gradient_background"
        leftIcon={<FaArrowLeft />}
      />

      <form onSubmit={handleSaveHotelDisplay} className="mx-auto space-y-5 px-4">
        <div className="grid gap-5 xl:grid-cols-[minmax(20rem,0.75fr)_minmax(32rem,1.25fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader
              icon={<ImagePlus className="h-5 w-5" />}
              title="Hotel Identity"
              description="Shown on the guest check-in page, chat, order flow, and browser preview."
            />
            <div className="grid gap-5 md:grid-cols-[9rem_1fr] md:items-center xl:grid-cols-1">
              <article className="relative h-32 w-32 overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                <input
                  ref={logoInputRef}
                  type="file"
                  id="hotelLogoInput"
                  className="hidden"
                  onChange={handleImageChange}
                  data-type="logo"
                  accept="image/*"
                />
                <label htmlFor="hotelLogoInput" className="flex h-full w-full cursor-pointer items-center justify-center">
                  {logoPreview ? (
                    <>
                      <img src={logoPreview} alt="Hotel logo" className="h-full w-full object-cover" />
                      <span className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-slate-900 shadow">
                        <PenLine className="h-4 w-4" />
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-semibold text-slate-500">Add logo</span>
                  )}
                </label>
              </article>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Hotel display name</span>
                <input
                  type="text"
                  minLength={4}
                  maxLength={30}
                  value={bizInfo?.name || ''}
                  onChange={(event) => setBizInfo({ ...bizInfo, name: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-black"
                  placeholder="Enter hotel name"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader
              icon={<Images className="h-5 w-5" />}
              title="Check-in Banners"
              description="These images or short MP4 videos are displayed at the top of the hotel guest check-in page."
            />
            <HotelRoomImages
              handleImageChange={imageUploadUrl}
              img={{
                first: hotelBanners[0] || '',
                second: hotelBanners[1] || '',
                third: hotelBanners[2] || '',
              }}
            />
          </section>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeader
            icon={<Link2 className="h-5 w-5" />}
            title="Social Links"
            description="Only links with a value will appear in the guest check-in footer."
          />
          <SocialMediaLinks />
        </section>

        <AdvancedBottomButton
          fixed
          maxWidth="30rem"
          buttons={[
            {
              text: 'Save website display',
              type: 'submit',
              icon: <Save className="mr-2 h-4 w-4" />,
              className: 'w-full rounded-md',
              isLoading,
            },
          ]}
        />
      </form>

      <PopUp hide show={showCropper} onClose={() => setShowCropper(false)}>
        <section className="my-[10rem]">
          <EasyReactCropper
            key={String(cropping.image)}
            image={String(cropping.image || '')}
            ref={cropperRef}
            width={cropConfig.width}
            height={cropConfig.height}
          />
        </section>
        <AdvancedBottomButton
          buttons={[
            {
              text: 'Crop',
              onClick: () => handleCrop(cropperRef as unknown as ExploreCropperRef),
              className: 'w-full rounded-md',
            },
            {
              text: 'Cancel',
              onClick: () => setShowCropper(false),
              type: 'button',
              className: 'w-full rounded-md',
            },
          ]}
        />
      </PopUp>
    </main>
  );
};

export default HotelWebsiteDisplay;
