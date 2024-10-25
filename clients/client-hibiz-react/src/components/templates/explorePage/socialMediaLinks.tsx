import { useExploreStore } from "@/components/store/useExploreStore";
import type { SocialMediaLink } from "@/components/types/businessData";
import { lazy, memo, useCallback, useMemo, type ChangeEvent } from "react";
import { IoMdArrowUp } from "react-icons/io";

const Paragraph = lazy(() => import("@/components/atom/paragraph"));
const SubHeader = lazy(() => import("@/components/atom/subHeader"));
interface Props {
  handleSaveSocialMediaLink: (e: ChangeEvent<HTMLInputElement>) => void;
  socialMediaLinks: SocialMediaLink[];
}

const MemoSocialMediaLinks = ({
  handleSaveSocialMediaLink,
  socialMediaLinks,
}: Props) => {
  const { selectedSocialMedia, setSelectedSocialMedia } = useExploreStore(
    (s) => ({
      selectedSocialMedia: s.selectedSocialMedia,
      setSelectedSocialMedia: s.setSelectedSocialMedia,
    }),
  );

  const handleIconClick = useCallback((icon: string) => {
    setSelectedSocialMedia(icon);
  }, []);

  const selectedLink = useMemo(() => {
    return socialMediaLinks.find((link) => link.icon === selectedSocialMedia);
  }, [socialMediaLinks, selectedSocialMedia]);

  return (
    <>
      <SubHeader text="Social Media Links" />
      <section className="bg-white rounded-2xl">
        <article className="flex items-center justify-between p-6">
          {socialMediaLinks.map((link) => (
            <div
              key={link._id}
              onClick={() => handleIconClick(link.icon)}
              onKeyDown={() => handleIconClick(link.icon)}
              className={`${
                selectedSocialMedia === link.icon
                  ? "bg-black text-white"
                  : "bg-gray-100"
              } h-10 w-10 rounded-full flex justify-center items-center`}
            >
              {link.logo}
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
                {selectedLink?.link.length}/{100}
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
