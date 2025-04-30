import { lazy } from "react"

const ItemsHotelReports = lazy(() => import("@/components/hotel/EscalationReport/ItemReports"))
import DateRangePicker from "@/components/molecules/dateRangePicker"
import MemoizedHeader from "@/components/molecules/header"
import { memo } from "react"
import { FaArrowLeft } from "react-icons/fa"

const MemoItemReports = () => {
    return (
        <main className="pb-20">
            <header className="linear_gradient_background">
                <MemoizedHeader title="Item Reports" leftIcon={<FaArrowLeft />} />
            </header>
            <DateRangePicker />
            <ItemsHotelReports />
        </main>
    )
}

const ItemReports = memo(MemoItemReports)
export default ItemReports