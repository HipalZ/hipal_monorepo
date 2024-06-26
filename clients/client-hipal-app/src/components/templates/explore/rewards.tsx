import { useLogin } from '@/components/store/useLogin'
import React, { memo, useCallback } from 'react'
import styles from "./reward.module.css"
import RewardsImg from '@/assets/payment/Rewards.png'
import Wallet from '@/assets/payment/Waller.png'
import Couponz from '@/assets/payment/Couponz.png'
import Backgrid from '@/assets/payment/backgrid'
import Image from 'next/image'
import useLoyaltyData from '@/components/store/useLoyaltyData'

const RewardCard = ({ bgColor, title, imgSrc, imgAlt, buttonContent, gridColor, onClick }) => (
    <center className={`${styles.reward_card} ${bgColor}`} >
        <center className={styles.reward_card_text}>{title}</center>
        <figure className={styles.reward_card_grid}>
            <Backgrid color={gridColor} />
        </figure>
        <figure className={styles.reward_card_image}>
            <Image src={imgSrc} width={90} height={90} alt={imgAlt} />
        </figure>
        <button className={`${styles.reward_card_button}`} onClick={onClick}>{buttonContent}</button>
    </center>
)


const Rewards = memo(() => {
    const userDetails = useLogin((s) => s.userDetails)
    const loyaltySetting = useLoyaltyData((s) => s.loyaltySetting)
    const handleRewardClick = useCallback(() => {
        console.log('reward')
    },[])

    const handleWalletClick = useCallback(() => {
        console.log('wallet')
    },[])

    const handleCouponClick = useCallback(() => {
        console.log('coupon')
    },[])

    return (
        <div className='h-[18rem] bg-primary/80'>
            <h3 className='pt-6 pl-4 text-xl text-base-100'>
                👋 Hi {userDetails.name}
            </h3>
            <section className={styles.reward_card_container}>
                <RewardCard
                    bgColor="bg-[#F5D14E]"
                    title="Reward"
                    imgSrc={RewardsImg}
                    imgAlt="rewards"
                    buttonContent="Explore"
                    gridColor="#000"
                    onClick={handleRewardClick}
                />
                <RewardCard
                    bgColor="bg-[#5227CA]"
                    title="Wallet"
                    imgSrc={Wallet}
                    imgAlt="wallet"
                    buttonContent={`🪙${loyaltySetting?.setReward}`}
                    gridColor="#ffffff60"
                    onClick={handleWalletClick}
                />
                <RewardCard
                    bgColor="bg-[#CA2727]"
                    title="CouponZ"
                    imgSrc={Couponz}
                    imgAlt="couponz"
                    buttonContent="Coming soon"
                    gridColor="#000"
                    onClick={handleCouponClick}
                />
            </section>
        </div>
    )
})

export default memo(Rewards)
