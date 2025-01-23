import { Suspense, lazy } from "react"
import SpinnerMemo from "@/components/atoms/loadingSpinner"


const HeaderAlerts = lazy(() => import("@/components/liteAlerts/headerAlerts"))
const UnsettleTableData = lazy(() => import("@/components/unsettle"))

const Unsettle = () => {


    return (
        <main className="relative min-h-screen bg-gray-100 pb-[5rem]">
            <Suspense fallback={<SpinnerMemo />}>
                <HeaderAlerts hide />
            </Suspense>
            <Suspense fallback={<SpinnerMemo />}>
                <UnsettleTableData />
            </Suspense>
        </main>
    )
}

export default Unsettle

