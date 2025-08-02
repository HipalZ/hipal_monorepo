import { useAllDueUsers } from "@/components/store/useDues"
import { type IDuesPersonsData, useOrderStore } from "@/components/store/useOrderData"
import { memo, useCallback } from "react"
import { useParams } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { User, Phone } from "lucide-react"
import { cn } from "@/components/utils/helpers"

const MemoDues = () => {
    const { setSaveDueUser, saveDueUser } = useOrderStore()

    const { businessId } = useParams()
    const settleModes = useOrderStore((s) => s.settleModes)

    const { isLoading, data } = useAllDueUsers(businessId)

    const handleUserClick = useCallback((user: IDuesPersonsData) => {
        setSaveDueUser(user)
    }, [saveDueUser, setSaveDueUser])

    return (
        <Card className="w-full max-w-md mx-auto border-none rounded-none shadow-none">
            <CardContent className="">
                {isLoading ? (
                    <p>Loading...</p>
                ) : data && data?.length > 0 ? (
                    <ScrollArea className="h-[75dvh] w-full">
                        {data?.map((user: IDuesPersonsData) => (
                            <Button
                                key={user._id}
                                variant={saveDueUser?._id === user._id ? "default" : "ghost"}
                                className={cn('justify-start w-full mb-2')}
                                onClick={() => handleUserClick(user)}
                            >
                                <div className="flex items-center w-full">
                                    <User className="w-4 h-4 mr-2" />
                                    <span className="flex-grow text-left">{user?.userId?.name}</span>
                                    <Phone className="w-4 h-4 mr-2" />
                                    <span>{user?.userId?.phone}</span>
                                </div>
                            </Button>
                        ))}

                    </ScrollArea>
                ) : (
                    <p>No due users found.</p>
                )}
            </CardContent>
        </Card>
    )
}

const Dues = memo(MemoDues)
export default Dues
