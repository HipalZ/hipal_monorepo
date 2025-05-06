"use client"
import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import SkeletonLoader from '@/components/atoms/loader/skeletonLoader'
import dynamic from 'next/dynamic'
const NavBarHotel = dynamic(() => import("@/components/hotels/NavBarHotel").then((mod) => mod.NavBarHotel), {
    loading: () => <SkeletonLoader height={200} />,
})

const CheckInNavbar = ({ room }: { room: string }) => {
    const param = useParams()
    const router = useRouter()
    const handleBack = () => {
        router.push(`/${param.businessId}/hotel`)
    }
    return (
        <NavBarHotel text={room || "Room Number"} centerText showBackButton={true} onBackClick={handleBack} />
    )
}

export default CheckInNavbar