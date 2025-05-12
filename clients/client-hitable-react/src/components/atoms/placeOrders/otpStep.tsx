import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const OtpStep = (props) => {
  const { phoneNumber, otp, setOtp, handleOtpSubmit, setStep } = props;
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        OTP sent to +91 {phoneNumber}
      </p>
      <div className="space-y-2">
        <label htmlFor="otp" className="text-sm font-medium">
          Enter 4-digit OTP
        </label>
        <Input
          id="otp"
          type="text"
          placeholder="4-digit OTP"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))
          }
          className="text-lg tracking-widest text-center"
          maxLength={4}
        />
      </div>
      <Button
        onClick={handleOtpSubmit}
        disabled={otp.length !== 4}
        className="w-full"
      >
        Verify & Add Coinz
      </Button>
      <Button
        variant="ghost"
        className="w-full text-sm"
        onClick={() => setStep("phone")}
      >
        Change Phone Number
      </Button>
    </div>
  );
};

export default OtpStep;
