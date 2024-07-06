"use client";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import type { IThemes } from "@/components/types/businessData";
import { updateTheme } from "@/components/utils/themes";
import Link from "next/link";
import { memo, useEffect } from "react";
import { IoLogoLinkedin, IoLogoYoutube } from "react-icons/io";
import { IoLogoFacebook, IoLogoInstagram } from "react-icons/io5";

interface IFooter {
  themes: IThemes;
}
const Footer = (props: IFooter) => {
  const { themes } = props;

  const customLink = useBusinessDetails((s) => s?.businessDetails?.customLink);

  useEffect(() => {
    updateTheme(themes);
  }, [themes]);

  return (
    <div className="">
      {themes?.footerText && (
        <div className="px-4 text-lg text-justify text-base-100-content">
          {themes?.footerText}
        </div>
      )}
      <section className="flex justify-center px-2 mt-4 space-x-2">
        {themes?.instagramLink && (
          <a
            href={themes?.instagramLink}
            aria-label="instagram"
            className="btn btn-ghost !px-1 !py-0 my-auto"
          >
            <IoLogoInstagram className="my-auto text-3xl text-base-content/80" />
          </a>
        )}
        {themes?.facebookLink && (
          <a
            href={themes?.facebookLink}
            aria-label="facebook"
            className="btn btn-ghost !px-1 !py-0 my-auto"
          >
            <IoLogoFacebook className="my-auto text-3xl text-base-content/80" />
          </a>
        )}
        {themes?.youtubeLink && (
          <a
            href={themes?.youtubeLink}
            aria-label="youtube"
            className="btn btn-ghost !px-1 !py-0 my-auto"
          >
            <IoLogoYoutube className="my-auto text-3xl text-base-content/80" />
          </a>
        )}
        {themes?.linkedinLink && (
          <a
            href={themes?.linkedinLink}
            aria-label="youtube"
            className="btn btn-ghost !px-1 !py-0 my-auto"
          >
            <IoLogoLinkedin className="my-auto text-3xl text-base-content/80" />
          </a>
        )}
      </section>
      <center className="pb-4 my-8 bg-base-300">
        <Link className="text-sm" href={`/${customLink}/terms`}>
          View Terms and Conditions
        </Link>
      </center>
    </div>
  );
};

const MemoFooter = memo(Footer);
export default MemoFooter;
