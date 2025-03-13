import { useState, useCallback, useEffect } from "react"
import { Check, X, ToggleLeft, ToggleRight, Settings, Loader2 } from "lucide-react"
import useBusinessData from "@/components/store/useBusinessData"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import LoadingSpinner from "@/components/atom/loadingSpinner"
import { toast } from "react-hot-toast"
import { type IService, useGetServiceCategories, useUpdateHotelService } from "@/components/store/hotel/useHotelServices"

const HotelServices = () => {
  const businessId = useBusinessData((s) => s.businessData?._id)
  const { categoriesData, categoriesLoading, refetchCategories } = useGetServiceCategories(businessId as string)
  const { updateService, updateServiceLoading } = useUpdateHotelService()

  // Track which service is currently being updated
  const [updatingServiceId, setUpdatingServiceId] = useState<string | null>(null)

  const [serviceAvailability, setServiceAvailability] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (categoriesData) {
      const availabilityMap: Record<string, boolean> = {}

      categoriesData.forEach((category) => {
        category.serviceIds.forEach((service) => {
          availabilityMap[service._id] = service.availability !== undefined ? service.availability : true
        })
      })

      setServiceAvailability(availabilityMap)
    }
  }, [categoriesData])

  const handleToggleAvailability = useCallback(
    async (service: IService, categoryName: string) => {
      if (!businessId || updateServiceLoading) return

      const currentAvailability = serviceAvailability[service._id] || false
      const newAvailability = !currentAvailability

      try {
        setUpdatingServiceId(service._id)

        setServiceAvailability((prev) => ({
          ...prev,
          [service._id]: newAvailability,
        }))

        await updateService({
          name: service.name,
          businessId: businessId,
          availability: newAvailability,
          serviceId: service._id,
        })


        toast.success(`${service.name} is now ${newAvailability ? "available" : "unavailable"}`)
      } catch (error) {
        setServiceAvailability((prev) => ({
          ...prev,
          [service._id]: currentAvailability,
        }))

        console.error("Error updating service:", error)
        toast.error("Failed to update service availability")
      } finally {
        setUpdatingServiceId(null)
      }
    },
    [businessId, updateService, updateServiceLoading, refetchCategories, serviceAvailability],
  )

  const totalServices = categoriesData?.reduce((count, category) => count + category.serviceIds.length, 0) || 0

  return (
    <div className="px-4 py-6 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Manage Services</h2>
        <Badge variant="outline" className="px-3 py-1">
          {totalServices} Services
        </Badge>
      </div>

      {categoriesLoading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : categoriesData && categoriesData.length > 0 ? (
        <div className="space-y-8 pb-[7rem]">
          {categoriesData.map((category) => (
            <div key={category._id} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 overflow-hidden rounded-md bg-primary/10">
                  {category.image ? (
                    <img
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Settings className="w-5 h-5 m-1.5 text-primary" />
                  )}
                </div>
                <h3 className="text-lg font-semibold">{category.name}</h3>
              </div>

              {category.serviceIds.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 ">
                  {category.serviceIds.map((service) => (
                    <ServiceCard
                      key={service._id}
                      service={{
                        ...service,
                        availability: serviceAvailability[service._id] || false,
                      }}
                      categoryName={category.name}
                      onToggle={handleToggleAvailability}
                      isUpdating={updatingServiceId === service._id}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-4 text-center bg-muted/30">
                  <p className="text-sm text-muted-foreground">No services in this category</p>
                </Card>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

// Service Card Component
interface ServiceCardProps {
  service: {
    _id: string
    name: string
    image: string
    availability: boolean
  }
  categoryName: string
  onToggle: (service: any, categoryName: string) => void
  isUpdating: boolean
}

const ServiceCard = ({ service, categoryName, onToggle, isUpdating }: ServiceCardProps) => {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 overflow-hidden rounded-md bg-muted">
                {!service.image ? (
                  <img
                    src={service.image || "/placeholder.svg"}
                    alt={service.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-primary/10">
                    <span className="text-lg font-bold text-primary">{service.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <h3 className="font-medium">{service.name}</h3>
            </div>
            {isUpdating ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <Switch
                checked={service.availability}
                onCheckedChange={() => onToggle(service, categoryName)}
                aria-label={`Toggle ${service.name} availability`}
              />
            )}
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between p-3 bg-muted/30">
          <div className="flex items-center">
            {service.availability ? (
              <>
                <ToggleRight className="h-4 w-4 mr-1.5 text-green-600" />
                <span className="text-sm font-medium text-green-600">Available</span>
              </>
            ) : (
              <>
                <ToggleLeft className="h-4 w-4 mr-1.5 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">Unavailable</span>
              </>
            )}
          </div>
          <Badge
            variant="outline"
            className={`text-xs ${service.availability ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-700 border-gray-200"}`}
          >
            {service.availability ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
            {service.availability ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

// Empty State Component
const EmptyState = () => {
  return (
    <Card className="p-8 mt-4 text-center">
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="p-4 rounded-full shadow-lg bg-gradient-to-br from-blue-400 to-blue-600">
          <Settings className="w-10 h-10 text-white drop-shadow-md" />
        </div>
        <h3 className="text-lg font-medium">No Services Available</h3>
        <p className="text-sm text-muted-foreground">No services have been configured for this hotel yet</p>
      </div>
    </Card>
  )
}

export default HotelServices

