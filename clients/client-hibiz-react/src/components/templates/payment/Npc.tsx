import { memo, lazy, Suspense } from "react"
import { useDues } from "@/components/store/useDues"
import LoadingSpinner from "@/components/atom/loadingSpinner"
import { useParams } from "react-router-dom"
import { useAllNpcUsers } from "@/hooks/useNpc"
const AddNpcUser = lazy(() => import("./AddNpcUser"))
const PopUp = lazy(() => import("@/components/atom/popUp"))
const BottomButton = lazy(() => import("@/components/atom/bottomButton"))

const MemoNpc = () => {
    const { isUserAdded, setIsUserAdded } = useDues((s) => ({
        isUserAdded: s.isUserAdded,
        setIsUserAdded: s.setIsUserAdded,
    }))
    const { businessId } = useParams()
    const { isLoading, data } = useAllNpcUsers(businessId as string)

    return (
        <div className="container px-4 pt-4 pb-[7rem] mx-auto">
            <h1 className="mb-6 text-2xl font-bold">Npc users</h1>
            {

                isLoading ? (
                    <LoadingSpinner />
                ) : <div >
                    {
                        data && data.length > 0 ? (
                            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {data?.map((npcUser) => (
                                    <div key={npcUser._id} className="p-4 bg-white rounded-lg shadow-md">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-lg font-bold">{npcUser.userId.name}</h2>
                                                <p className="text-sm text-gray-500">{npcUser.userId.phone}</p>
                                            </div>

                                        </div>
                                    </div>
                                ))}
                            </section>
                        ) : (
                            <p className="text-center text-gray-500">No users available</p>
                        )
                    }
                </div>
            }


            <Suspense fallback={<LoadingSpinner />}>
                <BottomButton
                    fixed
                    buttons={[
                        {
                            text: "Add Npc User",
                            onClick: () => setIsUserAdded(true),
                        },
                    ]}
                />
            </Suspense>

            {isUserAdded && (
                <Suspense fallback={<LoadingSpinner />}>
                    <PopUp onClose={() => setIsUserAdded(false)} show={isUserAdded} height="h-[70dvh]" width="w-[30rem]">
                        <AddNpcUser />
                    </PopUp>
                </Suspense>
            )}
        </div>
    )
}

const Npc = memo(MemoNpc)
export default Npc

