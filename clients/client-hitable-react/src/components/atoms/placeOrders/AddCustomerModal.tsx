import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, X, ArrowLeft, Edit2 } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useSendOtp, useVerifyOtp } from "@/hooks/useAddCustomer.tsx";
import SpinnerMemo from "../loadingSpinner/index.tsx";

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tableId: string;
}

type Step = "phone" | "otp" | "success";

export default function AddCustomerModal({
  isOpen,
  onClose,
  onSuccess,
  tableId,
}: AddCustomerModalProps) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [nameError, setNameError] = useState("");
  const [otpError, setOtpError] = useState("");

  const { sendOtp, isSendingOtp } = useSendOtp();
  const { verifyOtp, isVerifyingOtp } = useVerifyOtp();

  const handleClose = () => {
    setStep("phone");
    setPhone("");
    setName("");
    setOtp("");
    setPhoneError("");
    setNameError("");
    onClose();
  };

  const validatePhone = (value: string) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!value) {
      setPhoneError("Phone number is required");
      return false;
    }
    if (!phoneRegex.test(value)) {
      setPhoneError("Please enter a valid 10-digit phone number");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const validateName = (value: string) => {
    if (!value.trim()) {
      setNameError("Name is required");
      return false;
    }
    if (value.trim().length < 2) {
      setNameError("Name must be at least 2 characters");
      return false;
    }
    if (value.trim().length > 25) {
      setNameError("Name must be at most 25 characters");
      return false;
    }
    setNameError("");
    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setPhone(value);
      if (phoneError) validatePhone(value);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (nameError) validateName(value);
  };

  const handleSendOtp = async () => {
    const isPhoneValid = validatePhone(phone);
    const isNameValid = validateName(name);

    if (isPhoneValid && isNameValid) {
      try {
        await sendOtp(phone);
        setStep("otp");
        setOtp(""); // Clear OTP when sending a new one
      } catch (error) {
        // Error is handled by the hook
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length === 4) {
      try {
        const res = await verifyOtp(phone, name, otp, tableId);
        if (res?.data?.success) {
          setStep("success");
          handleClose();
          onSuccess();
        }
      } catch (error) {
        setOtpError("Invalid OTP. Please try again.");
        console.error("Error verifying OTP:", error);
      }
    }
  };

  const handleEditNumber = () => {
    setStep("phone");
    setOtp("");
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Only allow closing through the close button, not by clicking outside
        if (open === false) {
          // Do nothing when trying to close by clicking outside
          return;
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "phone" && "Add Customer"}
            {step === "otp" && "Verify OTP"}
            {step === "success" && "Success"}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute z-10 right-1.5 top-0"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {isVerifyingOtp ? (
          <SpinnerMemo />
        ) : (
          <>
            {step === "phone" && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center">
                    Name <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="Enter customer name"
                    maxLength={25}
                  />
                  {nameError && (
                    <p className="text-sm text-red-500 mt-1">{nameError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center">
                    Phone Number <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="flex">
                    <div className="flex items-center justify-center px-3 border border-r-0 rounded-l-md bg-muted">
                      +91
                    </div>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="rounded-l-none"
                      placeholder="Enter 10-digit number"
                      maxLength={10}
                    />
                  </div>
                  {phoneError && (
                    <p className="text-sm text-red-500 mt-1">{phoneError}</p>
                  )}
                </div>
                <Button
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || !phone || !name}
                  className="w-full"
                >
                  {isSendingOtp ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </div>
            )}

            {step === "otp" && (
              <div className="space-y-4 py-4">
                <div className="flex flex-col items-start justify-between">
                  <p className="text-sm">
                    <span className="font-medium">Name:</span> <b>{name}</b>
                  </p>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="font-medium">Phone:</span> +91{" "}
                    <b>{phone}</b>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleEditNumber}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-center">
                  Enter the 4-digit OTP sent to your phone
                </p>

                <div className="flex justify-center py-2">
                  <InputOTP maxLength={4} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {otpError && (
                  <p className="text-sm text-red-500 mt-1">{otpError}</p>
                )}

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={isVerifyingOtp || otp.length !== 4}
                    className="w-full"
                  >
                    {isVerifyingOtp ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying OTP
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={handleEditNumber}
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Edit Details
                    </Button>

                    <Button
                      className="text-blue-800"
                      variant="link"
                      size="sm"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp}
                    >
                      {isSendingOtp ? "Sending..." : "Resend OTP"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {step === "success" && (
              <div className="space-y-4 py-4 flex flex-col items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
                <p className="text-lg font-semibold">Customer Added!</p>
                <p className="text-sm text-center text-gray-500">
                  {name} has been successfully added to your customer list.
                </p>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
