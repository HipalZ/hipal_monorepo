import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton"
import useZoneStore from "@/components/store/useZone"
import useBusinessData from "@/components/store/useBusinessData"
import { useCreateZone, useUpdateZone } from "@/hooks/useZone"
import LoadingSpinner from "@/components/atom/loadingSpinner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Percent, Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"

const AddZone = () => {
  const {
    isAvailable,
    setIsAvailable,
    tax,
    setTax,
    zoneName,
    setZoneName,
    selectedTableIds,
    selectedCouponIds,
    resetAllValues,
    editZoneId,
  } = useZoneStore()

  const { isPending: creatingZone, createZone } = useCreateZone()
  const { isPending: updatingZone, updateZone } = useUpdateZone()

  const businessData = useBusinessData((s) => s.businessData)

  // const openLinkModalFunc = useCallback(
  //   (type: link) => {
  //     setLinkModal(true)
  //     setLinkModalType(type)
  //   },
  //   [setLinkModal, setLinkModalType],
  // )

  // const closeLinkModalFunc = useCallback(() => {
  //   setLinkModal(false)
  //   setLinkModalType("")
  // }, [setLinkModal, setLinkModalType])

  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = Number.parseFloat(e.target.value)
    if (value < 1) value = 1
    if (value > 100) value = 100
    setTax(value)
  }

  const createZoneFunc = async () => {
    if (!zoneName || zoneName.trim() === "") return toast.error("Zone name is required")

    const payload = {
      name: zoneName.toLowerCase(),
      businessId: businessData?._id,
      visibility: isAvailable,
      taxes: tax,
      tableIds: selectedTableIds,
      couponIds: selectedCouponIds,
    }
    await createZone(payload)
  }

  const updateZoneFunc = async () => {
    if (!zoneName || zoneName.trim() === "") return toast.error("Zone name is required")
    const payload = {
      name: zoneName.toLowerCase(),
      visibility: isAvailable,
      businessId: businessData?._id,
      taxes: tax,
      tableIds: selectedTableIds,
      couponIds: selectedCouponIds,
      _id: editZoneId,
      zoneId: editZoneId,
    }
    await updateZone(payload)
  }

  if (updatingZone || creatingZone) return <LoadingSpinner />

  return (
    <>
      <Card className="max-w-md mx-auto border-none shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold">
            <MapPin className="w-6 h-6 mr-2" />
            {editZoneId ? "Edit Zone" : "Create New Zone"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="zoneName" className="text-lg font-semibold">
              Zone Name
            </Label>
            <Input
              id="zoneName"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              placeholder="Enter zone name"
              className="text-lg"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="availability" className="flex items-center text-lg font-semibold">
              {isAvailable ? <Eye className="w-5 h-5 mr-2" /> : <EyeOff className="w-5 h-5 mr-2" />}
              Visibility
            </Label>
            <Switch id="availability" checked={isAvailable} onCheckedChange={setIsAvailable} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax" className="flex items-center text-lg font-semibold">
              <Percent className="w-5 h-5 mr-2" />
              Tax Rate
            </Label>
            <Input
              id="tax"
              type="number"
              min={1}
              max={100}
              value={tax}
              onChange={handleTaxChange}
              className="text-lg"
            />
          </div>
        </CardContent>
      </Card>

      <AdvancedBottomButton
        maxWidth="30rem"
        fixed={true}
        position="mid"
        buttons={[
          {
            text: "Cancel",
            onClick: resetAllValues,
            isBackButton: true,
            className: "rounded-md pl-3",
          },
          {
            text: editZoneId ? "Update Zone" : "Create Zone",
            onClick: editZoneId ? updateZoneFunc : createZoneFunc,
            className: "rounded-md pl-3 w-full",
            swipe: zoneName,
            disable: !zoneName,
            highlight: true,
          },
        ]}
      />
    </>
  )
}

export default AddZone

