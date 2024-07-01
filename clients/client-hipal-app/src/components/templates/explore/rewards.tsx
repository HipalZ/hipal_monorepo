import { useLogin } from "@/components/store/useLogin";
import React, { memo } from "react";
import styles from "./reward.module.css";
import RewardsImg from "@/assets/payment/Rewards.png";
import Wallet from "@/assets/payment/Waller.png";
import Couponz from "@/assets/payment/Couponz.png";
import Backgrid from "@/assets/payment/backgrid";
import Image from "next/image";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import Link from "next/link";

const RewardCard = ({
	bgColor,
	title,
	imgSrc,
	imgAlt,
	buttonContent,
	gridColor,
}) => (
	<center className={`${styles.reward_card} ${bgColor} on_active_bounce`}>
		<center className={styles.reward_card_text}>{title}</center>
		<figure className={styles.reward_card_grid}>
			<Backgrid color={gridColor} />
		</figure>
		<figure className={styles.reward_card_image}>
			<Image src={imgSrc} width={90} height={90} alt={imgAlt} />
		</figure>
		<button className={`${styles.reward_card_button}`}>{buttonContent}</button>
	</center>
);

const Rewards = memo(() => {
	const { userDetails, userCoinZ } = useLogin();
	const customLink = useBusinessDetails((s) => s.businessDetails.customLink);

	return (
		<div className="h-[18rem]">
			<h3 className="pt-6 pl-4 text-xl text-Primary">
				👋 Hi {userDetails.name}
			</h3>
			<section className={styles.reward_card_container}>
				<Link href={`/${customLink}/loyalty`} className="w-full">
					<RewardCard
						bgColor="bg-[#F5D14E]"
						title="Reward"
						imgSrc={RewardsImg}
						imgAlt="rewards"
						buttonContent="Explore"
						gridColor="#000"
					/>
				</Link>
				<Link href={`/${customLink}/loyalty`} className="w-full">
					<RewardCard
						bgColor="bg-[#5227CA]"
						title="Wallet"
						imgSrc={Wallet}
						imgAlt="wallet"
						buttonContent={`🪙${userCoinZ}`}
						gridColor="#ffffff60"
					/>
				</Link>
				<Link href={`/${customLink}/loyalty`} className="w-full">
					<RewardCard
						bgColor="bg-[#CA2727]"
						title="CouponZ"
						imgSrc={Couponz}
						imgAlt="couponz"
						buttonContent="Coming soon"
						gridColor="#000"
					/>
				</Link>
			</section>
		</div>
	);
});

export default memo(Rewards);
