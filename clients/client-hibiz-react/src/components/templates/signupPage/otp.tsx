import { useCallback, useRef, useState } from "react"
import { LuArrowLeft } from "react-icons/lu"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import Hand from "@/assets/login/hand.png"
import useLoginStore from "@/components/store/useLogin"
import { useOwnerLogin } from "@/components/store/useOwnerLogin"
import { useUserToken } from "@hi/common/src/useUserToken"
import { apiRpc } from "@hi/common"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"

const Otp = ({ login }: { login?: boolean }) => {
  const { step, setStep, phone, name } = useLoginStore((state) => ({
    step: state.step,
    setStep: state.setStep,
    phone: state.phone,
    name: state.name,
  }))
  const navigate = useNavigate()
  const { setIsLogin, setUser } = useOwnerLogin((state) => ({
    setIsLogin: state.setIsLogin,
    setUser: state.setUser,
  }))
  const setAccessToken = useUserToken.getState().setAccessToken
  const setRefreshToken = useUserToken.getState().setRefreshToken

  const [otp, setOtp] = useState(["", "", "", ""])
  const [termsAccepted, setTermsAccepted] = useState(false)

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  const handleSubmit = useCallback(async () => {
    if (!login && !termsAccepted) {
      toast.error("Please accept the terms and conditions")
      return
    }

    const endpoint = login ? apiRpc.users.ownerSignIn : apiRpc.users.ownerSignUp

    if(otp.some((value) => value === "")) {
      toast.error("Please enter valid OTP")
      return
    }

    const res = await endpoint.$post({
      json: {
        name: name,
        phone: phone,
        otp: otp.join(""),
      },
      query: {
        verifyOtp: "true",
      },
    })

    const response = await res.json()
    if (res.status === 409 || res.status === 400 || res.status === 401) {
      toast.error(response.message || "Please try again")
      return
    }

    if (res.status === 200 || res.status === 201) {
      setAccessToken(response.data.accessToken)
      setRefreshToken(response.data.refreshToken)
      setUser(response.data.user)
      toast.success("Login Successfully")
      setIsLogin(true)

      if (login) {
        navigate("/app/business")
        return
      }
      setStep(step + 1)
    }
  }, [
    step,
    name,
    phone,
    otp,
    termsAccepted,
    login,
    navigate,
    setAccessToken,
    setRefreshToken,
    setUser,
    setIsLogin,
    setStep,
  ])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = e.target.value
    if (/^[0-9]$/.test(newValue) || newValue === "") {
      const newOtp = [...otp]
      newOtp[index] = newValue
      setOtp(newOtp)

      if (newValue !== "" && index < inputRefs.length - 1) {
        inputRefs[index + 1].current?.focus()
      }
    }
  }

  const resendOtp = async () => {
    const res = await apiRpc.users.resendOtp.$post({
      json: {
        phone: phone,
      },
    })
    if (res.status === 200 || res.status === 201) {
      toast.success("OTP sent successfully")
    }
  }

  const goBack = useCallback(() => {
    setStep(step - 1)
  }, [step, setStep])

  return (
    <>
      <img
        className="absolute left-0 right-0 m-auto -top-[6.5rem]"
        width={63}
        height={73}
        src={Hand || "/placeholder.svg"}
        alt="Hipal_hand"
      />
      <button type="button" onClick={goBack} className="flex items-center font-semibold leading-8 text-[#1C4EFF]">
        <LuArrowLeft size={16} />
        &nbsp; Back
      </button>
      <h3 className="mt-2 text-xl font-semibold leading-8">{login ? "Welcome back" : null}</h3>
      {login ? <h3 className="flex leading-8">No worries!</h3> : null}

      {!login && (
        <>
          <ScrollArea className="w-full h-[20dvh] p-2 mt-2 border rounded-md">
            <div className="text-sm">
              <h4 className="mb-2 font-semibold">Hi Biz Acknowledgment</h4>
              <p className="mb-2">
                I <span className="font-medium">{name}</span> have created the Hibiz account after reading the terms &
                agreement of Hipalz (Paltribe solutions PVT)
              </p>
              <p className="mb-2">
                I <span className="font-medium">{name}</span> understand the need for business verification steps and
                documentation mentioned. I, to the best of my abilities, have given the right information on all the
                data represented at Hipalz, such as services/offerings/products/location and others.
              </p>
              <p className="mb-2">
                <strong>Any future updates:</strong> All information inside this tool is subject to changes and
                adjustments by the owner or members that you allow to access and make changes on the dashboard. This
                number will be the primary point of contact and owner of this account.
              </p>
              <p className="text-xs text-gray-500">- Acknowledgment OTP</p>
            </div>
          </ScrollArea>

          <div className="flex items-center mt-4 space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have read and understood all points and terms of conditions and would like to Proceed
            </label>
          </div>
        </>
      )}

      <section className="mt-4">
        <small>
          <span className="opacity-40">OTP sent to +91</span> <span className="text-[#1C4EFF]">{phone}</span>
        </small>
        <div className="flex mt-4 space-x-2">
          {inputRefs.map((ref, index) => (
            <input
              key={index}
              ref={ref}
              type="tel"
              value={otp[index]}
              onChange={(e) => handleChange(e, index)}
              className="w-12 px-4 py-3 text-center border border-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              maxLength={1}
            />
          ))}
        </div>
      </section>
      <button
        type="button"
        className={`action_btn mt-6 ${!login && !termsAccepted && "opacity-50 cursor-not-allowed"}`}
        onClick={handleSubmit}
        disabled={!login && !termsAccepted}
      >
        Verify
      </button>
      <center className="mt-4 -mb-2">
        <button onClick={resendOtp} type="button" className="text-[#1C4EFF]">
          Resend OTP
        </button>
      </center>
    </>
  )
}

export default Otp

