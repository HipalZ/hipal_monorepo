import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

const PhoneNumber = (props) => {
  const { phoneNumber, setPhoneNumber, sendOtp, setStep } = props;
  const handlePhoneSubmit = async () => {
    if (phoneNumber.length !== 10) return;
    try {
      await sendOtp(phoneNumber);
      setStep("otp");
    } catch (err) {
      toast.error("Could not send OTP");
    }
  };
  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Enter Phone Number
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="10-digit mobile number"
            value={phoneNumber}
            onChange={(e) =>
              setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            className="text-lg"
          />
        </div>
        <Button
          onClick={handlePhoneSubmit}
          disabled={phoneNumber.length !== 10}
          className="w-full"
        >
          Get OTP
        </Button>
      </div>
    </>
  );
};

export default PhoneNumber;
