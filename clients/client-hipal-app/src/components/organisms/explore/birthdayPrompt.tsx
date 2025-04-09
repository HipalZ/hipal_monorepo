"use client";
import { memo, useState } from "react";
import { triggerConfettiBlast } from "@/components/utils/helpers";
import { motion } from "framer-motion"
import { PartyPopper, Calendar, ChevronDown, Check } from "lucide-react"
import { useBirthday } from "@/components/store/useBirthday"
import { useLogin } from "@/components/store/useLogin";
import { useMutation } from "@tanstack/react-query";
import Baloons from "./birthday/baloons";
import { months, useBirthdayApi, useValidateDate } from "@/components/utils/birthdayHelper";
import Lottie from 'lottie-react'
import lottieBirthday from "@/assets/lottie/birthday.json";
import Link from "next/link";
import { useParams } from "next/navigation";
import { _useAllBusiness } from "@/components/store/useAllBusiness";

function MemoBirthdayPrompt() {
    const userId = useLogin((s) => s.userDetails?._id);
    const birthdayTriggerCount = useLogin((s) => s.userDetails?.birthdayTriggerCount);
    const params = useParams()
    const customLink = params.businessId
    const { validateDate } = useValidateDate()
    const [openBlast, setOpenBlast] = useState(false)
    const {
        isOpen,
        setIsOpen,
        day,
        setDay,
        month,
        setMonth,
        year,
        setYear,
        isValid,
        setIsValid,
        errorMessage,
        monthOpen,
        setMonthOpen,
        setOpenModal,
    } = useBirthday()
    const { updateBirthday } = useBirthdayApi()

    const { mutateAsync } = useMutation({
        mutationFn: updateBirthday,
        onSuccess: () => {
            setIsOpen(false)
            setOpenBlast(true)
            setTimeout(() => {
                setOpenModal(false)
            }, 5000);
        }
    })

    const handleCelebrate = () => {
        if (!validateDate()) return

        setIsOpen(true)
        const monthIndex = months.indexOf(month);

        // Convert to timestamp
        const selectedDate = new Date(Number(year), monthIndex, Number(day));
        const timestamp = selectedDate.getTime();
        console.log("Timestamp:", timestamp);
        triggerConfettiBlast();
        setTimeout(triggerConfettiBlast, 1000);
        setTimeout(triggerConfettiBlast, 2000);
        mutateAsync({ timestamp, userId });
    }

    const closePrompt = () => {
        setIsOpen(false)
        setOpenModal(false)
        mutateAsync({ timestamp: 0, userId, birthdayTriggerCount: (birthdayTriggerCount ?? 0) + 1 });
    }

    return (
        <div
            id="my_modal_1"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2"
        >
            <Baloons />
            {/* Card */}
            <motion.div
                className="relative w-full max-w-md"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className={`bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl shadow-2xl transform transition-all duration-700 ease-out ${isOpen ? "scale-90" : "scale-100"}`}
                    animate={{
                        y: isOpen ? -20 : 0,
                        rotateY: isOpen ? 5 : 0,
                        rotateX: isOpen ? -5 : 0,
                    }}
                >
                    {/* Content */}
                    {openBlast ? <motion.div initial={{ x: 0, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                        <article className="h-full p-3 m-auto">
                            <Lottie
                                animationData={lottieBirthday}
                                loop={true}
                                style={{
                                    height: "150px",
                                    cursor: "pointer",
                                }}
                            />
                            <center className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-yellow-300 tracking-tight">
                                Congratulations!! <br /><span className="text-lg">You won 50 Coinz</span>
                            </center>
                        </article>
                    </motion.div> : <div className="p-4 relative z-10 space-y-5">
                        <div className="flex justify-between items-start">
                            <motion.div initial={{ x: 0, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                                <article>
                                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-yellow-300 tracking-tight">
                                        Claim Birthday & Earn Rewards!
                                    </h2>
                                    <button onClick={closePrompt} type="button" className="absolute text-white p-2 underline underline-offset-1 top-0 right-0">Skip</button>
                                </article>
                                <p className="text-purple-200 mt-1">It's time to celebrate YOU!</p>
                            </motion.div>

                            <motion.div
                                initial={{ rotate: -20, scale: 0 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ delay: 0.3, type: "spring" }}
                            >
                                <PartyPopper className="h-10 w-10 text-yellow-300 mt-10" />
                            </motion.div>
                        </div>

                        {/* Birthday Input Fields */}
                        <motion.div
                            className="space-y-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="flex items-center gap-2 text-purple-200">
                                <Calendar className="h-5 w-5" />
                                <h3 className="font-medium">When's your birthday?</h3>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {/* Day input */}
                                <div>
                                    <label htmlFor="day" className="sr-only">
                                        Day
                                    </label>
                                    <input
                                        type="text"
                                        id="day"
                                        placeholder="DD"
                                        maxLength={2}
                                        value={day || ""}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, "").slice(0, 2)
                                            setDay(value)
                                            setIsValid(true)
                                        }}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                                    />
                                </div>

                                {/* Month dropdown */}
                                <div className="relative">
                                    <label htmlFor="month" className="sr-only">
                                        Month
                                    </label>
                                    <div
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white flex items-center justify-between cursor-pointer"
                                        onClick={() => setMonthOpen(!monthOpen)}
                                    >
                                        <span className={month ? "text-white" : "text-white/50"}>{month || "Month"}</span>
                                        <ChevronDown className="h-4 w-4 text-white/70" />
                                    </div>

                                    {monthOpen && (
                                        <div className="absolute z-[10010] mt-1 w-full bg-indigo-800 border border-white/20 rounded-xl py-1 max-h-48 overflow-y-auto shadow-xl">
                                            {months.map((m) => (
                                                <div
                                                    key={m}
                                                    className="p-2 hover:bg-indigo-700 cursor-pointer flex items-center justify-between"
                                                    onClick={() => {
                                                        setMonth(m)
                                                        setMonthOpen(false)
                                                        setIsValid(true)
                                                    }}
                                                >
                                                    <span className="text-white">{m}</span>
                                                    {month === m && <Check className="h-4 w-4 text-green-400" />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Year input */}
                                <div>
                                    <label htmlFor="year" className="sr-only">
                                        Year
                                    </label>
                                    <input
                                        type="text"
                                        id="year"
                                        placeholder="YYYY"
                                        maxLength={4}
                                        value={year || ""}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, "").slice(0, 4)
                                            setYear(value)
                                            setIsValid(true)
                                        }}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Error message */}
                            {!isValid && (
                                <motion.p
                                    className="text-red-300 text-sm"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {errorMessage}
                                </motion.p>
                            )}
                        </motion.div>

                        {/* Button */}
                        <motion.button
                            className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-pink-500/25 relative overflow-hidden group"
                            onClick={handleCelebrate}
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <span>CLAIM NOW</span>
                                <PartyPopper className="h-5 w-5" />
                            </span>
                            <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" />
                        </motion.button>

                        <p className="text-xs text-center text-purple-200/70">
                            By submitting, you agree to our <Link onClick={() => setOpenModal(false)} href={`/${customLink}/birthdayTerms`} className="text-primary hover:underline">
                                Terms & Conditions
                            </Link>
                        </p>
                    </div>}
                </motion.div>
                {/* Main card */}
            </motion.div>
        </div>
    );
}

const BirthdayPrompt = memo(MemoBirthdayPrompt);
export default BirthdayPrompt;

