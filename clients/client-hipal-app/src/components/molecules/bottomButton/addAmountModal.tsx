import { memo, useCallback, useEffect, useRef, useState } from "react";
import Hipay from "@/assets/payment/hipay.png";
import hipayBg from "@/assets/payment/hipay_background.png";
import style from "./addAmount.module.css";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import useTableData from "@/components/store/useTableData";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import { cn } from "@/components/utils/helpers";
import { useLogin } from "@/components/store/useLogin";
import PlaceholderImg from "@/components/atoms/placeholder";
import { getRandomBlurImg } from "@/components/utils/images";
import { apiRpc } from "@hi/common";

const AddAmountModal = memo(() => {
  const businessId = useBusinessDetails((s) => s.businessDetails.businessId);
  const business = useBusinessDetails((s) => s.businessDetails);
  const userDetailes = useLogin((s) => s.userDetails);
  const customLink = useParams()?.businessId as string;
  const router = useRouter();
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);

  const setIsPayment = useLogin((s) => s.setIsPayment);
  const name = useLogin((s) => s.userDetails?.name);
  const saveAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value === "" ? 0 : Number(value));
  };
  const { tableName } = useTableData();

  const proceedToPayment = useCallback(() => {
    if (amount === 0) {
      toast.error("Please enter amount");
      return;
    }
    setLoading(true);
    if (amount > 0) {
      setIsPayment(false);
      router.push(`/${customLink}/payment?amount=${amount}`);
    }
  }, [amount, customLink, router]);

  const callTheWaiter = useCallback(async () => {
    if (!tableName) {
      toast.error("Please Scan the table to call waiter");
      return;
    }
    if (loading) {
      return toast.error("Please wait for a moment");
    }

    setLoading(true);

    const res = await apiRpc.payments.createWaiterAlert.$post({
      json: {
        businessId: businessId,
        tableName: tableName,
        message: "Want to settle bill",
        alertType: "WAITER",
        status: "WAITER",
        name: name,
        userId: userDetailes._id,
      },
    });
    if (res.status === 200) {
      toast.success("Captain will be there soon. Thank you!!");
      setLoading(false);
    }
    if (res.status === 404 || res.status === 400) {
      toast.error("Table not found");
      setLoading(false);
    }
  }, [businessId, tableName]);
  return (
    <section className="h-[80vh] overflow-y-auto overflow-x-hidden">
      <header className="bg-white h-[4.25rem] flex items-center text-primary">
        {business.logoUrl ? (
          <figure className="h-[5rem] p-4 w-[5rem]">
            <Image
              src={business.logoUrl}
              height={80}
              width={80}
              quality={95}
              objectFit="cover"
              alt="logo-business"
              className="object-center border rounded-full shadow-sm aspect-square"
              placeholder="blur"
              blurDataURL={getRandomBlurImg(100, 100)}
            />
          </figure>
        ) : (
          <PlaceholderImg />
        )}
        <div>
          Paying : <br />
          <span className="font-bold text-primary">{business.name}</span>
        </div>
      </header>
      <section className="relative scale-90">
        <center>
          <Image width={1080} height={1080} src={hipayBg} alt="hipayBg" />
          <figure className={`${style.globe_payment} mt-24`}>
            <Image width={193} height={193} src={Hipay} alt="Hipay" />
          </figure>
        </center>
        <section className="absolute mx-6 space-y-4 w-[88%]">
          <input
            value={amount || ""}
            onChange={saveAmount}
            placeholder="Enter Final Bill Amount"
            className="w-full px-4 py-3 text-black bg-white border border-black rounded-2xl focus:outline-none"
            type="tel"
            maxLength={6}
            minLength={1}
            required
          />
          <div className="flex items-end justify-between gap-4">
            <button
              type="button"
              disabled={loading}
              onClick={callTheWaiter}
              className="text-black w-full px-8 py-3 text-sm border rounded-full border-black !text-whote"
            >
              {loading ? (
                <span className="loader_spinner !border-t-black" />
              ) : (
                "Call Captain"
              )}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={proceedToPayment}
              className={cn(
                "w-full px-4 py-3 rounded-full text-white",
                loading
                  ? "opacity-50 pointer-events-none bg-gray-400"
                  : "bg-black",
              )}
            >
              {loading ? (
                <span className="loader_spinner !border-t-primary" />
              ) : (
                "Next"
              )}
            </button>
          </div>
        </section>
      </section>
    </section>
  );
});

const MemoAddAmountModal = memo(AddAmountModal);
export default MemoAddAmountModal;
