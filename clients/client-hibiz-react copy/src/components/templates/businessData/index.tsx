import HipeopleLogo from "@/assets/hibizNewLogo.png";
import Header from "@/components/molecules/header";
import useBusinessData from "@/components/store/useBusinessData";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";
import {
	ILiteVersionCardButton,
	cardButtons,
	getUpdatedCardButtons,
	liteVersionCardButtons,
} from "@/components/types/businessId";
import { memo, startTransition, useCallback, useEffect, useMemo } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Stairs from "@/assets/Stairs.png";
import { RiGhost2Line } from "react-icons/ri";

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

			{
				businessData?.withPopCorn && <section onClick={goToBusinessControl} className="business_Control">
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
			}
			{
				businessData?.withPopCorn && (
					<>
						<h3 className="px-4 pt-4 text-2xl">
							Shortcuts
						</h3>
						<section className="business_system_cards">
							{
								liteVersionCardButtons.map((item: ILiteVersionCardButton) => (
									<article onClick={() => handleClick(item?.navigateTo)} key={item.text} className="relative overflow-hidden rounded-2xl ">
										<figure>
											<img width={200} height={146} src={item.image} alt={item.text} />
										</figure>
										<figcaption className="absolute bottom-0 left-0 p-2 w-full bg-[#F6E9E2] h-[55%]">
											<section className="flex items-center justify-between">
												<h4 className="font-semibold leading-4 text-black">{item.text}</h4>
												<FaArrowRight />
											</section>
											<small className="opacity-50">{item.description}</small>
										</figcaption>
									</article>
								))
							}
						</section>
					</>

				)
			}
			{
				!businessData?.withPopCorn &&
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
			}
		</section>
	);
});

export default BusinessData;
