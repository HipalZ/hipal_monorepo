"use client"
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
	return (
			<div>
				{footerText && (
					<div className="px-4 text-lg text-base-100-content text-justify">
						{footerText}
					</div>
				)}
				<div className="flex flex-row px-2 space-x-2 mt-4">
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
				</div>
			</div>
	)
}

export default memo(Footer)
