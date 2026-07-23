import { useState, useCallback } from "react";
import { ArrowLeft, Cog, LogOut } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HotelServices from "./Services";
import CheckoutAutomation from "./CheckoutAutomation";

// Define the service types
type ServiceType =
  | "services"
  | "checkout"
  | "rooms"
  | "restaurant"
  | "parking"
  | "spa"
  | "amenities";

// Define the service card data
const serviceCards = [
  {
    id: "services",
    title: "Hotel Services",
    description: "Manage all hotel services and their availability",
    icon: (
      <div className="p-3 transition-transform transform rounded-full shadow-lg bg-gradient-to-br from-blue-400 to-blue-600 hover:scale-105">
        <Cog className="w-8 h-8 text-white drop-shadow-md" />
      </div>
    ),
    color: "bg-rose-50 dark:bg-blue-950",
  },
  {
    id: "checkout",
    title: "Checkout Automation",
    description:
      "Raise cleaning and turnover services automatically when a room is checked out",
    icon: (
      <div className="p-3 transition-transform transform rounded-full shadow-lg bg-gradient-to-br from-amber-400 to-amber-600 hover:scale-105">
        <LogOut className="w-8 h-8 text-white drop-shadow-md" />
      </div>
    ),
    color: "bg-amber-50 dark:bg-amber-950",
  },
];

const HotelActions = () => {
  const [activeService, setActiveService] = useState<ServiceType | null>(null);

  const handleServiceClick = useCallback((serviceId: ServiceType) => {
    setActiveService(serviceId);
  }, []);

  const handleBackClick = useCallback(() => {
    setActiveService(null);
  }, []);

  // Render the service cards grid
  const renderServiceCards = () => (
    <div className="grid grid-cols-1 gap-4 xl:px-0 md:grid-cols-2 lg:grid-cols-3 pb-[3rem]">
      {serviceCards.map((service) => (
        <Card
          key={service.id}
          onClick={() => handleServiceClick(service.id as ServiceType)}
          className="relative h-full transition-all hover:shadow-md hover:border-primary/50"
        >
          <CardHeader className="pb-2 h-[7rem]">
            <CardTitle className="absolute top-4 left-4">
              {service.icon}
            </CardTitle>
            <CardTitle className="pb-4 text-xl ml-[4rem]">
              {service.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[3rem]">
            <CardDescription>{service.description}</CardDescription>
          </CardContent>
          <CardFooter className="pt-2">
            <span className="text-sm text-primary">Configure →</span>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  // Render the active service component
  const renderActiveService = () => {
    switch (activeService) {
      case "services":
        return <HotelServices />;
      case "checkout":
        return <CheckoutAutomation />;
      default:
        return null;
    }
  };

  
  return (
    <div className="px-4 pt-6 pb-8 xl:pt-0 mx-auto">
      <h2 className="mb-6 text-3xl font-bold xl:px-0">Actions</h2>
      {/* Back button when viewing a service */}
      {activeService && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleBackClick}
          className="flex items-center mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Actions
        </Button>
      )}

      {/* Main content */}
      <div className="mt-4">
        {activeService ? renderActiveService() : renderServiceCards()}
      </div>
    </div>
  );
};

export default HotelActions;
