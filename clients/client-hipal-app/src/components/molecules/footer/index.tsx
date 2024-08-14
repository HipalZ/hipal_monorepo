"use client";
import type { IThemes } from "@/components/types/businessData";
import { updateTheme } from "@/components/utils/themes";
import Link from "next/link";
import { useParams } from "next/navigation";
import { memo, useEffect } from "react";
import { FaTelegram } from "react-icons/fa";
import {
  IoLogoFacebook,
  IoLogoLinkedin,
  IoLogoTwitter,
  IoLogoYoutube,
} from "react-icons/io5";
import { PiInstagramLogoFill } from "react-icons/pi";
interface IFooter {
  themes: IThemes;
  socialMediaLinks: { _id: string; icon: string; link: string }[] | undefined;
  footerDescription: string | undefined;
}

const iconMapping: { [key: string]: JSX.Element } = {
  instagram: (
    <PiInstagramLogoFill className="my-auto text-3xl text-base-content" />
  ),
  facebook: <IoLogoFacebook className="my-auto text-3xl text-base-content" />,
  twitter: <IoLogoTwitter className="my-auto text-3xl text-base-content" />,
  telegram: <FaTelegram className="my-auto text-3xl text-base-content" />,
  linkedin: <IoLogoLinkedin className="my-auto text-3xl text-base-content" />,
  youtube: <IoLogoYoutube className="my-auto text-3xl text-base-content" />,
};

const Footer = (props: IFooter) => {
  const { themes, socialMediaLinks } = props;
  const customLink = useParams()?.businessId as string;

  useEffect(() => {
    updateTheme(themes);
  }, [themes]);

  return (
    <div className="">
      {/* {footerDescription ? (
        <div className="px-4 text-sm text-left text-base-100-content">
          {footerDescription}
        </div>
      ) : null} */}
      <section className="flex justify-center px-2 mt-8 space-x-2">
        {socialMediaLinks
          ? socialMediaLinks.map(({ _id, icon, link }) => (
              <a
                key={_id}
                href={link}
                aria-label={icon}
                className="btn btn-ghost !px-1 !py-0 my-auto"
              >
                {iconMapping[icon]}
              </a>
            ))
          : null}
      </section>
      <section className="flex items-center justify-center h-12 text-base-content underline-offset-2">
        <Link className="text-sm" href={`/${customLink}/terms`}>
          View Terms and Conditions
        </Link>
      </section>
    </div>
  );
};

const MemoFooter = memo(Footer);
export default MemoFooter;
