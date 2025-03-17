"use client"

import { BookmarkPlus } from "lucide-react"
import CommonBottomButton from "../atoms/bottomButton"
import { useParams, useRouter } from "next/navigation"
import { useCallback } from "react"

export function BottomBtnHotel() {
    const router = useRouter()
    const params = useParams()
    const customLink = params?.businessId || ""

    const navigateToRooms = useCallback(() => {
        if (customLink) {
            return router.push(`/${customLink}/hotel/rooms`)
        }
    }, [customLink, router])

    return (
        <div>
            <CommonBottomButton
                fixed={true}
                maxWidth="30rem"
                buttons={[
                    {
                        text: "Book Now",
                        className: "w-full !text-white !bg-[#DC4C35]",
                        icon: <BookmarkPlus />,
                        onClick: navigateToRooms,
                    },
                ]}
            />
        </div>
    )
}

export const BottomBtnRoom = () => {

    const router = useRouter()
    const goBack = useCallback(() => {
        return router.back()
    }, [router])

    return (
        <div>
            <CommonBottomButton
                fixed={true}
                maxWidth="30rem"
                buttons={[
                    {
                        text: "",
                        className: "w-full rounded-md pl-3",
                        isBackButton: true,
                        onClick: goBack,
                    },
                    {
                        text: "Book Now",
                        className: "w-full rounded-md !text-white !bg-[#DC4C35]",
                        icon: <BookmarkPlus />,
                        onClick: goBack,
                    },
                ]}
            />
        </div>
    )
}

