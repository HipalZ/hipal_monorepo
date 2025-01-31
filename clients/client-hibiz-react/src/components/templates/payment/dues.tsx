import { memo, lazy, Suspense } from "react"
import { useDues } from "@/components/store/useDues"
import LoadingSpinner from "@/components/atom/loadingSpinner"
import { useAllDueUsers } from "@/hooks/useDuesApi"
import { useParams } from "react-router-dom"
import UserDueCard from "./userDueCard"
import type { IDuesPersonsData } from "@/components/types/businessData"

const AddUserToDue = lazy(() => import("./addPersonIndue"))
const PopUp = lazy(() => import("@/components/atom/popUp"))
const BottomButton = lazy(() => import("@/components/atom/bottomButton"))

const MemoDues = () => {
    const { isUserAdded, setIsUserAdded } = useDues((s) => ({
        isUserAdded: s.isUserAdded,
        setIsUserAdded: s.setIsUserAdded,
    }))
    const { businessId } = useParams()
    const { isLoading, data } = useAllDueUsers(businessId)

    return (
        <div className="container px-4 pt-4 pb-[7rem] mx-auto">
            <h1 className="mb-6 text-2xl font-bold">User Dues</h1>
            {isLoading ? (
                <LoadingSpinner />
            ) : data && data.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {data?.map((userDue: IDuesPersonsData) => (
                        <UserDueCard key={userDue._id} userDue={userDue} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500">No users available</p>
            )}

            <Suspense fallback={<LoadingSpinner />}>
                <BottomButton
                    fixed
                    buttons={[
                        {
                            text: "Add User Dues",
                            onClick: () => setIsUserAdded(true),
                        },
                    ]}
                />
            </Suspense>

            {isUserAdded && (
                <Suspense fallback={<LoadingSpinner />}>
                    <PopUp onClose={() => setIsUserAdded(false)} show={isUserAdded} height="h-[70dvh]" width="w-[30rem]">
                        <AddUserToDue />
                    </PopUp>
                </Suspense>
            )}
        </div>
    )
}

const Dues = memo(MemoDues)
export default Dues

