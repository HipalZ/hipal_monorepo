import { useExploreStore } from "@/components/store/useExploreStore";
import { useExploreTemp } from "@/components/store/useExploreTemp";
import { lazy, memo, useCallback, useMemo, type ChangeEvent } from "react";
import { IoMdArrowUp } from "react-icons/io";

const Paragraph = lazy(() => import("@/components/atom/paragraph"));
const SubHeader = lazy(() => import("@/components/atom/subHeader"));

const MemoSocialMediaLinks = () => {
  const { selectedSocialMedia, setSelectedSocialMedia } = useExploreStore(
    (s) => ({
      selectedSocialMedia: s.selectedSocialMedia,
      setSelectedSocialMedia: s.setSelectedSocialMedia,
    }),
  );

  const {
    socialMediaLinks,
    setSocialMediaLinks,
  } = useExploreTemp((s) => ({
    socialMediaLinks: s.socialMediaLinks,
    setSocialMediaLinks: s.setSocialMediaLinks,
  }));

  const handleIconClick = useCallback((icon: string) => {
    setSelectedSocialMedia(icon);
  }, [setSelectedSocialMedia]);

  const selectedLink = useMemo(() => {
    if (!Array.isArray(socialMediaLinks)) {
      return null;
    }
    return socialMediaLinks.find((link) => {
      return link.icon === selectedSocialMedia;
    });
  }, [socialMediaLinks, selectedSocialMedia]);

  const handleSaveSocialMediaLink = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newLink = event.target.value;
      const updatedSocialMediaLinks = socialMediaLinks.map((link) => {
        if (link.icon !== selectedSocialMedia) {
          return link;
        }
        return {
          ...link,
          link: newLink
        };
      });

      setSocialMediaLinks(updatedSocialMediaLinks);
    },
    [setSocialMediaLinks, socialMediaLinks, selectedSocialMedia],
  );

  return (
    <>
      <SubHeader text="Social Media Links" />
      <section className="bg-white rounded-2xl">
        <article className="flex items-center justify-between p-6">
          {Array.isArray(socialMediaLinks) && socialMediaLinks.map((link) => (
            <div
              key={link._id}
              onClick={() => handleIconClick(link.icon)}
              onKeyDown={() => handleIconClick(link.icon)}
              className={`${selectedSocialMedia === link.icon ? "ring-2 ring-offset-4 ring-blue-500" : ""} rounded-lg flex justify-center items-center bg-transparent`}
            >
              <img src={link.logo} alt="logo" className="h-8 w-8 object-contain" />
            </div>
          ))}
        </article>
        {selectedSocialMedia && (
          <article className="pb-4 mx-6 space-y-4 rounded-2xl">
            <div className="relative">
              <input
                maxLength={100}
                value={selectedLink?.link || ""}
                onChange={handleSaveSocialMediaLink}
                placeholder={`Enter ${selectedSocialMedia} link`}
                type="text"
                className="w-full pr-16 rounded-2xl"
              />
              <small className="absolute bottom-3 right-4">
                {selectedLink?.link?.length}/{100}
              </small>
            </div>
          </article>
        )}
      </section>
      <section className="mt-4 opacity-30">
        <SubHeader text="Terms & Condition" />
        <article className="flex items-center justify-between p-4 bg-white rounded-2xl">
          <Paragraph text="Add your terms and conditions here" />
          <IoMdArrowUp size={20} className="rotate-45" />
        </article>
      </section>
    </>
  );
};

const SocialMediaLinks = memo(MemoSocialMediaLinks);
export default SocialMediaLinks;