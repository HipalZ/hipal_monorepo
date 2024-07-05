"use client"
import useBusinessDetails from "@/components/store/useBusinessDetails";
import Link from "next/link";
import { memo } from "react"
import { IoLogoLinkedin, IoLogoYoutube } from "react-icons/io"
import { IoLogoFacebook, IoLogoInstagram } from "react-icons/io5"

interface IFooter{
	footerText:string;
	instagramLink:string;
	facebookLink:string;
	youtubeLink:string;
	linkedinLink:string;
}
const Footer=(props:IFooter) =>{
	const { footerText, instagramLink, facebookLink, linkedinLink, youtubeLink } = props;
	const customLink = useBusinessDetails((s) => s?.businessDetails?.customLink);
	return (
			<div>
				{footerText && (
					<div className="px-4 text-lg text-justify text-base-100-content">
						{footerText}
					</div>
				)}
				<section className="flex flex-row px-2 space-x-2 ">
					{instagramLink && (
						<a
							href={instagramLink}
							aria-label="instagram"
							className="btn btn-ghost !px-1 !py-0 my-auto"
						>
							<IoLogoInstagram className="my-auto text-3xl text-base-content/80" />
						</a>
					)}
					{facebookLink && (
						<a
							href={facebookLink}
							aria-label="facebook"
							className="btn btn-ghost !px-1 !py-0 my-auto"
						>
							<IoLogoFacebook className="my-auto text-3xl text-base-content/80" />
						</a>
					)}
					{youtubeLink && (
						<a
							href={youtubeLink}
							aria-label="youtube"
							className="btn btn-ghost !px-1 !py-0 my-auto"
						>
							<IoLogoYoutube className="my-auto text-3xl text-base-content/80" />
						</a>
					)}
					{linkedinLink && (
						<a
							href={linkedinLink}
							aria-label="youtube"
							className="btn btn-ghost !px-1 !py-0 my-auto"
						>
							<IoLogoLinkedin className="my-auto text-3xl text-base-content/80" />
						</a>
					)}
				</section>
				<center className="pb-4 mt-4 bg-base-300">

				<Link className="text-sm" href={`/${customLink}/terms`}>
					View Terms and Conditions
				</Link>
				</center>
			</div>
	)
}

const MemoFooter = memo(Footer)
export default MemoFooter
