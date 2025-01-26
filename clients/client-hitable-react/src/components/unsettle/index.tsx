import { memo } from 'react'
import { apiRpc } from "@hi/common"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import type { IUnsettleTables } from "@/components/types/hiClientzData"
import { Card, CardContent } from "@/components/ui/card"
import SpinnerMemo from "@/components/atoms/loadingSpinner"
import { useUnsettle } from '../store/useUnsettle'
import BottomPopUp from '../atoms/universalPopup'
import SettleTable from './settle'
const MemoUnsettleTableData = () => {

    const { businessId } = useParams()

    const { openUnsettle, setOpenUnsettle, setSelectedUnsettleData } = useUnsettle()
    const getUnsettledTables = async () => {
        const response = await apiRpc.table.unsettle_table[":businessId"].$get({
            param: { businessId: businessId },
        })
        const res = await response.json()
        return res?.data as IUnsettleTables[]
    }

    const { isLoading, data } = useQuery({
        queryKey: ["getUnsettledTables", businessId],
        queryFn: getUnsettledTables,
        enabled: !!businessId,
    })

    const saveUnsettledTables = (table: IUnsettleTables) => {
        setSelectedUnsettleData(table)
        setOpenUnsettle(true)
    }

    if (isLoading) {
        return <SpinnerMemo />
    }
    return (
        <>
            <h3 className="p-4 text-lg font-semibold text-gray-800">
                Unsettled Tables
            </h3>

            <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {data && data.length > 0 ? (
                    data.map((table: IUnsettleTables) => (
                        <Card onClick={() => saveUnsettledTables(table)} key={table._id} className="transition-shadow shadow-md hover:shadow-lg">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold">{table.tableId.name}</h3>
                                    <span className="font-bold text-green-600">₹{table.currentTableAmount.toLocaleString("en-IN")}</span>
                                </div>
                                <p className="text-sm text-gray-600">Action by: {table.performedBy.name}</p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p className="text-center text-gray-600 col-span-full">No unsettled tables found.</p>
                )}
            </div>
            {
                openUnsettle && (
                    <BottomPopUp height='h-[80dvh]' width="w-[30rem]" show={openUnsettle} onClose={() => setOpenUnsettle(false)}>
                        <SettleTable />
                    </BottomPopUp>
                )
            }
        </>
    )
}

const UnsettleTableData = memo(MemoUnsettleTableData)
export default UnsettleTableData