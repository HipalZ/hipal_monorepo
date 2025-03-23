import { useState, useCallback } from "react"
import { Home, ChevronRight, ArrowLeft, Settings, Utensils, Bed, Car, SpadeIcon as Spa, Coffee } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import HotelServices from "./Services"

// Define the service types
type ServiceType = "services" | "rooms" | "restaurant" | "parking" | "spa" | "amenities"

// Define the service card data
const serviceCards = [
  {
    id: "services",
    title: "Hotel Services",
    description: "Manage all hotel services and their availability",
    icon: <Settings className="w-6 h-6 text-primary" />,
    color: "bg-blue-50 dark:bg-blue-950",
  },
  // {
  //   id: "rooms",
  //   title: "Room Services",
  //   description: "Manage room-specific services and amenities",
  //   icon: <Bed className="w-6 h-6 text-primary" />,
  //   color: "bg-green-50 dark:bg-green-950",
  // },
  // {
  //   id: "restaurant",
  //   title: "Restaurant",
  //   description: "Manage restaurant services and menu items",
  //   icon: <Utensils className="w-6 h-6 text-primary" />,
  //   color: "bg-amber-50 dark:bg-amber-950",
  // },
  // {
  //   id: "parking",
  //   title: "Parking",
  //   description: "Manage valet and parking services",
  //   icon: <Car className="w-6 h-6 text-primary" />,
  //   color: "bg-purple-50 dark:bg-purple-950",
  // },
  // {
  //   id: "spa",
  //   title: "Spa & Wellness",
  //   description: "Manage spa and wellness services",
  //   icon: <Spa className="w-6 h-6 text-primary" />,
  //   color: "bg-rose-50 dark:bg-rose-950",
  // },
  // {
  //   id: "amenities",
  //   title: "Amenities",
  //   description: "Manage additional hotel amenities",
  //   icon: <Coffee className="w-6 h-6 text-primary" />,
  //   color: "bg-cyan-50 dark:bg-cyan-950",
  // },
]

const HotelActions = () => {
  const [activeService, setActiveService] = useState<ServiceType | null>(null)

  const handleServiceClick = useCallback((serviceId: ServiceType) => {
    setActiveService(serviceId)
  }, [])

  const handleBackClick = useCallback(() => {
    setActiveService(null)
  }, [])

  // Render the service cards grid
  const renderServiceCards = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {serviceCards.map((service) => (
        <Card
          key={service.id}
          className={`cursor-pointer hover:shadow-md transition-all ${service.color} border-none`}
          onClick={() => handleServiceClick(service.id as ServiceType)}
        >
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white rounded-full shadow-sm dark:bg-gray-800">{service.icon}</div>
              <div>
                <h3 className="text-lg font-medium">{service.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Render the active service component
  const renderActiveService = () => {
    switch (activeService) {
      case "services":
        return <HotelServices />
      case "rooms":
      case "restaurant":
      case "parking":
      case "spa":
      case "amenities":
        // Placeholder for future implementations
        return (
          <div className="py-10 text-center">
            <h2 className="mb-4 text-2xl font-bold">{serviceCards.find((s) => s.id === activeService)?.title}</h2>
            <p className="text-muted-foreground">This feature is coming soon!</p>
          </div>
        )
      default:
        return null
    }
  }

  // Get the active service title for breadcrumb
  const getActiveServiceTitle = () => {
    return serviceCards.find((service) => service.id === activeService)?.title || ""
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      {/* Breadcrumb navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" onClick={handleBackClick}>
              <Home className="w-4 h-4 mr-1" />
              <span>Dashboard</span>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator>
            <ChevronRight className="w-4 h-4" />
          </BreadcrumbSeparator>

          <BreadcrumbItem>
            <BreadcrumbLink href="#" onClick={handleBackClick}>
              Hotel Actions
            </BreadcrumbLink>
          </BreadcrumbItem>

          {activeService && (
            <>
              <BreadcrumbSeparator>
                <ChevronRight className="w-4 h-4" />
              </BreadcrumbSeparator>

              <BreadcrumbItem>
                <BreadcrumbLink href="#">{getActiveServiceTitle()}</BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Back button when viewing a service */}
      {activeService && (
        <Button variant="outline" size="sm" onClick={handleBackClick} className="flex items-center mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Actions
        </Button>
      )}

      {/* Main content */}
      <div className="mt-4">{activeService ? renderActiveService() : renderServiceCards()}</div>
    </div>
  )
}

export default HotelActions

