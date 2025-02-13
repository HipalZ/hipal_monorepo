import { memo, useCallback } from "react"
import BottomButton from "@/components/atom/bottomButton"
import PopUp from "@/components/atom/popUp"
import useZoneStore, { type IZone, type ITable } from "@/components/store/useZone"
import AddZone from "./AddZone"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import ShowZoneDetails from "./ShowZoneDetails"

const MemoZonesMain = () => {
  const {
    createZoneModal,
    setCreateZoneModal,
    allZones,
    showZoneDetails,
    allTables,
    setShowZoneDetails,
    setSaveZoneDetails
  } = useZoneStore()


  const openZoneModalFunc = useCallback(() => {
    setCreateZoneModal(true)
  }, [setCreateZoneModal])

  const getTablesForZone = (zoneId: string) => {
    return allTables.filter((table: ITable) => table.internalZoneId === zoneId)
  }

  const openZoneDetailsModal = useCallback((zone: IZone) => {
    setShowZoneDetails(true)
    setSaveZoneDetails(zone)
  }, [setShowZoneDetails, setSaveZoneDetails])



  return (
    <section className="p-4 ">
      <div className="grid items-start w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allZones?.map((zone) => (
          <Card key={zone._id} className="overflow-hidden cursor-pointer"
            onClick={() => openZoneDetailsModal(zone)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-start w-full text-left">
                <div className="flex items-center justify-between w-full">
                  <h2 className="text-xl font-semibold">{zone.name}</h2>
                </div>
                <div className="flex items-center mt-2 space-x-2">
                  <Badge variant="secondary">Tax: {zone.taxes}%</Badge>
                  <Badge variant={zone.visibility ? "outline" : "destructive"}>
                    {zone.visibility ? "Visible" : "Hidden"}
                  </Badge>
                  <Badge variant="outline">Tables: {getTablesForZone(zone?._id).length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {createZoneModal && (
        <PopUp
          width="w-[30rem]"
          height="h-[100dvh] lg:h-[80dvh]"
          hide
          show={createZoneModal}
          onClose={() => setCreateZoneModal(false)}
        >
          <AddZone />
        </PopUp>
      )}

      {showZoneDetails && (
        <PopUp hide height="h-[100dvh] lg:h-[80dvh]" show={showZoneDetails} onClose={() => setShowZoneDetails(false)}>
          <ShowZoneDetails />
        </PopUp>
      )}

      <BottomButton
        fixed
        buttons={[
          {
            text: "Add Zone",
            onClick: openZoneModalFunc,
          },
        ]}
      />
    </section>
  )
}

const ZonesMain = memo(MemoZonesMain)
export default ZonesMain

