import { memo, useCallback } from "react"
import { Edit, Delete,ShieldCheck } from "lucide-react"
import BottomButton from "@/components/atom/bottomButton"
import PopUp from "@/components/atom/popUp"
import useZoneStore, { type IZone } from "@/components/store/useZone"
import AddZone from "./AddZone"
import useBusinessData from "@/components/store/useBusinessData"
import { useGetAllZones, useUpdateZone } from "@/hooks/useZone"
import LoadingSpinner from "@/components/atom/loadingSpinner"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"


const MemoZonesMain = () => {
  const { createZoneModal, setCreateZoneModal, allZones, setEditZone } = useZoneStore()
  const businessData = useBusinessData((s) => s?.businessData)
  const { isLoading: gettingZones } = useGetAllZones(businessData?._id)
  const { isPending, updateZone } = useUpdateZone()

  const openZoneModalFunc = useCallback(() => {
    setCreateZoneModal(true)
  }, [setCreateZoneModal])

  const saveZoneData = useCallback(
    (zone: IZone) => {
      setCreateZoneModal(true)
      setEditZone(zone)
    },
    [setCreateZoneModal, setEditZone],
  )

  if (gettingZones || isPending) return <LoadingSpinner />

  return (
    <section className="p-4 mt-[5rem] lg:mt-[4rem]">
      <Accordion type="single" collapsible className="w-full space-y-4">
        {allZones.map((zone) => (
          <AccordionItem key={zone._id} value={zone._id} className="overflow-hidden bg-white rounded-lg shadow-md">
            <AccordionTrigger className="px-4 py-2 hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <h2 className="text-xl font-semibold">{zone.name}</h2>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-500">Tax: {zone.taxes}</p>
                  <Badge variant={zone.visibility ? "outline" : "destructive"}>
                    {zone.visibility ? "Visible" : "Hidden"}
                  </Badge>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(zone).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium">{key}</TableCell>
                        <TableCell>{typeof value === "boolean" ? value.toString() : value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <section className="flex justify-between">
                  <Button onClick={() => saveZoneData(zone)} className="mt-4">
                    <Edit className="w-4 h-4 mr-2" /> Edit Zone
                  </Button>
                  {
                    zone.visibility && <Button variant="destructive" onClick={() => updateZone({
                      _id: zone._id || "",
                      visibility: !zone.visibility,
                      name: zone.name,
                      businessId: zone.businessId,
                    })} className="mt-4">
                      <Delete className="w-4 h-4 mr-2" /> Disable Zone
                    </Button>
                  }
                  {
                    !zone.visibility && <Button onClick={() => updateZone({
                      _id: zone._id || "",
                      visibility: !zone.visibility,
                      name: zone.name,
                      businessId: zone.businessId,
                    })} className="mt-4">
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Enable Zone
                    </Button>
                  }
                </section>

              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

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

