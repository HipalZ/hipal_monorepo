import { useCustomerLogin } from "@/components/hooks/useTableData";
import { useOrderStore } from "@/components/store/useOrderData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCustomerInformation } from "@/hooks/useAddCustomer";
import { ArrowRight } from "lucide-react";
import { memo } from "react";
import toast from "react-hot-toast";

const MemoPhoneNumber = (props) => {
  const { selectedTable } = useOrderStore();
  const {
    phoneNumber,
    setPhoneNumber,
    sendOtp,
    setStep,
    setAvailableCoinz,
    setCouponz,
    setUserData,
  } = props;

  const { data } = useCustomerInformation(selectedTable?.userIds);
  const { verifyOtp } = useCustomerLogin();

  const handlePhoneSubmit = async () => {
    if (phoneNumber.length !== 10) return;
    try {
      await sendOtp(phoneNumber);
      setStep("otp");
    } catch (err) {
      toast.error("Could not send OTP");
    }
  };

  const handleCustomerClick = async (phone: string) => {
    try {
      const res = await verifyOtp({ phone });
      setAvailableCoinz(res?.data?.coins || 0);
      setCouponz(res?.data?.coupons || []);
      setUserData(res?.data?.userData || {});
      setStep("success");
    } catch (err) {
      toast.error("Something went wrong");
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
      <div className="space-y-4 mt-4">
        <center>(or)</center>
        <h4 className="text-sm font-medium text-gray-700">
          Select an Existing Customer
        </h4>
        {data?.length > 0 &&
          data?.map((customer) => (
            <div
              key={customer._id}
              onClick={() => handleCustomerClick(customer?.userId?.phone)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCustomerClick(customer?.userId?.phone);
                }
              }}
              className="p-4 border border-black rounded-lg cursor-pointer hover:shadow-md transition flex justify-between items-center bg-white"
            >
              <div>
                <div className="flex justify-between text-sm font-semibold">
                  {customer?.userId?.name}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-black" />
            </div>
          ))}
      </div>
    </>
  );
};

const PhoneNumber = memo(MemoPhoneNumber);
export default PhoneNumber;
