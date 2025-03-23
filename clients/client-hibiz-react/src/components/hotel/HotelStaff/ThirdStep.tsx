import { memo, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import useStaffStore from "@/components/store/hotel/useHotelStaff"
import useBusinessData from "@/components/store/useBusinessData"
import { useGetAllHotelServices } from "@/hooks/useHotelStaff"
import LoadingSpinner from "@/components/atom/loadingSpinner"

const ThirdStep = () => {
  const { selectedServices, toggleService, editServiceIds } = useStaffStore((state) => ({
    selectedServices: state.selectedServices,
    toggleService: state.toggleService,
    editServiceIds: state.editServiceIds,
  }))

  const businessId = useBusinessData((s) => s.businessData?._id)
  const { isLoading, hotelServicesData } = useGetAllHotelServices(businessId as string)

  useEffect(() => {
    if (editServiceIds && editServiceIds.length > 0 && hotelServicesData && hotelServicesData.length > 0) {
      const alreadySelected = editServiceIds.every((id) => selectedServices.some((service) => service._id === id))

      if (!alreadySelected) {
        editServiceIds.forEach((serviceId) => {
          const serviceToSelect = hotelServicesData.find(
            (service) => service._id === serviceId && !selectedServices.some((s) => s._id === serviceId),
          )

          if (serviceToSelect) {
            toggleService(serviceToSelect)
          }
        })
      }
    }
  }, [editServiceIds, hotelServicesData, selectedServices, toggleService])

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some((service) => service._id === serviceId)
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Assign Services</h2>
      <p className="text-sm text-muted-foreground">Select the services this staff member will be responsible for</p>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {hotelServicesData &&
          hotelServicesData.length > 0 &&
          hotelServicesData.map((service) => (
            <Card key={service._id} className={`border ${isServiceSelected(service._id) ? "border-primary" : ""}`}>
              <CardContent className="flex items-center justify-between p-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={service._id}
                    checked={isServiceSelected(service._id)}
                    onCheckedChange={() => toggleService(service)}
                  />
                  <Label htmlFor={service._id} className="cursor-pointer">
                    {service.name}
                  </Label>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      <div className="pt-2">
        <p className="text-sm font-medium">Selected services: {selectedServices.length}</p>
      </div>
    </div>
  )
}

export default memo(ThirdStep)

