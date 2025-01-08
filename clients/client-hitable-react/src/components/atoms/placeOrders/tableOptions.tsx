import { memo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Users, CheckSquare, UserCheck } from "lucide-react"
import { type orderModal, useOrderStore } from "@/components/store/useOrderData"

const MemoTableOptions = () => {
    const { setModalType, modalType } = useOrderStore()

    const toggleModalType = useCallback((type: orderModal) => {
        setModalType(type)
    }, [setModalType])

    return (
        <CardContent className="space-y-4 pt-[7rem]">
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
                onClick={() => toggleModalType('free')}
            >
                <CheckSquare className="w-5 h-5 mr-2" />
                Free the Table
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
        </CardContent>
    )
}

const TableOptions = memo(MemoTableOptions)
export default TableOptions
