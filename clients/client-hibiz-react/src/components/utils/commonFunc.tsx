import { useEffect, useState } from "react";
import { BsInstagram } from "react-icons/bs";
import { CiFacebook } from "react-icons/ci";
import { FaXTwitter } from "react-icons/fa6";
import { RiDiscordLine } from "react-icons/ri";
import { TbBrandTelegram } from "react-icons/tb";
import { useExploreStore } from "../store/useExploreStore";

export const useSocialMediaLinks = () => {
  const { selectedSocialMedia } = useExploreStore((s) => ({
    selectedSocialMedia: s.selectedSocialMedia,
  }));

  const [socialMediaLinks, setSocialMediaLinks] = useState([
    { _id: 1, icon: "instagram", logo: <BsInstagram size={30} />, link: "" },
    { _id: 2, icon: "facebook", logo: <CiFacebook size={36} />, link: "" },
    { _id: 3, icon: "twitter", logo: <FaXTwitter size={30} />, link: "" },
    { _id: 4, icon: "telegram", logo: <TbBrandTelegram size={30} />, link: "" },
    { _id: 5, icon: "discord", logo: <RiDiscordLine size={36} />, link: "" },
  ]);

  const updateSocialMediaLinks = (response) => {
    setSocialMediaLinks((prevLinks) =>
      prevLinks.map((link) => {
        const matchingLink = response?.socialMediaLinks?.find(
          (media) => media.icon === link.icon,
        );
        return matchingLink ? { ...link, link: matchingLink.link } : link;
      }),
    );
  };

  const saveSocialMediaLink = (newLink) => {
    console.log("New Link:", newLink);
    setSocialMediaLinks((prev) => {
      console.log("Previous State:", prev);
      const updatedLinks = prev.map((link) => {
        console.log("Current Link:", link);
        if (link.icon === selectedSocialMedia) {
          console.log("Selected Social Media:", selectedSocialMedia);
          console.log("Updating Link:", { ...link, link: newLink });
          return { ...link, link: newLink };
        }
        return link;
      });
      console.log("socialMediaLinks", socialMediaLinks);
      return updatedLinks;
    });
  };

  return { socialMediaLinks, updateSocialMediaLinks, saveSocialMediaLink };
};
