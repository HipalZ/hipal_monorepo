import { useCallback } from "react"
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton"
import LoadingSpinner from "@/components/atom/loadingSpinner"
import useZoneStore, { type ITable, type IZone } from "@/components/store/useZone"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUpdateZone } from "@/hooks/useZone"
import { Delete, ShieldCheck, Users } from "lucide-react"
import { useError } from "@/components/store/useError"

const ShowZoneDetails = () => {
  const {
    saveZoneDetails,
    allTables,
    setSaveZoneDetails,
    selectedTableIds,
    setCreateZoneModal,
    setEditZone,
    setShowZoneDetails,
    toggleTableIds
  } = useZoneStore()
  const { isPending, updateZone } = useUpdateZone()
  const {setError,setOpenErrorModal} = useError()

  const saveZoneData = useCallback(
    (zone: IZone) => {
      setCreateZoneModal(true)
      setEditZone(zone)
    },
    [setCreateZoneModal, setEditZone],
  )

  const getTablesForZone = useCallback((zoneId: string) => {
    return allTables.filter((table: ITable) => table.internalZoneId === zoneId)
  },[allTables])

  const handleTableSelection = (tableId: string) => {
    toggleTableIds(tableId)
  }

  const isActiveTableInZone = useCallback((zoneId: string) => {
    return allTables.some((table) => table.internalZoneId === zoneId && table.status !== "EMPTY")
  }, [allTables])

  const quickEditZone = async (zone: IZone) => {

    if (isActiveTableInZone(zone?._id as string)) {
      setError("Zone cannot be disabled because there are active tables.")
      setOpenErrorModal(true)
      return
    }

    await updateZone({
      _id: zone._id || "",
      visibility: !zone.visibility,
      name: zone.name,
      businessId: zone.businessId,
    })
    setShowZoneDetails(false)
  }

  const closeZoneDetailsModal = useCallback(() => {
    setSaveZoneDetails(null)
    setShowZoneDetails(false)
  }, [setSaveZoneDetails, setShowZoneDetails])

  if (isPending) {
    return <LoadingSpinner />
  }

  return (
    <Card className="w-full mx-auto border-none shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-2xl font-bold">{saveZoneDetails?.name}</span>
          {saveZoneDetails?.visibility ? (
            <Button size="sm" variant="destructive" onClick={() => quickEditZone(saveZoneDetails)}>
              <Delete className="w-4 h-4 mr-2" /> Disable Zone
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => quickEditZone(saveZoneDetails)}>
              <ShieldCheck className="w-4 h-4 mr-2" /> Enable Zone
            </Button>
          )}
        </CardTitle>
        <div className="flex items-center mt-2 space-x-2">
          <Badge variant="secondary">Tax: {saveZoneDetails?.taxes}%</Badge>
          <Badge variant={saveZoneDetails?.visibility ? "outline" : "destructive"}>
            {saveZoneDetails?.visibility ? "Visible" : "Hidden"}
          </Badge>
          <Badge variant="outline">Tables: {getTablesForZone(saveZoneDetails?._id).length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="">
        <ScrollArea className="h-[90dvh] lg:h-[65dvh] ">
          {getTablesForZone(saveZoneDetails?._id).length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3 mb-[10rem]">
              {getTablesForZone(saveZoneDetails?._id).map((table: ITable) => (
                <Card key={table._id} className="transition-colors hover:bg-accent">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">{table.name}</h3>
                      <Badge variant={table.status === "EMPTY" ? "outline" : "destructive"}>{table.status}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-4 h-4 mr-2" />
                        Capacity: {table.capacity}
                      </div>
                      <div className="flex items-center">
                        <Checkbox
                          checked={selectedTableIds?.includes(table._id)}
                          onCheckedChange={() => handleTableSelection(table._id)}
                          className="mr-2"
                        />
                        <span className="text-sm">Select Table</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No tables in this zone</p>
          )}
        </ScrollArea>
      </CardContent>
      <AdvancedBottomButton
        maxWidth="30rem"
        fixed={true}
        position="mid"
        buttons={[
          {
            text: "Cancel",
            onClick: closeZoneDetailsModal,
            isBackButton: true,
            className: "rounded-md pl-3",
          },
          {
            text: "Edit Zone",
            onClick: () => saveZoneData(saveZoneDetails),
            className: "rounded-md pl-3",
          },
        ]}
      />
    </Card>
  )
}

export default ShowZoneDetails

