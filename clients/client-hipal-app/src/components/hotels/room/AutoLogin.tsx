"use client"
import { getUserInfo } from "@/components/hooks/useAutoLogin"
import { useEffect, useState } from "react"
import { useUserToken } from "@hi/common/src/useUserToken"
import { toast } from "react-toastify"
import { useLogin } from "@/components/store/useLogin"
import { useQuery } from "@tanstack/react-query"

const AutoLogin = ({ userID }: { userID: string }) => {
    const [error, setError] = useState<string | null>(null)
    const { setAccessToken, setRefreshToken } = useUserToken.getState()
    const { setUserDetails, setIsLogin } = useLogin()

    const performAutoLogin = async () => {
        if (!userID) {
            setError("No user ID provided")
            return
        }

        try {
            console.log("Attempting auto-login for user ID:", userID)
            const response = await getUserInfo(userID)

            if (response.status === 200 || response.status === 201) {
                const data = await response.json()
                const userData = data.data

                if (userData.accessToken && userData.refreshToken) {
                    setAccessToken(userData.accessToken)
                    setRefreshToken(userData.refreshToken)
                    setUserDetails(userData)
                    setIsLogin(true)
                }
            }
        } catch (err) {
            console.error("Auto-login error:", err)
        }
    }



    const { isLoading } = useQuery({
        queryKey: ["autoLogin", userID],
        queryFn: performAutoLogin,
        enabled: !!userID,
    })

    if (error) {
        return <div className="w-full p-4 text-sm text-center text-red-500" />
    }

    return null
}

export default AutoLogin

