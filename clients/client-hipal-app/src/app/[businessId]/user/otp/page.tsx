"use client";
import { useLogin } from "@/components/store/useLogin";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import Welcome from "@/assets/login/otp.png";
import { BiArrowBack, BiEditAlt } from "react-icons/bi";
import Image from "next/image";
import confetti from "canvas-confetti";

import useLoyaltyData from "@/components/store/useLoyaltyData";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import HipalLogo from "@/assets/hipalNewLogo.svg";
import HipalWhiteLogo from "@/assets/hipalLogoOtp.svg";
import { toast } from "react-toastify";
import { apiRpc } from "@hi/common";
import { useUserToken } from "@hi/common/src/useUserToken";
import SignUpBonus from "@/components/organisms/explore/signupbonus";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { useErrorHandling } from "@/utils/helper";

// revalidation works only for server components

function OtpPage() {
  const { errorText } = useErrorHandling();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const { setIsLogin, setUserDetails, userDetails } = useLogin();
  const [coinZ, setCoinz] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState(userDetails?.name);
  const businessLogo = useBusinessDetails((s) => s.businessDetails.logoUrl);
  const businessId = useBusinessDetails((s) => s.businessDetails.businessId);
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);

  const [logo, setLogo] = useState(businessLogo);
  const setAccessToken = useUserToken.getState().setAccessToken;
  const setRefreshToken = useUserToken.getState().setRefreshToken;
  const customLink = useParams()?.businessId as string;
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const router = useRouter();
  const sendOtp = useLogin((s) => s.sendOtp);
  const { loyaltyId, signUpBonus } = useLoyaltyData((s) => s.loyaltySetting);
  const { direction, isPayment, setUserCoinZ, invoiceUrl, urlFrom } = useLogin(
    (s) => ({
      direction: s.direction,
      isPayment: s.isPayment,
      setUserCoinZ: s.setUserCoinZ,
      invoiceUrl: s.invoiceUrl,
      urlFrom: s.urlFrom,
    }),
  );
  const [loading, setLoading] = useState<boolean>(false);

  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.target.value.length > 1 || Number.isNaN(Number(e.target.value)))
      return;

    const newOtp = [...otp];
    newOtp[index] = e.target.value;

    if (index < inputRefs.length - 1 && e.target.value !== "") {
      inputRefs[index + 1]?.current?.focus();
    }

    setOtp(newOtp);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && otp[index] === "") {
      if (index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs[index - 1].current?.focus();
      }
    }
  };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  // Function to trigger a single blast
  function triggerConfettiBlast() {
    confetti({
      angle: randomInRange(55, 125),
      spread: randomInRange(50, 70),
      particleCount: randomInRange(50, 100),
      origin: { y: 0.6 },
    });
  }

  const goNext = useCallback(() => {
    let newUrl = `/${customLink}/explore?pay=${isPayment}`;

    if (direction === "loyalty") {
      newUrl = routePaths[PAGE_TYPES.LOYALTY](`/${customLink}`);
    } else if (direction === "category") {
      newUrl = `/${customLink}/category?pay=${isPayment}`;
    } else if (direction === "explore") {
      newUrl = `/${customLink}/explore?pay=${isPayment}`;
    } else if (direction === "invoice") {
      newUrl = invoiceUrl;
    } else if (direction === "couponz") {
      newUrl = urlFrom;
    }

    window.location.href = newUrl;
  }, [direction, customLink, isPayment, urlFrom, invoiceUrl]);

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
      if (response.user?.reward > 0 && response.user?.count === 1) {
        setCoinz(response.user.reward);
        setIsModalOpen(true);
        triggerConfettiBlast();
        setTimeout(triggerConfettiBlast, 1000);
        setTimeout(triggerConfettiBlast, 2000);
        return;
      }
      goNext();
      setOtp(["", "", "", ""]);
      if (inputRefs[0].current) {
        inputRefs[0].current.focus();
      }
    }
  };

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    verifyOtp();
  };

  useEffect(() => {
    let audio: HTMLAudioElement;
    if (isModalOpen) {
      audio = new Audio("/sounds/Money.mp3");
      audio.play();
    }
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [isModalOpen]);

  return (
    <main className="relative bg-[#748FFC]">
      <section className="flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          className="sticky z-20 px-4 py-2 mt-4 ml-4 bg-gray-100/50 w-[3.25rem] top-4 left-4 rounded-3xl"
        >
          <BiArrowBack className="text-black" size={20} />
        </button>
        <article className="sticky z-20 top-4 right-4">
          <Image src={HipalWhiteLogo} alt="logo" />
        </article>
      </section>
      <section
        className="fixed inset-0 z-0 w-full max-w-[30rem]
				 bg-[#748FFC] bg-center bg-no-repeat bg-contain mx-auto"
        style={{ backgroundImage: `url(${Welcome.src})` }}
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
        className="fixed bottom-0 w-full p-4 text-black bg-white max-w-[30rem] z-10 rounded-t-xl"
        onSubmit={handleSubmit}
      >
        {businessLogo && (
          <section className="bg-inherit w-[5rem] float-right h-[5rem] rounded-lg flex items-center justify-center -mt-[4rem] p-1 shadow-xl overflow-hidden">
            <Image
              className="aspect-square w-[4.75rem] h-[4.75rem]"
              width={84}
              height={84}
              src={logo}
              alt="business logo"
              onError={() => setLogo(HipalLogo.src)}
            />
          </section>
        )}
        <section className="space-y-4">
          {userDetails?.name === "" ? (
            <>
              {" "}
              <div className="!-mb-4 text-sm font-semibold">
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
            {otp.map((_, index) => (
              <input
                type="tel"
                key={index.toString()}
                value={otp[index]}
                onChange={(e) => handleOtpChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                max={1}
                min={0}
                ref={inputRefs[index]}
                className={`border border-black text-black rounded-lg py-2 px-2 text-center text-base-content w-[3rem] h-12 mr-2 focus:outline-none ${
                  error && "border-red-500"
                }`}
                required
              />
            ))}
          </section>
          {error && (
            <div className="mb-2 animate-pulse">
              <div className="tracking-wider text-red-500" role="alert">
                {error}
              </div>
            </div>
          )}
          <Link href={`${routePaths[PAGE_TYPES.SIGN_UP](`${customLink}`)}`}>
            <article className="flex items-center !mb-2 !mt-4 text-black">
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
          </Link>
          <button
            disabled={loading}
            type="submit"
            className="w-full text-white bg-black rounded-full btn"
          >
            {loading ? (
              <span className="loader_spinner !border-t-base-100  text-white" />
            ) : userDetails.name !== "" ? (
              "sign in"
            ) : (
              "Sign up"
            )}
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
      </form>
      {isModalOpen && <SignUpBonus coinZ={coinZ} goNext={goNext} />}
    </main>
  );
}

export default memo(OtpPage);
