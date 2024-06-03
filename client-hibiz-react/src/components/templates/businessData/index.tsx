import { AiFillHeart } from "react-icons/ai";
import { BsChevronLeft, BsCurrencyRupee } from "react-icons/bs";
import { BsFillPersonFill } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import { GiCampCookingPot } from "react-icons/gi";
import { GoGraph } from "react-icons/go";
import { IoReceiptOutline } from "react-icons/io5";
import { LuConciergeBell, LuSettings } from "react-icons/lu";
import { MdCardMembership } from "react-icons/md";
import { MdReviews } from "react-icons/md";
import { memo, startTransition, useEffect } from "react";
import { PiBookOpenText } from "react-icons/pi";
import { SiSwiggy } from "react-icons/si";
import { SiZomato } from "react-icons/si";
import { TbReportAnalytics } from "react-icons/tb";
import { toast } from "react-toastify";
import { type User, useOwnerLogin } from "@/components/store/useOwnerLogin";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";
import Carousal from "@/assets/svg/carousalImage.svg";
import Carousel from "@/components/atom/carousel";
import Header from "@/components/molecules/header";
import HipeopleLogo from "@/assets/svg/hiBizlogo.svg";
import type React from "react";
import useBusinessData from "@/components/store/useBusinessData";

const images = [Carousal, Carousal];

interface ICardButton {
	Icon: React.ElementType;
	text: string;
	class: {
		background: string;
		text: string;
		font: string;
		bg: string;
		color: string;
		opacity?: string;
	};
	visible: boolean;
}

const cardButtons: ICardButton[] = [
	{
		Icon: BsCurrencyRupee,
		text: "Sales",
		class: {
			text: "text-xl",
			background: "bg-white",
			font: "text-4xl",
			bg: "bg-[#2F80ED]/10",
			color: "text-[#2F80ED]",
		},
		visible: true,
	},
	{
		Icon: AiFillHeart,
		text: "Loyalty",
		class: {
			text: "text-xl",
			background: "bg-white",
			font: "text-4xl",
			bg: "bg-[#2B354D]/10",
			color: "text-[#2B354D]",
		},
		visible: true,
	},
	{
		Icon: IoReceiptOutline,
		text: "Items",
		class: {
			text: "text-xl",
			background: "bg-white",
			font: "text-4xl",
			bg: "bg-[#2B354D]/10",
			color: "text-[#2B354D]",
		},
		visible: true,
	},
	{
		Icon: BsFillPersonFill,
		text: "Staff",
		class: {
			text: "text-xl",
			background: "bg-white",
			font: "text-4xl",
			bg: "bg-[#7879F1]/10",
			color: "text-[#7879F1]",
		},
		visible: true,
	},
	{
		Icon: GoGraph,
		text: "Analytics",
		class: {
			text: "text-xl",
			background: "bg-white",
			font: "text-4xl",
			bg: "bg-[#7879F1]/10",
			color: "text-[#7879F1]",
		},
		visible: true,
	},
	{
		Icon: TbReportAnalytics,
		text: "Reports",
		class: {
			text: "text-xl",
			background: "bg-white",
			font: "text-4xl",
			bg: "bg-[#2B354D]/10",
			color: "text-[#2B354D]",
		},
		visible: true,
	},
	{
		Icon: MdCardMembership,
		text: "Taxes and charges",
		class: {
			text: "text-xl",
			background: "bg-white",
			font: "text-4xl",
			bg: "bg-[#FEA844]/10",
			color: "text-[#FEA844]",
		},
		visible: true,
	},

	{
		Icon: LuSettings,
		text: "Settings",
		class: {
			text: "text-xl",

			background: "bg-white",
			font: "text-4xl",
			bg: "bg-[#2B354D]/10",
			color: "text-[#2B354D]",
		},
		visible: true,
	},
	{
		Icon: SiSwiggy,
		text: "Swiggy",
		class: {
			text: "text-xl",
			background: "bg-white",
			font: "text-4xl",
			bg: "bg-[#fc8019]/10",
			color: "text-[#fc8019]",
		},
		visible: false,
	},
	{
		Icon: SiZomato,
		text: "Zomato",
		class: {
			text: "text-xl",
			background: "bg-white",
			font: "text-5xl",
			bg: "bg-[#cb202d]/10",
			color: "text-[#cb202d]",
		},
		visible: false,
	},
	{
		Icon: LuConciergeBell,
		text: "Dine-In",
		class: {
			text: "text-xl",
			background: "bg-zinc-300",
			font: "text-4xl",
			bg: "bg-[#F2994A]/10",
			color: "text-[#F2994A]",
			opacity: "opacity-50",
		},
		visible: false,
	},
	{
		Icon: GiCampCookingPot,
		text: "Kitchen",
		class: {
			text: "text-xl",
			background: "bg-zinc-300",
			font: "text-4xl",
			bg: "bg-[#2B354D]/10",
			color: "text-[#2B354D]",
			opacity: "opacity-50",
		},
		visible: false,
	},
	{
		Icon: PiBookOpenText,
		text: "Zones And Tables",
		class: {
			text: "text-xl",
			background: "bg-white",
			font: "text-4xl",
			bg: "bg-[#2B354D]/10",
			color: "text-[#2B354D]",
		},
		visible: true,
	},
	{
		Icon: TbReportAnalytics,
		text: "Kitchen",
		class: {
			text: "text-xl",
			background: "bg-white",
			font: "text-4xl",
			bg: "bg-[#2B354D]/10",
			color: "text-[#2B354D]",
		},
		visible: true,
	},
	{
		Icon: FaUser,
		text: "Customerz",
		class: {
			text: "text-xl",
			background: "bg-white",
			font: "text-4xl",
			bg: "bg-[#F2994A]/10",
			color: "text-[#2B354D]",
		},
		visible: true,
	},
	{
		Icon: MdReviews,
		text: 'Reviewz',
		class: {
			text: "text-xl",
			background: "bg-white",
			font: "text-4xl",
			bg: "bg-[#2B354D]/10",
			color: "text-[#2B354D]",
		},
		visible: true,
	}
];
interface AccessControlMapping {
	[key: string]: string;
}

