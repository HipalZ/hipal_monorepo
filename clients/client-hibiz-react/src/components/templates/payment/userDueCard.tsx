import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { IDuesPersonsData } from "@/components/types/businessData"
import toast from "react-hot-toast"
import PopUp from "@/components/atom/popUp"
import ClearDues from "./clearDues"
import { useState } from "react"

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

interface UserDue {
    _id: string
    userId: {
        _id: string
        name: string
        phone: string
    }
    totalDuesAmount: number
}

interface UserDueCardProps {
    userDue: UserDue
}

const UserDueCard: React.FC<UserDueCardProps> = ({ userDue }) => {
    const { userId, totalDuesAmount } = userDue
    const [openSettleDues, setOpenSettleDues] = useState<boolean>(false)
    const [selectedUser, setSelectedUser] = useState<IDuesPersonsData | null>(null)


    const handleUserClick = (user: IDuesPersonsData) => {
        if (user.totalDuesAmount === 0) return toast.error("No dues available")
        setSelectedUser(user)
        setOpenSettleDues(true)
    }

    const closeSettleDues = () => {
        setOpenSettleDues(false)
        setSelectedUser(null)
    }

    return (
        <>
            <Card onClick={() => handleUserClick(userDue)} className="w-full max-w-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-xl font-semibold">{userId.name}</CardTitle>
                    <Avatar className="w-8 h-8">
                        <AvatarFallback>{userId.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold opacity-70">{formatCurrency(totalDuesAmount)}</div>
                    <p className="mt-2 text-xs text-muted-foreground">Phone: {userId.phone}</p>
                </CardContent>
            </Card>
            {
                openSettleDues && (
                    <PopUp onClose={closeSettleDues} show={openSettleDues} height="h-[70dvh]" width="w-[30rem]">
                        <ClearDues selectedUser={selectedUser} />
                    </PopUp>
                )
            }
        </>
    )
}

export default UserDueCard

