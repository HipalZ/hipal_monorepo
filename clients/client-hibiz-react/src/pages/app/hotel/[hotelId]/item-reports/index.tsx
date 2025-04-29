import MemoizedHeader from "@/components/molecules/header"
import Items from "@/components/templates/analytics/items"
import { memo } from "react"
import { FaArrowLeft } from "react-icons/fa"

const MemoItemReports = () => {
    return (
        <main className="pb-20">
            <header className="linear_gradient_background">
                <MemoizedHeader title="Item Reports" leftIcon={<FaArrowLeft />} />
            </header>
            <Items />
        </main>
    )
}

const ItemReports = memo(MemoItemReports)
export default ItemReports