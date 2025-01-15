import { memo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Users, UserCheck, ReceiptText } from "lucide-react"
import { type orderModal, useOrderStore } from "@/components/store/useOrderData"
import { Badge } from "@/components/ui/badge"

const MemoTableOptions = () => {
    const { setModalType, selectedTable } = useOrderStore()

    const toggleModalType = useCallback((type: orderModal) => {
        setModalType(type)
    }, [setModalType])

    return (
        <CardContent className="space-y-4 pt-[7rem] md:pt-[8.5rem]">
            {
                selectedTable?.hiCode && (
                    <Badge variant="secondary" className="flex justify-between w-full">
                        <div className="text-2xl font-bold">Table code :-</div>
                        <div className="text-2xl font-bold">{selectedTable?.hiCode}</div>
                    </Badge>
                )
            }
            <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => toggleModalType('guest')}
            >
                <Users className="w-5 h-5 mr-2" />
                Add Guest Count
            </Button>
            <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => toggleModalType('customer')}
            >
                <UserCheck className="w-5 h-5 mr-2" />
                Know Your Customers
            </Button>
            <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => toggleModalType('ebill')}
            >
                <ReceiptText className="w-5 h-5 mr-2" />
                Send Ebill
            </Button>
        </CardContent>
    )
}

const TableOptions = memo(MemoTableOptions)
export default TableOptions
