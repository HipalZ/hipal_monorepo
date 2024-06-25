import { useLogin } from '@/components/store/useLogin'
import React, { memo, useRef } from 'react'
import styles from "./reward.module.css"
import RewardsImg from '@/assets/payment/Rewards.png'
import Wallet from '@/assets/payment/Waller.png'
import Couponz from '@/assets/payment/Couponz.png'
import Backgrid from '@/assets/payment/backgrid'
import Image from 'next/image'
import { useInView } from 'framer-motion'

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

    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    const handleRewardClick = () => {
        console.log('reward')
    }

    const handleWalletClick = () => {
        console.log('wallet')
    }

    const handleCouponClick = () => {
        console.log('coupon')
    }

    return (
        <div className='h-[18rem] bg-black'>
            <h3 className='pt-6 pl-4 text-xl text-white'>
                👋 Hi {userDetails.name}
            </h3>
            <section className={isInView ? styles.reward_card_container : styles.reward_card_container_animation}>
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
                    buttonContent="🪙 225"
                    gridColor="#ffffff60"
                    onClick={handleWalletClick}
                />
                <RewardCard
                    bgColor="bg-[#CA2727]"
                    title="CouponZ"
                    imgSrc={Couponz}
                    imgAlt="couponz"
                    buttonContent="Claim now"
                    gridColor="#000"
                    onClick={handleCouponClick}
                />
            </section>
        </div>
    )
})

export default memo(Rewards)
