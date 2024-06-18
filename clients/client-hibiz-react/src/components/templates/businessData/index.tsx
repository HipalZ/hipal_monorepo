import HipeopleLogo from "@/assets/hibizNewLogo.png";
import Header from "@/components/molecules/header";
import useBusinessData from "@/components/store/useBusinessData";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";
import {
	cardButtons,
	getUpdatedCardButtons,
} from "@/components/types/businessId";
import { memo, startTransition, useCallback, useEffect, useMemo } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Stairs from "@/assets/Stairs.png";

const BusinessData = memo(() => {
	const { setSelectedIcon } = useSelectedIcon();
	const location = useLocation();
	const user = useOwnerLogin((s) => s.user);
	const navigate = useNavigate();
	const { businessId } = useParams<{ businessId: string }>();
	const businessData = useBusinessData((s) => s.businessData);

	const handleNoAccess = useCallback(() => {
		startTransition(() => {
			navigate("/");
		});
	}, [navigate]);
	const updatedCardButtons = useMemo(
		() => getUpdatedCardButtons(cardButtons, user, handleNoAccess),
		[cardButtons, user, handleNoAccess],
	);

	const handleClick = useCallback(
		(text: string) => {
			setSelectedIcon(text);
			const urlFriendlyText = text.toLowerCase().replace(/ /g, "");
			startTransition(() => {
				navigate(`/app/business/${businessId}/${urlFriendlyText}`, {
					replace: true,
				});
			});
		},
		[businessId, navigate],
	);

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		if (params.get("tab") !== "home") {
			params.set("tab", "home");
			startTransition(() => {
				navigate({ search: params.toString() }, { replace: true });
			});
		}
	}, [location, navigate]);

	const handleBack = useCallback(() => {
		startTransition(() => {
			navigate(`/app/business/`);
		});
	}, [navigate]);

	const goToBusinessControl = useCallback(() => {
		startTransition(() => {
			navigate(`/app/business/${businessId}/businessControl`);
		});
	}, [navigate]);

	return (
		<section className="relative">
			<section className="linear_gradient_background">
				<Header
					onBack={handleBack}
					leftIcon={<FaArrowLeft />}
					rightImage={HipeopleLogo}
					isIconBusinessShow={user.role !== "RESTAURANT_MANAGER"}
				/>
				<center className="pb-4 -mt-8 space-y-2">
					<figure className="w-[4rem] h-[4rem] overflow-hidden rounded-full">
						<img
							width={64}
							height={64}
							src={businessData?.logo}
							alt="Business_Logo"
						/>
					</figure>
					<figcaption className="text-xl font-bold capitalize">
						{businessData?.businessName}
					</figcaption>
				</center>
			</section>
			<section onClick={goToBusinessControl} className="business_Control">
				<article className="business_Control_article">
					<h3 className="text-lg font-semibold">Business Control</h3>
					<p>All Controls in one panel</p>
					<button className="px-6 py-2 mt-4 text-white bg-black rounded-3xl">
						Settings
					</button>
				</article>
				<figure className="business_Control_figure">
					<img className="stair_img" src={Stairs} alt="Stairs" />
				</figure>
			</section>
			<div className="business_system_cards">
				{updatedCardButtons
					.filter((ele) => ele?.visible === true)
					.map((item, index) => (
						<div
							onClick={() => handleClick(item?.text)}
							key={index}
							className={`${item?.class?.background} ${item?.class?.opacity} on_active_bounce h-[9rem] space-y-6 rounded-xl border border-[#CACACA] p-4`}
						>
							<div className={"on_active_bounce"}>
								<item.Icon
									className={`${item?.class?.color} ${item?.class?.font} ${item?.class?.bg} rounded-full px-2`}
								/>
							</div>
							<div className={`${item?.class?.text} font-medium`}>
								{item?.text}
							</div>
						</div>
					))}
			</div>
		</section>
	);
});

export default BusinessData;
