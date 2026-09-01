import BottomButton from '@/components/atom/bottomButton';
import useShowErrorToasts from '@/components/atom/errorToasts';
import EasyReactCropper from '@/components/cropper/cropper';
import { useCroppedImg } from '@/components/helpers/explorePageHelpers';
import useBusinessData from '@/components/store/useBusinessData';
import { useExploreStore } from '@/components/store/useExploreStore';
import { useExploreTemp } from '@/components/store/useExploreTemp';
import type { CropperRef, IBizPayload } from '@/components/types/businessData';
import { storeHotelBannerMediaAfterSave } from '@/components/uploadAdmin/imageUpload';
import { filterPayload } from '@/components/utils/helper';
import { useApiErrorHandler } from '@/hooks/useApiErrorHandler';
import { apiRpc } from '@hi/common';
import { type FormEvent, lazy, memo, useRef } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useCheckValidations } from '../../helpers/bannersHelper';
const CategoryTopBanner = lazy(() => import('./categoryTopBanner'));

const SocialMediaLinks = lazy(() => import('@/components/templates/explorePage/socialMediaLinks'));

const BannerSection = lazy(() => import('@/components/templates/explorePage/bannerSection'));
const ExplorePageTopSection = lazy(() => import('@/components/templates/explorePage/explorePageTopSection'));
const UniquelyYoursPopUp = lazy(() => import('@/components/templates/explorePage/uniquelyYoursPopUp'));

const PopUp = lazy(() => import('@/components/atom/popUp'));
const FooterSection = lazy(() => import('@/components/templates/explorePage/footerSection'));
const UniquelyYoursSection = lazy(() => import('@/components/templates/explorePage/uniquelyYoursSection'));

const bannerExtensionByMimeType: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
};

const isFileLike = (file?: File | null): file is File =>
  Boolean(file && typeof file.name === 'string' && typeof file.type === 'string');

