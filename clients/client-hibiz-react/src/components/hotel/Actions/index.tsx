import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Cog, LogOut } from 'lucide-react';
import { useCallback, useState } from 'react';
import CheckoutAutomation from './CheckoutAutomation';
import HotelServices from './Services';

// Define the service types
type ServiceType = 'services' | 'checkout' | 'rooms' | 'restaurant' | 'parking' | 'spa' | 'amenities';

// Define the service card data
const serviceCards = [
  {
    id: 'services',
    title: 'Hotel Services',
    description: 'Manage all hotel services and their availability',
    icon: (
      <div className="transform rounded-full bg-gradient-to-br from-blue-400 to-blue-600 p-3 shadow-lg transition-transform hover:scale-105">
        <Cog className="h-8 w-8 text-white drop-shadow-md" />
      </div>
    ),
    color: 'bg-rose-50 dark:bg-blue-950',
  },
  {
    id: 'checkout',
    title: 'Checkout Automation',
    description: 'Raise cleaning and turnover services automatically when a room is checked out',
    icon: (
      <div className="transform rounded-full bg-gradient-to-br from-amber-400 to-amber-600 p-3 shadow-lg transition-transform hover:scale-105">
        <LogOut className="h-8 w-8 text-white drop-shadow-md" />
      </div>
    ),
    color: 'bg-amber-50 dark:bg-amber-950',
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
    <div className="grid grid-cols-1 gap-4 pb-[3rem] md:grid-cols-2 lg:grid-cols-3 xl:px-0">
      {serviceCards.map((service) => (
        <Card
          key={service.id}
          onClick={() => handleServiceClick(service.id as ServiceType)}
          className="hover:border-primary/50 relative h-full transition-all hover:shadow-md"
        >
          <CardHeader className="h-[7rem] pb-2">
            <CardTitle className="absolute left-4 top-4">{service.icon}</CardTitle>
            <CardTitle className="ml-[4rem] pb-4 text-xl">{service.title}</CardTitle>
          </CardHeader>
          <CardContent className="h-[3rem]">
            <CardDescription>{service.description}</CardDescription>
          </CardContent>
          <CardFooter className="pt-2">
            <span className="text-primary text-sm">Configure →</span>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  // Render the active service component
  const renderActiveService = () => {
    switch (activeService) {
      case 'services':
        return <HotelServices />;
      case 'checkout':
        return <CheckoutAutomation />;
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto px-4 pb-8 pt-6 xl:pt-0">
      <div className="mb-6 flex items-center gap-3">
        {activeService && (
          <ArrowLeft onClick={handleBackClick} className="hover:bg-muted h-8 w-8 cursor-pointer rounded-md p-1.5 transition-colors" />
        )}

        <h2 className="text-3xl font-bold leading-none">Actions</h2>
      </div>

      <div>{activeService ? renderActiveService() : renderServiceCards()}</div>
    </div>
  );
};

export default HotelActions;
