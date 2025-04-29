import EscalationReport from "@/components/hotel/EscalationReport"
import MemoizedHeader from "@/components/molecules/header"
import { memo } from "react"
import { FaArrowLeft } from "react-icons/fa"

const MemoEscalationReports = () => {
    return (
        <main className="pb-20">
            <header className="linear_gradient_background">
                <MemoizedHeader title="Escalation Reports" leftIcon={<FaArrowLeft />} />
            </header>
            <EscalationReport />
        </main>
    )
}

const EscalationReports = memo(MemoEscalationReports)
export default EscalationReports