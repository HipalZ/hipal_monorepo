import facebook from "@/assets/socialMedia/fb.png";
import instagram from "@/assets/socialMedia/instagram.png";
import telegram from "@/assets/socialMedia/telegram.png";
import twitter from "@/assets/socialMedia/twitter.png";
import website from "@/assets/socialMedia/website.png";
import youtube from "@/assets/socialMedia/youtube.png";
import type { BusinessDetails } from "@/components/types/businessData";
import Image, { type StaticImageData } from "next/image";

type SocialMediaLink = BusinessDetails["socialMediaLinks"][number];

const socialIconMap: Record<string, StaticImageData> = {
  facebook,
  fb: facebook,
  instagram,
  twitter,
  x: twitter,
  telegram,
  youtube,
  website,
  web: website,
};

const normalizeIconKey = (icon?: string) =>
  icon?.trim().toLowerCase().replace(/\s+/g, "") ?? "";

const normalizeUrl = (url?: string) => {
  const trimmedUrl = url?.trim();
  if (!trimmedUrl) return "";
  if (/^https?:\/\//i.test(trimmedUrl)) return trimmedUrl;
  return `https://${trimmedUrl}`;
};

interface HotelCheckinFooterProps {
  socialMediaLinks?: SocialMediaLink[];
}

export default function HotelCheckinFooter({
  socialMediaLinks,
}: HotelCheckinFooterProps) {
  const links = (socialMediaLinks ?? [])
    .map((item) => {
      const iconKey = normalizeIconKey(item.icon);
      const url = normalizeUrl(item.link);
      const icon = socialIconMap[iconKey];
      return icon && url ? { icon, iconKey, url } : null;
    })
    .filter(
      (item): item is { icon: StaticImageData; iconKey: string; url: string } =>
        Boolean(item)
    );

  if (links.length === 0) return null;

  return (
    <footer className="px-2 pb-7 pt-2 plus-jakarta-font">
      <div className="rounded-2xl bg-white/50 px-4 py-4 text-center backdrop-blur-md">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#8A756B]">
          Follow us on
        </p>
        <div className="mt-3 flex items-center justify-around gap-3">
          {links.map(({ icon, iconKey, url }) => (
            <a
              key={`${iconKey}-${url}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Follow us on ${iconKey}`}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#EEE7E1] bg-white shadow-[0_8px_18px_rgba(47,35,27,0.08)] transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
            >
              <Image
                src={icon}
                alt=""
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
              />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
