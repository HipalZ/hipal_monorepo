import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton"
import type { IDuesPersonsData } from "@/components/types/businessData"
import { apiRpc } from "@hi/common"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { memo } from "react"
import { useParams } from "react-router-dom"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarIcon, CreditCardIcon } from "lucide-react"
import { formatCurrency } from "./userDueCard"
import { useGetAllModes } from "@/hooks/useDuesApi"
import { useDues } from "@/components/store/useDues"
import MultipleModes from "./selectPaymentMode"
import toast from "react-hot-toast"

type Bill = {
    _id: string
    billId: {
        _id: string
        total: number
    }
    isSettled: boolean
    date: number
}

type DuesData = {
    totalDuesAmount: number
    bill: Bill[]
}

const MemoClearDues = ({
    selectedUser,
    closeSettleDues,
}: {
    selectedUser: IDuesPersonsData | null
    closeSettleDues: () => void
}) => {
    const { businessId } = useParams()
    const queryClient = useQueryClient();
    const [selectedBills, setSelectedBills] = useState<string[]>([])
    const [selectMode, setSelectMode] = useState<boolean>(false)
    const { settleModes, setSettleModes } = useDues()
    const { isLoading: payLoading, paymentMode } = useGetAllModes(businessId, selectMode)
    const getUserDueHistory = async () => {
        if (!selectedUser?._id || !businessId) {
            throw new Error("Invalid user or business ID")
        }

        const response = await apiRpc.dues.pending_dues[":duesUserId"][":businessId"].$get({
            param: {
                businessId,
                duesUserId: selectedUser._id,
            },
        })

        const res = await response.json()
        if (res.err) {
            throw new Error(res.message || "Failed to fetch dues history")
        }

        return res.data as DuesData
    }


    const { isLoading, isError, error, data } = useQuery({
        queryKey: ["userDueHistory", selectedUser?._id],
        queryFn: getUserDueHistory,
        enabled: !!selectedUser?._id && !!businessId,
    })

    const { isPending, mutateAsync } = useMutation({
        mutationFn: async () => {
            const response = await apiRpc.dues.settle_dues.$put({
                json: {
                    businessId,
                    duesUserId: selectedUser?._id,
                    billIds: selectedBills,
                    settleModes
                }
            })
            return response.json()
        },
        onSuccess: (data) => {
            if (!data.err) {
                closeSettleDues()
                setSelectMode(false)
                setSelectedBills([])
                setSettleModes([])
                queryClient.invalidateQueries({ queryKey: ["allDueUsers", businessId] })
                return toast.success("Dues settled successfully")
            }
            toast.error(data.message)
        }
    })

    const handleCardClick = (billId: string) => {
        setSelectedBills((prev) => (prev.includes(billId) ? prev.filter((id) => id !== billId) : [...prev, billId]))
    }

    const totalAmountToPay = data
        ? data.bill.filter((bill) => selectedBills.includes(bill?.billId._id)).reduce((sum, bill) => sum + bill.billId.total, 0)
        : 0

    if (isLoading || isPending) {
        return <LoadingState />
    }

    if (isError) {
        return <ErrorState error={error.message} />
    }

    if (!data) {
        return <EmptyState />
    }

    return (

        <>
            {
                !selectMode ?

                    <div className="space-y-6">
                        <div className="pt-4 text-center">
                            <h1 className="text-2xl font-bold">{selectedUser?.userId?.name}</h1>
                            <h2 className="text-xl text-muted-foreground">Total Dues: {formatCurrency(data.totalDuesAmount)}</h2>
                        </div>

                        <Card className="border-none shadow-none">

                            <CardContent>
                                <ScrollArea className="h-[80dvh] lg:h-[60dvh] pr-4">
                                    <div className="space-y-4">
                                        {data.bill
                                            .filter((bill) => !bill.isSettled)
                                            .map((bill) => (
                                                <BillCard
                                                    key={bill._id}
                                                    bill={bill}
                                                    isSelected={selectedBills.includes(bill?.billId?._id)}
                                                    onSelect={() => handleCardClick(bill?.billId?._id)}
                                                />
                                            ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                        <AdvancedBottomButton
                            maxWidth="30rem"
                            shadow
                            buttons={[
                                {
                                    text: "Close",
                                    onClick: closeSettleDues,
                                    isBackButton: true,
                                    className: "rounded-md pl-3",
                                },
                                {
                                    text: `Settle ${formatCurrency(totalAmountToPay)}`,
                                    onClick: () => {
                                        if (totalAmountToPay === 0) return
                                        setSelectMode(true)
                                    },
                                    swipe: true,
                                    disable: totalAmountToPay === 0,
                                },
                            ]}
                        />
                    </div>
                    :
                    <div className="space-y-6">
                        <div className="pt-4 text-center">
                            <h1 className="text-2xl font-bold">{selectedUser?.userId?.name}</h1>
                            <h2 className="text-xl text-muted-foreground">Total Dues: {formatCurrency(data.totalDuesAmount)}</h2>
                        </div>

                        {
                            payLoading ? <LoadingState />
                                : <MultipleModes paymentModes={paymentMode} totalAmount={Number(totalAmountToPay)} />
                        }
                        <AdvancedBottomButton
                            maxWidth="30rem"
                            shadow
                            buttons={[
                                {
                                    text: "Close",
                                    onClick: () => setSelectMode(false),
                                    isBackButton: true,
                                    className: "rounded-md pl-3",
                                },
                                {
                                    text: `Confirm  ${formatCurrency(totalAmountToPay)}`,
                                    onClick: () => {
                                        mutateAsync()
                                    },
                                    swipe: true,
                                    disable: totalAmountToPay === 0 && settleModes.length === 0,
                                },
                            ]}
                        />
                    </div>
            }
        </>
    )
}

const BillCard = ({ bill, isSelected, onSelect }) => (
    <Card
        className={`cursor-pointer transition-colors ${isSelected ? "border-primary bg-primary/10" : ""}`}
        onClick={onSelect}
    >
        <CardContent className="flex items-center justify-between p-4">
            <div className="space-y-1">
                <Checkbox checked={isSelected} onCheckedChange={onSelect} />
                <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    <span>{new Date(bill?.date).toLocaleDateString("en-In")}</span>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <div className="text-right">
                    <p className="font-semibold">{formatCurrency(bill?.billId?.total)}</p>
                </div>
            </div>
        </CardContent>
    </Card>
)

const LoadingState = () => (
    <div className="p-4 space-y-4">
        <Skeleton className="w-3/4 h-8 mx-auto" />
        <Skeleton className="w-1/2 h-6 mx-auto" />
        <Card>
            <CardHeader>
                <Skeleton className="w-1/3 h-6" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="w-full h-20" />
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>
)

const ErrorState = ({ error }) => (
    <div className="p-4 text-center">
        <CreditCardIcon className="w-12 h-12 mx-auto mb-4 text-destructive" />
        <h2 className="mb-2 text-xl font-semibold">Error Loading Dues</h2>
        <p className="text-muted-foreground">{error}</p>
    </div>
)

const EmptyState = () => (
    <div className="p-4 text-center">
        <CreditCardIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">No Dues Found</h2>
        <p className="text-muted-foreground">There are no pending dues for this user.</p>
    </div>
)

const ClearDues = memo(MemoClearDues)
export default ClearDues

