import SubHeader from "@/components/atom/subHeader";
import { memo, type ChangeEvent } from "react";

interface ISocialMediaLinks {
  selectedSocialMedia: string;
  handleIconClick: (icon: string) => void;
  handleSaveSocialMediaLink: (e: ChangeEvent<HTMLInputElement>) => void;
  socialMediaLinks: {
    _id: number;
    icon: string;
    logo: JSX.Element;
    link: string;
  }[];
}

const MemoSocialMediaLinks = (props: ISocialMediaLinks) => {
  const {
    selectedSocialMedia,
    handleIconClick,
    handleSaveSocialMediaLink,
    socialMediaLinks,
  } = props;
  const selectedLink = socialMediaLinks.find(
    (link) => link.icon === selectedSocialMedia,
  );

  return (
    <>
      <SubHeader text="Social Media Links" />
      <section className="bg-white rounded-2xl">
        <article className="flex items-center justify-between p-6 ">
          {socialMediaLinks.map((link) => (
            <div
              key={link._id}
              onClick={() => handleIconClick(link.icon)}
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
        {selectedSocialMedia.length === 0 ? null : (
          <article className="pb-4 mx-6 space-y-4 rounded-2xl">
            <div className="relative">
              <input
                maxLength={100}
                value={selectedLink ? selectedLink.link : ""}
                onChange={handleSaveSocialMediaLink}
                placeholder={`Enter ${selectedSocialMedia} link`}
                type="text"
                className="w-full pr-16 rounded-2xl"
              />
              <small className="absolute bottom-3 right-4">
                {selectedSocialMedia?.length}/{100}
              </small>
            </div>
          </article>
        )}
      </section>
    </>
  );
};

const SocialMediaLinks = memo(MemoSocialMediaLinks);
export default SocialMediaLinks;