const bannerExtensionFromFile = (file?: File | null, mediaType?: string) =>
  (isFileLike(file) ? file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') : '') ||
  bannerExtensionByMimeType[mediaType || ''] ||
  mediaType?.split('/')[1]?.replace(/[^a-z0-9]/g, '') ||
  'jpg';

const MemoMainForm = () => {
  const { checkValidations } = useCheckValidations();
  const cropperRef = useRef<CropperRef>(null);
  const outletInfo = useBusinessData((s) => s.outletInfo);

  const bizInfo = useExploreStore((s) => s.bizInfo);
  const showUniquePopUp = useExploreStore((s) => s.showUniquePopUp);
  const setShowUniquePopUp = useExploreStore((s) => s.setShowUniquePopUp);
  const showCropper = useExploreStore((s) => s.showCropper);
  const cropping = useExploreStore((s) => s.cropping);
  const setShowCropper = useExploreStore((s) => s.setShowCropper);
  const hotelBanners = useExploreStore((s) => s.hotelBanners);
  const setHotelBanners = useExploreStore((s) => s.setHotelBanners);
  const imageFiles = useExploreStore((s) => s.imageFiles);
  const setIsLoading = useExploreTemp((s) => s.setIsLoading);
  const socialMediaLinks = useExploreTemp((s) => s.socialMediaLinks);
  const handleEnvelope = useApiErrorHandler().handleEnvelope;
  const navigate = useNavigate();
  const businessId = useParams()?.businessId;
  const hotelId = useParams()?.hotelId;
  const { handleCrop } = useCroppedImg();
  const showErrorToasts = useShowErrorToasts();

  // Update the `socialMediaLinks` state by mapping over the previous links and updating the link that matches the selected social media icon.

  const handleSaveExplorePage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const resolvedBusinessId = businessId || hotelId;
    if (!resolvedBusinessId) return;
    const { bannerExplore, logoExplore, footerExplore, categoryTopBanner } = await checkValidations();

    // Upload local hotel carousel previews before saving URL list.
    const uploadedHotelBanners: string[] = [];
    const hotelBannerSlots = ['first', 'second', 'third'] as const;

    for (let i = 0; i < hotelBanners.length; i++) {
      const mediaPreview = hotelBanners[i];
      if (!mediaPreview) continue;
      const slotType = hotelBannerSlots[i];
      const selectedFile = slotType && isFileLike(imageFiles[slotType]) ? imageFiles[slotType] : null;

      if (selectedFile || mediaPreview?.startsWith('data:image') || mediaPreview?.startsWith('data:video')) {
        const mediaType = selectedFile?.type || mediaPreview.match(/^data:([^;]+);base64,/)?.[1] || 'image/jpeg';
        const extension = bannerExtensionFromFile(selectedFile, mediaType);
        const blob = await (await fetch(mediaPreview)).blob();
        const file = selectedFile || new File([blob], `hotel-banner.${extension}`, { type: mediaType });
        const url = await storeHotelBannerMediaAfterSave(file, mediaPreview);

        const finalUrl = url || '';
        if (!finalUrl) return;

        setHotelBanners((prev) => {
          const updated = [...prev];
          updated[i] = finalUrl;
          return updated;
        });

        if (finalUrl) uploadedHotelBanners.push(finalUrl);
      } else {
        uploadedHotelBanners.push(mediaPreview);
      }
    }

    // Validate social links
    const validSocialMediaLinks = socialMediaLinks.filter((item) => item.link);
    for (const item of validSocialMediaLinks) {
      if (!item.link.startsWith('https://')) {
        toast.error(`Invalid social media link for ${item.icon}. Link should start with 'https://'`);
        return; // Exit the function early if an invalid link is found
      }
    }

    const filteredSocialMedia = validSocialMediaLinks.map((item) => ({
      icon: item.icon,
      link: item.link,
    }));

    const payload: IBizPayload = {
      businessId: resolvedBusinessId,
      logoUrl: logoExplore,
      specialBannerUrl: bannerExplore,
      endBannerUrl: footerExplore,
      categoryTopBannerUrl: categoryTopBanner,
      socialMediaLinks: filteredSocialMedia,
      name: bizInfo?.name,
      fssai: bizInfo?.fssai,
      gst: bizInfo?.gst,
      footerDescription: bizInfo?.footerDescription,
      hotelBanners: uploadedHotelBanners,
    };

    const filteredPayload = {
      ...filterPayload(payload),
      hotelBanners: uploadedHotelBanners,
    };
    setIsLoading(true);

    let res: { status: number } | undefined;

    if (bizInfo?._id === '') {
      res = await apiRpc.businesses.outletInfo.$post({ json: filteredPayload });
    }

    if (bizInfo?._id !== '' || (res && res.status === 409)) {
      const outletInfo = await apiRpc.businesses.outletInfo.update[':businessId'].$put({
        json: filteredPayload,
        param: {
          businessId: resolvedBusinessId,
        },
      });

      const outletInfoData = await handleEnvelope<{
        error?: Parameters<typeof showErrorToasts>[0];
      }>(outletInfo);
      if (outletInfo.status === 200) {
        toast.success('Data saved successfully');
        if (businessId) navigate(`/app/business/${businessId}/explorePage`);
        if (hotelId) navigate(`/app/hotel/${hotelId}/website-display`);
      } else if (outletInfo.status === 400) {
        showErrorToasts(outletInfoData?.error);
      }
    }

    setIsLoading(false);
  };

  // Define crop sizes
  const cropSizes: Record<string, { width: number; height: number }> = {
    logo: { width: 150, height: 150 },
    categoryTopBanner: { width: 375, height: 135 },
    banner: { width: 400, height: 400 },
    footer: { width: 375, height: 135 },
  };

  const cropConfig = cropSizes[cropping.type] || {
    width: 400,
    height: 400,
  };

  return (
    <form onSubmit={handleSaveExplorePage} className="px-4 pb-[5rem]">
      <ExplorePageTopSection />
      <br />
      <BannerSection />
      {outletInfo?.outLetType !== 'HOTEL' && !outletInfo?.isPosEnabled && <UniquelyYoursSection />}
      {outletInfo?.outLetType !== 'HOTEL' && <CategoryTopBanner />}
      <FooterSection />
      <SocialMediaLinks />
      <button type="submit" className="bottom_btn cursor-pointer">
        Save
      </button>

      <PopUp hide show={showCropper} onClose={() => setShowCropper(false)}>
        <section className="my-[10rem]">
          <EasyReactCropper key={cropping.image} image={cropping.image} ref={cropperRef} width={cropConfig.width} height={cropConfig.height} />
        </section>
        <BottomButton
          buttons={[
            {
              text: 'Crop',
              onClick: () => handleCrop(cropperRef),
            },
            {
              text: 'Cancel',
              onClick: () => setShowCropper(false),
              type: 'button',
            },
          ]}
        />
      </PopUp>
      {showUniquePopUp && (
        <PopUp show={showUniquePopUp} onClose={() => setShowUniquePopUp(false)}>
          <UniquelyYoursPopUp />
        </PopUp>
      )}
    </form>
  );
};

const MainForm = memo(MemoMainForm);
export default MainForm;
