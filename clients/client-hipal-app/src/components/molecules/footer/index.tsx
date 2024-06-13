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
const Footer=memo((props:IFooter) =>{
	const { footerText, instagramLink, facebookLink, linkedinLink, youtubeLink } = props;
	return (
			<div className="flex flex-col space-y-4 ">
				{footerText && (
					<div className="px-4 text-lg mt-[1rem] text-base-100-content">
						{footerText}
					</div>
				)}

				<div className="flex flex-row px-2 space-x-2 ">
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
				<div className="flex flex-col px-6 py-5 bg-base-300">
					<span className="mx-auto mb-auto text-sm font-bold tracking-wider text-base-content">
						Copyright by Paltribe
					</span>
				</div>
			</div>
	)
})

export default Footer
