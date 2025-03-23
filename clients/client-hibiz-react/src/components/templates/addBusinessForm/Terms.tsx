import { useCallback, useRef } from "react"
import toast from "react-hot-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import useBusinessCtrl from "@/components/store/useBusinessCtrl"
import { useOwnerLogin } from "@/components/store/useOwnerLogin"
import { useGetOtp, useVerifyOtp } from "@/hooks/useTerms"
import LoadingSpinner from "@/components/atom/loadingSpinner"

const Terms = () => {
  const {
    phone,
    setPhone,
    otp,
    setOtp,
    termsAccepted,
    setTermsAccepted,
    showOtp,
    setShowOtp
  } = useBusinessCtrl()

  const userDetails = useOwnerLogin(s => s.user)
  const { isPending, mutateAsync } = useGetOtp()
  const  {verifyOtp} = useVerifyOtp()

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  const handlePhoneSubmit = useCallback(() => {
    if (phone.length === 10) {
      setShowOtp(true)
      mutateAsync(phone)
    } else {
      toast.error("Please enter a valid 10-digit phone number")
    }
  }, [phone])

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
    if(phone.length !== 10){
      return toast.error("Please enter a valid 10-digit phone number")
    }
    mutateAsync(phone)
  }

  const handleSubmit = async () => {
    if (otp.join("").length === 4) {
      console.log("Sending:", phone, otp.join("")); 
      verifyOtp({ phone: phone?.toString(), otp: otp.join("") }); 
    } else {
      toast.error("Please enter a valid OTP");
    }
  };

  return (
    <>
      {
        !isPending ?
          <ScrollArea className="h-[calc(100vh-4rem)] px-4 py-6">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <h4 className="mb-2 text-base font-semibold md:text-lg lg:text-lg">Hi Biz Acknowledgment</h4>
                <p className="mb-2">
                  I <span className="font-medium">{userDetails?.name}</span> have created the Hibiz account after reading the terms &
                  agreement of Hipalz (Paltribe solutions PVT)
                </p>
                <p className="mb-2">
                  I <span className="font-medium">{userDetails?.name}</span> understand the need for business verification steps and
                  documentation mentioned. I, to the best of my abilities, have given the right information on all the data
                  represented at Hipalz, such as services/offerings/products/location and others.
                </p>
                <p className="mb-2">
                  <strong>Any future updates:</strong> All information inside this tool is subject to changes and adjustments
                  by the owner or members that you allow to access and make changes on the dashboard. This number will be the
                  primary point of contact and owner of this account.
                </p>
                <p className="text-xs text-gray-500">- Acknowledgment OTP</p>
              </div>

              <div className="flex items-center mb-6 space-x-2">
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

              {!showOtp ? (
                <div className="mb-6">
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={10}
                  />
                  <Button
                    onClick={handlePhoneSubmit}
                    className="w-full mt-2"
                    disabled={!termsAccepted || phone.length !== 10}
                  >
                    Send OTP
                  </Button>
                </div>
              ) : (
                <section className="mb-6">
                  <small>
                    <span className="opacity-40">OTP sent to +91</span>{" "}
                    <span className="text-[#1C4EFF] cursor-pointer" onClick={() => setShowOtp(false)}>
                      {phone}
                    </span>
                  </small>
                  <div className="flex mt-4 space-x-2">
                    {inputRefs.map((ref, index) => (
                      <Input
                        key={index}
                        ref={ref}
                        type="tel"
                        value={otp[index]}
                        onChange={(e) => handleChange(e, index)}
                        className="w-12 px-4 py-3 text-center"
                        maxLength={1}
                      />
                    ))}
                  </div>
                  <Button onClick={handleSubmit} className="w-full mt-4" disabled={otp.join("").length !== 4}>
                    Verify
                  </Button>
                  <Button onClick={resendOtp} variant="link" className="w-full mt-2">
                    Resend OTP
                  </Button>
                </section>
              )}
            </div>
          </ScrollArea> : <LoadingSpinner />
      }
    </>
  )
}

export default Terms