const BusinessData = memo(() => {
	const { setSelectedIcon } = useSelectedIcon();
	const location = useLocation()
	const user = useOwnerLogin((s) => s.user);
	const navigate = useNavigate();
	const { businessId } = useParams<{ businessId: string }>()
	const businessData = useBusinessData((s) => s.businessData);
	const accessControlMapping: AccessControlMapping = {
		dish: "Items",
		staff: "Staff",
		loyalty: "Loyalty",
		sale: "Sales",
		reports: "Reports",
		zones_tables: "Zones And Tables",
	};

	const getUpdatedCardButtons = (cards: ICardButton[], user: User) => {
		if (user.role !== "RESTAURANT_MANAGER") {
			return cards.map((card: ICardButton) => ({ ...card }));
		}
		if (user.accessControl === undefined || Object.keys(user.accessControl).length === 0) {
			toast.error('You do not have access to this business')
			localStorage.removeItem("ownerLogin")
			startTransition(() => {
				navigate("/")
			})
		}
		return cards.map((card: ICardButton) => {
			const hasAccess = user.accessControl && Object?.entries(user.accessControl).some(
				([key, value]) => {
					const permissionName = accessControlMapping?.[key];
					return permissionName === card.text && value;
				},
			);
			return {
				...card,
				visible: hasAccess,
			};
		});
	};

	const updatedCardButtons = getUpdatedCardButtons(cardButtons, user);

	const handleClick = async (text: string) => {
		setSelectedIcon(text);
		const urlFriendlyText = text.toLowerCase().replace(/ /g, '');
		startTransition(() => {
			navigate(`/app/business/${businessId}/${urlFriendlyText}`, { replace: true });
		});
	};

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		if (params.get('tab') !== 'home') {
			params.set('tab', 'home');
			startTransition(() => {
				navigate({ search: params.toString() }, { replace: true });
			});
		}
	}, [location, navigate]);

	const handleBack = () => {
		startTransition(() => {
			navigate(`/app/business/`)
		})
	}

	return (
		<div className="bg-[#f5f5f5] relative min-h-screen px-0 md:px-[10vw] lg:px-[10vw]">
			<div className="sticky top-0 w-full z-10 bg-[#f5f5f5] pb-0 lg:pb-0 px-0">
				<Header
					onBack={handleBack}
					leftIcon={<BsChevronLeft />}
					centerImage={HipeopleLogo}
					rightImage={HipeopleLogo}
					isIconBusinessShow={user.role !== "RESTAURANT_MANAGER"}
				/>
				<div className="pt-6">
					<Carousel images={images} />
				</div>
				<div className="mt-4 ml-6 text-2xl md:mt-6 lg:mt-16 xl:mt-24">
					{businessData?.businessName}
				</div>
			</div>
			<div className="grid grid-cols-2 gap-4 pb-12 mx-6 mt-5 lg:pb-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
				{updatedCardButtons
					.filter((ele) => ele?.visible === true)
					.map((item, index) => (
						<div
							onClick={() => handleClick(item?.text)}
							key={index}
							className={`${item?.class?.background} ${item?.class?.opacity} h-[9rem] rounded-xl border p-4 on_active_bounce border-[#CACACA] space-y-6`}
						>
							<div className={"on_active_bounce"}>
								{item?.text === "Swiggy" ? (
									<div
										className={`${item?.class?.color} ${item?.class?.bg} text-xl w-10 h-10 p-2 flex justify-center items-center rounded-full`}
									>
										S
									</div>
								) : item?.text === "Zomato" ? (
									<div
										className={`${item?.class?.color} ${item?.class?.bg} text-xl w-10 h-10 p-2 flex justify-center items-center rounded-full`}
									>
										Z
									</div>
								) : (
									<item.Icon
										className={`${item?.class?.color} ${item?.class?.font} ${item?.class?.bg} px-2 rounded-full`}
									/>
								)}
							</div>
							<div className={`${item?.class?.text} font-medium`}>
								{item?.text}
							</div>
						</div>
					))}
			</div>
		</div>
	);
})

export default BusinessData
