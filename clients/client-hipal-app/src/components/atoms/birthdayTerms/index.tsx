"use client";
import { memo, useCallback } from "react"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react";
import Image from "next/image"
import foodImage from "@/assets/birthday/foodImage.png"
import spark from "@/assets/birthday/spark.png"
import HappyBirthday from "@/assets/birthday/happyBirthday.png"
import useBusinessDetails from "@/components/store/useBusinessDetails";
import { useLogin } from "@/components/store/useLogin"
import type { birthdayEvents } from "@/components/types/businessData";
import { useBirthday } from "@/components/store/useBirthday";
import Link from "next/link";
import { formatDate } from "@/components/utils/helpers";

const MemoBirthdayTerm = ({ events }: { events: birthdayEvents[] }) => {
    const { setOpenModal } = useBirthday()
    const userDetails = useLogin((s) => s.userDetails)
    const logoUrl = useBusinessDetails((s) => s.businessDetails?.logoUrl)

    const shareYourDob = useCallback(() => {
        setOpenModal(true)
    }, [setOpenModal])

    return (
        <main className="min-h-screen pb-[5rem]">
            <center className="relative w-full h-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#9E725575] to-[#9E725550] z-10 pointer-events-none" />
                <Link href="/explore" className="px-3 py-1 absolute left-4 top-4 bg-white rounded-lg z-20">
                    <ArrowLeft size={16} color="black" />
                </Link>
                <center className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
                    <Image src={logoUrl} alt="logoUrl" width={132} height={132} className="rounded-full" />
                </center>
                <Image src={spark} alt="spark" className="absolute transform -translate-x-1/2 -translate-y-1/2 left-1/2 -bottom-10 z-20 mix-blend-lighten" />
                <Image src={foodImage} alt="Food Image" className="w-full h-full object-cover" />
                <div className="relative w-full -mt-40 z-20">
                    <div className="w-full h-[150px] bg-white rounded-t-[150%] scale-110" />
                </div>
                <Image src={HappyBirthday} alt="HappyBirthday" className="absolute transform -translate-x-1/2 -translate-y-1/2 left-1/2 bottom-20 z-20" />
                <center style={{ transform: "rotate(-6deg)" }} className="flex items-center justify-center w-full absolute bottom-20 z-20">
                    <span className="text-center text-4xl dotgothic16-regular text-[#F51BAD]">{userDetails?.name}</span>
                </center>
                <center className="flex items-center justify-center w-full absolute bottom-8 z-20">
                    <span className="text-center text-md text-[#F51BAD]">{formatDate(userDetails?.dob)}</span>
                </center>
            </center>
            <div className="bg-white">
                {/* Banner */}
                {events?.map((offer, index) => (
                    <motion.div
                        key={index?.toString()}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 mx-2 border-b border-gray-200"
                    >
                        <section className="flex justify-between items-center gap-4 poppins">
                            <article className="space-y-1">
                                <h3 className="text-sm font-bold text-[#6944E7]">{offer?.title}</h3>
                                <h4 className="text-[0.95rem] font-bold text-black">{offer?.heading}</h4>
                                <p className="w-[80%] text-xs text-[#848484]">{offer?.description}</p>
                            </article>
                            <Image src={offer.image} alt={offer.title} width={85} height={85} />
                        </section>
                    </motion.div>
                ))}
            </div>
            {!userDetails?.dob ? <article onClick={shareYourDob} className="z-50 text-center transform -translate-x-1/2 -translate-y-1/2 left-1/2 fixed bottom-0 bg-[#5117CD] text-white w-[85%] rounded-full px-3 py-2">
                <button type="button">
                    Share Your DOB
                </button>
            </article> : null}
        </main >
    )
}

const BirthdayTerm = memo(MemoBirthdayTerm)
export default BirthdayTerm

