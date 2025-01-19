import { memo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Users, UserCheck, ReceiptText, CookingPot } from "lucide-react"
import { type orderModal, type TransferTable, useOrderStore } from "@/components/store/useOrderData"
import { Badge } from "@/components/ui/badge"
import { MdTableBar } from "react-icons/md"


const MemoTableOptions = () => {
    const { setModalType, selectedTable, setTransferTable, transferTable, transferModal, setTransferModal } = useOrderStore()


    const toggleModalType = useCallback((type: orderModal) => {
        setModalType(type)
    }, [setModalType])

    const handleTransferTable = useCallback((type: TransferTable) => {
        console.log(type)
        setTransferTable(type)
        setTransferModal(true)
    }, [setTransferTable, setTransferModal, transferModal, transferTable])
    console.log(transferTable, transferModal)

    return (
        <CardContent className="space-y-4 pt-[5rem] md:pt-[8.5rem]">
            <h3 className="text-xl font-semibold opacity-80">Table Options</h3>
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
            <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => handleTransferTable('ITEM')}
            >
                <CookingPot className="w-5 h-5 mr-2" />
                Transfer Item
            </Button>
            <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => handleTransferTable('TABLE')}
            >
                <MdTableBar className="w-5 h-5 mr-2" />
                Transfer Table
            </Button>
        </CardContent>
    )
}

const TableOptions = memo(MemoTableOptions)
export default TableOptions
