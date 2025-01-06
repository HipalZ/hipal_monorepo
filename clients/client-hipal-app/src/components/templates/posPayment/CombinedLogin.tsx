"use client";;
import Image from "next/image";
import { useState, useRef, useEffect, type FormEvent, useCallback } from "react";
import { toast } from "react-toastify";
import Welcome from "@/assets/login/waveHand.png";
import WelcomeOTP from "@/assets/login/otp.png";
import HipalWhiteLogo from "@/assets/hipalLogoOtp.svg";
import { apiRpc } from "@hi/common";
import { BiArrowBack, BiEditAlt } from "react-icons/bi";
import { useLogin } from "@/components/store/useLogin";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import { useParams, useSearchParams } from "next/navigation";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { useUserToken } from "@hi/common/src/useUserToken";
import { useErrorHandling } from "@/utils/helper";
import { cn, triggerConfettiBlast } from "@/components/utils/helpers";
import { useHandleMode } from "@/components/hooks/usePayments";

const CombinedLogin = () => {
    const { handleMode } = useHandleMode()
    const searchParams = useSearchParams();
    const [phone, setPhone] = useState("");
    const { errorText } = useErrorHandling();
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [error, setError] = useState("");
    const [showOtpScreen, setShowOtpScreen] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRefs = Array.from({ length: 4 }, () => useRef<HTMLInputElement>(null));
    const { loyaltyId, signUpBonus } = useLoyaltyData((s) => s.loyaltySetting);
    const { setUserDetails, userDetails, setUserCoinZ, setIsLogin, sendOtp } =
        useLogin();
    const [customerName, setCustomerName] = useState(userDetails?.name);
    const businessId = useBusinessDetails((s) => s.businessDetails.businessId);
    const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
    const setCheckLogin = usePaymentStore((s) => s.setCheckLogin)
    const { openBlastModal, setOpenBlastModal,
        setCoinz } = usePaymentStore()
    const businessData = useBusinessDetails((s) => s.businessDetails);
    const customLink = useParams()?.businessId as string;
    const orderId = searchParams?.get("orderId");
    const setAccessToken = useUserToken.getState().setAccessToken;
    const setRefreshToken = useUserToken.getState().setRefreshToken;

    useEffect(() => {
        if (userDetails.phone) setPhone(userDetails.phone);
    }, [userDetails.phone]);

    const handleBack = useCallback(() => {
        if (showOtpScreen) {
            setShowOtpScreen(false);
        } else {
            setCheckLogin(false);
        }
    }, [showOtpScreen, setCheckLogin]);

    const handlePhoneSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (loading) return toast.error("Please wait...");

        if (phone.length !== 10) {
            toast.error("Enter a valid phone number");
            return;
        }

        setLoading(true);
        const res = await apiRpc.users[":id"].signUp.$post({
            json: { phone, role: ["HIPAL_CUSTOMER"] },
            param: { id: customLink },
        });

        const response = await res.json();
        if (res.status === 201 || res.status === 409) {
            setUserDetails(response?.data?.user);
            setShowOtpScreen(true);
        } else {
            toast.error(response?.message || "Failed to send OTP");
        }
        setLoading(false);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1 || Number.isNaN(Number(value))) return;
        const newOtp = [...otp];
        newOtp[index] = value;

        if (value && index < otp.length - 1) {
            inputRefs[index + 1]?.current?.focus();
        }
        setOtp(newOtp);
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            const newOtp = [...otp];
            newOtp[index - 1] = "";
            setOtp(newOtp);
            inputRefs[index - 1]?.current?.focus();
        }
    };

    const verifyOtp = async () => {
        const fullOtp = otp.join("");
        if (fullOtp.length !== 4) {
            setError("Please enter the complete OTP.");
            return;
        }
        if (userDetails.name === "" && customerName === "") {
            setError("Please enter your name.");
            return;
        }
        if (loading) {
            return toast.error("Please wait for a moment");
        }
        setLoading(true);

        const res = await apiRpc.users[":id"].signIn.$post({
            json: {
                phone: userDetails.phone,
                userId: userDetails._id,
                otp: fullOtp,
                role: userDetails?.role,
                loyaltyId: loyaltyId || businessId,
                signUpBonus: signUpBonus,
                name: customerName || userDetails.name,
                businessId: businessId || outletInfo?.businessId,
            },
            param: { id: customLink },
        });
        if (res.status === 401) {
            return errorText(res.status);
        }
        const response = (await res.json()).data;
        if (res.status === 400) {
            setError("Invalid OTP");
            toast.error("Invalid OTP");
            setLoading(false);
            return;
        }
        if (res.status === 200) {
            setAccessToken(response?.accessToken);
            setRefreshToken(response?.refreshToken);
            setUserDetails(response?.user);
            setUserCoinZ(response?.rewards);
            setIsLogin(true);
            setCheckLogin(false);
            setOtp(["", "", "", ""]);
            if (inputRefs[0].current) {
                inputRefs[0].current.focus();
            }
            if (response.user?.reward > 0 && response.user?.count === 1) {
                setCoinz(response.user.reward);
                setOpenBlastModal(true);
                console.log("openBlastModal set to true");
                triggerConfettiBlast();
                setTimeout(triggerConfettiBlast, 1000);
                setTimeout(triggerConfettiBlast, 2000);
                return
            }
            // to set the auth token in the store
            window.location.href = `/${customLink}/posPayment?orderId=${orderId}`
        }
    };
    useEffect(() => {
        let audio: HTMLAudioElement;
        if (openBlastModal) {
            audio = new Audio("/sounds/Money.mp3");
            audio.play();
        }
        return () => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        };
    }, [openBlastModal]);

    return (
        <main className="relative bg-[#748FFC] text-black">
            <section className="flex items-center justify-between">
                <button onClick={handleBack} type="button" className="sticky z-20 px-4 py-2 mt-4 ml-4 bg-gray-100/50 rounded-3xl">
                    <BiArrowBack className="text-black" size={20} />
                </button>
                <article className="sticky z-20 top-4 right-4">
                    <Image src={HipalWhiteLogo} alt="logo" />
                </article>
            </section>
            <section
                className="fixed inset-0 bg-[#748FFC] bg-center bg-no-repeat bg-contain"
                style={{ backgroundImage: `url(${showOtpScreen ? WelcomeOTP.src : Welcome.src})` }}
            />

            {userDetails?.name === "" ? (
                <section className="absolute text-white top-[10vh] left-9">
                    <b className="block text-2xl gradient-text">You look new !</b>
                    <b className="text-3xl capitalize gradient-text">Welcome...</b>
                    <b className="text-4xl wave-hand">👋</b>
                </section>
            ) : (
                <section className="absolute text-white top-[10vh] left-9">
                    <h4 className="text-2xl">Hello!</h4>
                    <b className="text-3xl capitalize">{userDetails?.name}</b>
                    <b className="text-4xl wave-hand">👋</b>
                </section>
            )}
            <form
                onSubmit={showOtpScreen ? verifyOtp : handlePhoneSubmit}
                className="fixed bottom-0 w-full p-4 bg-white max-w-[30rem] z-10 rounded-t-2xl"
            >
                {businessData?.logoUrl && (
                    <section className={cn(showOtpScreen ? "float-right" : "float-left", "bg-inherit w-[5rem] h-[5rem] rounded-lg flex items-center justify-center -mt-[4.5rem] p-1 shadow-xl overflow-hidden")}>
                        <Image className="aspect-square w-[4.75rem] h-[4.75rem]" src={businessData?.logoUrl} alt="business logo" width={80} height={80} />
                    </section>
                )}
                {showOtpScreen ? (
                    <section className="space-y-4 pt-4">
                        {userDetails?.name === "" ? (
                            <>
                                <div className="text-sm font-semibold">
                                    Whatz your name ?
                                </div>
                                <input
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    value={customerName}
                                    type="text"
                                    id="floating_outlined"
                                    className="w-full px-4 py-3 text-black border border-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                    placeholder="Enter your name"
                                    maxLength={18}
                                    required
                                />
                            </>
                        ) : null}
                        <div className="!-mb-2 text-sm font-semibold text-black">
                            Check your phone for OTP
                        </div>
                        <section className="flex">
                            {otp.map((digit, index) => (
                                <input
                                    key={index?.toString()}
                                    type="tel"
                                    value={digit}
                                    maxLength={1}
                                    ref={inputRefs[index]}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className={`border border-black text-black rounded-lg py-2 px-2 text-center text-base-content w-[3rem] h-12 mr-2 focus:outline-none ${error && "border-red-500"
                                        }`}
                                    required
                                />
                            ))}
                        </section>
                        {error && (
                            <div className="mb-2 animate-pulse tracking-wider text-red-500" role="alert">
                                {error}
                            </div>
                        )}
                        <article onKeyDown={() => setShowOtpScreen(!showOtpScreen)} onClick={() => setShowOtpScreen(!showOtpScreen)} className="flex items-center !mb-2 !mt-4 text-black">
                            <small>
                                Sent to{" "}
                                <span className="text-[#3E3CFF] underline">
                                    {userDetails.phone}
                                </span>{" "}
                            </small>
                            <span className="cursor-pointer text-[#3E3CFF]">
                                <BiEditAlt />
                            </span>
                        </article>
                        <button
                            type="button"
                            disabled={loading}
                            onClick={verifyOtp}
                            className="w-full py-2 mt-4 text-white bg-black rounded-full"
                        >
                            {loading ? "Verifying..." : "Sign In"}
                        </button>
                        <small className="flex justify-center mt-2 text-black">
                            Didn’t receive the code? &nbsp;
                            <button
                                type="button"
                                onClick={() => sendOtp()}
                                role="button"
                                className="cursor-pointer text-[#3E3CFF]"
                            >
                                Resend
                            </button>
                        </small>
                    </section>
                ) : (
                    <>
                        <section className="my-4 space-y-2">
                            <b>Hurry up for a rewarding journey✨</b>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                maxLength={10}
                                className="w-full px-4 py-3 border border-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                placeholder="Phone number"
                                required
                            />
                        </section>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 text-white bg-black rounded-full"
                        >
                            {loading ? "Processing..." : "Get Started"}
                        </button>
                        <center className="mx-12 mt-2 text-xs">
                            By continuing you are agreeing to the{" "}
                            <small className="text-[#2364E6]">
                                Terms of Service and Privacy Policy.
                            </small>
                        </center>
                    </>
                )}
            </form>
        </main>
    );
};

export default CombinedLogin;
