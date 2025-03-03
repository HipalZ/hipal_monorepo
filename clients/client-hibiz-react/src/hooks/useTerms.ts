import { apiRpc } from "@hi/common"
import { useMutation } from "@tanstack/react-query"
import toast from "react-hot-toast"
import useBusinessCtrl  from "@/components/store/useBusinessCtrl"


export const useGetOtp = () => {
    const { isPending, mutateAsync } = useMutation({
        mutationFn: async (phone: string) => {
            const res = await apiRpc.users.resendOtp.$post({
                json: {
                    phone: phone,
                },
            })
            if (res.status === 200 || res.status === 201) {
                toast.success("OTP sent successfully")
            }
            if (res.status === 400) {
                toast.error("Please enter a valid 10-digit phone number")
            }
            return res
        },
    })
    return { isPending, mutateAsync }
}

export const useVerifyOtp = () => {
    const { goNext } = useBusinessCtrl()
    const { mutate: verifyOtp } = useMutation({
        mutationFn: async ({ phone, otp }: { phone: string, otp: string }) => {
            const res = await apiRpc.users.verifyOtp.$post({
                json: {
                    phone: phone,
                    otp: otp,
                },
            });

            return res;
        },
        onSuccess: (res) => {
            if (res.status === 200 || res.status === 201) {
                toast.success("OTP verified successfully");
                goNext();
            }
        },
        onError: () => {
            toast.error("Please enter a valid OTP");
        },
    });

    return { verifyOtp };
};