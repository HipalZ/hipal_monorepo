import { useLogin } from "@/components/store/useLogin";
import { useUserToken } from "@hi/common/src/useUserToken";
import { memo } from "react";

const MemoAvatar = () => {
    const { userDetails } = useLogin()
    const accessToken = useUserToken.getState().accessToken;
    return (
        <>
            {accessToken && (
                <h1 className="shadow-md bg-primary text-base-100 font-semibold px-4 py-2.5 rounded-full">
                    {userDetails?.name?.split("")[0]}
                </h1>
            )}
        </>
    )
}

const Avatar = memo(MemoAvatar)
export default Avatar;