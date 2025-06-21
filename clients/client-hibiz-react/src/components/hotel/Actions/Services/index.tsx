import { lazy, useState, useCallback, useEffect, Suspense } from "react";
import {
  Check,
  X,
  ToggleLeft,
  ToggleRight,
  Settings,
  Loader2,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { toast } from "react-hot-toast";
import useBusinessData from "@/components/store/useBusinessData";
import {
  type IService,
  useGetServiceCategories,
  useUpdateHotelService,
} from "@/components/store/hotel/useHotelServices";
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton";
import PopUp from "@/components/atom/popUp";
const ServicesForm = lazy(() => import("./HotelServices"));

const HotelServices = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);
  const { categoriesData, categoriesLoading, refetchCategories } =
    useGetServiceCategories(businessId as string);
  const { updateService, updateServiceLoading } = useUpdateHotelService();
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingServiceId, setUpdatingServiceId] = useState<string | null>(
    null,
  );
  const [serviceAvailability, setServiceAvailability] = useState<
    Record<string, boolean>
  >({});

  const [openService, setOpenService] = useState(false);

  // Initialize service availability from API data
  useEffect(() => {
    if (categoriesData) {
      const availabilityMap: Record<string, boolean> = {};

      for (const category of categoriesData) {
        for (const service of category.serviceIds) {
          // Default to true if availability is not specified
          availabilityMap[service._id] =
            service.availability !== undefined ? service.availability : true;
        }
      }

      setServiceAvailability(availabilityMap);
    }
  }, [categoriesData]);

  const handleToggleAvailability = useCallback(
    async (service: IService) => {
      if (!businessId || updateServiceLoading) return;

      const currentAvailability = serviceAvailability[service._id] || false;
      const newAvailability = !currentAvailability;

      try {
        setUpdatingServiceId(service._id);

        // Optimistically update the UI
        setServiceAvailability((prev) => ({
          ...prev,
          [service._id]: newAvailability,
        }));

        await updateService({
          name: service.name,
          businessId: businessId,
          availability: newAvailability,
          serviceId: service._id,
        });

        // Refetch categories to ensure we have the latest data
        await refetchCategories();

        toast.success(
          `${service.name} is now ${
            newAvailability ? "available" : "unavailable"
          }`,
        );
      } catch (error) {
        // Revert the optimistic update on error
        setServiceAvailability((prev) => ({
          ...prev,
          [service._id]: currentAvailability,
        }));

        console.error("Error updating service:", error);
        toast.error("Failed to update service availability");
      } finally {
        setUpdatingServiceId(null);
      }
    },
    [
      businessId,
      updateService,
      updateServiceLoading,
      refetchCategories,
      serviceAvailability,
    ],
  );

  // Filter categories and services based on search query
  const filteredCategories = useCallback(() => {
    if (!categoriesData || !searchQuery.trim()) return categoriesData;

    return categoriesData
      .map((category) => {
        // Filter services within this category
        const filteredServices = category.serviceIds.filter((service) =>
          service.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );

        // Return a new category object with filtered services
        return {
          ...category,
          serviceIds: filteredServices,
        };
      })
      .filter((category) => category.serviceIds.length > 0); // Only keep categories with matching services
  }, [categoriesData, searchQuery])();

  // Count total services and filtered services
  const totalServices = useCallback(() => {
    return (
      categoriesData?.reduce(
        (count, category) => count + category.serviceIds.length,
        0,
      ) || 0
    );
  }, [categoriesData])();

  const filteredServicesCount = useCallback(() => {
    return (
      filteredCategories?.reduce(
        (count, category) => count + category.serviceIds.length,
        0,
      ) || 0
    );
  }, [filteredCategories])();

  const openServices = () => {
    setOpenService(!openService);
  };

  // Service Card Component
  const ServiceCard = useCallback(
    ({
      service,
      categoryName,
    }: { service: IService; categoryName: string }) => {
      return (
        <Card className="overflow-hidden transition-shadow hover:shadow-md">
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 overflow-hidden rounded-md bg-muted">
                    {service.image ? (
                      <img
                        src={service.image || "/placeholder.svg"}
                        alt={service.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-primary/10">
                        <span className="text-lg font-bold text-primary">
                          {service.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium">{service.name}</h3>
                </div>
                {updatingServiceId === service._id ? (
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                ) : (
                  <Switch
                    checked={serviceAvailability[service._id] || false}
                    onCheckedChange={() =>
                      handleToggleAvailability(service, categoryName)
                    }
                    aria-label={`Toggle ${service.name} availability`}
                  />
                )}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between p-3 bg-muted/30">
              <div className="flex items-center">
                {serviceAvailability[service._id] ? (
                  <>
                    <ToggleRight className="h-4 w-4 mr-1.5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      Available
                    </span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-4 w-4 mr-1.5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-500">
                      Unavailable
                    </span>
                  </>
                )}
              </div>
              <Badge
                variant="outline"
                className={`text-xs ${
                  serviceAvailability[service._id]
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-50 text-gray-700 border-gray-200"
                }`}
              >
                {serviceAvailability[service._id] ? (
                  <Check className="w-3 h-3 mr-1" />
                ) : (
                  <X className="w-3 h-3 mr-1" />
                )}
                {serviceAvailability[service._id] ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      );
    },
    [handleToggleAvailability, serviceAvailability, updatingServiceId],
  );

  // Empty State Component
  const EmptyState = () => {
    return (
      <Card className="p-8 mt-4 text-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-4 rounded-full shadow-lg bg-gradient-to-br from-blue-400 to-blue-600">
            <Settings className="w-10 h-10 text-white drop-shadow-md" />
          </div>
          <h3 className="text-lg font-medium">No Services Available</h3>
          <p className="text-sm text-muted-foreground">
            No services have been configured for this hotel yet
          </p>
        </div>
      </Card>
    );
  };

  // No Results Component
  const NoResults = () => {
    return (
      <div className="py-10 text-center">
        <div className="p-4 mx-auto rounded-full bg-muted w-fit">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-medium">
          No services match your search
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Try a different search term
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setSearchQuery("")}
        >
          Clear Search
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manage Services</h2>
        <Badge variant="outline" className="px-3 py-1">
          {totalServices} Services
        </Badge>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
        <Input
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute p-0 transform -translate-y-1/2 right-2 top-1/2 h-7 w-7"
            onClick={() => setSearchQuery("")}
          >
            ×
          </Button>
        )}
      </div>

      {/* Search results count */}
      {searchQuery && (
        <div className="flex items-center">
          <Badge variant="outline" className="px-2 py-1">
            {filteredServicesCount}{" "}
            {filteredServicesCount === 1 ? "service" : "services"} found
          </Badge>
        </div>
      )}

      {categoriesLoading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : filteredCategories && filteredCategories.length > 0 ? (
        <div className="space-y-8">
          {filteredCategories.map((category) => (
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {category.serviceIds.map((service) => (
                    <ServiceCard
                      key={service._id}
                      service={service}
                      categoryName={category.name}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-4 text-center bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    No services in this category
                  </p>
                </Card>
              )}
            </div>
          ))}
          <AdvancedBottomButton
            fixed={true}
            maxWidth="30rem"
            buttons={[
              {
                text: "Add Services",
                onClick: openServices,
                className: "w-full pl-3 rounded-md",
              },
            ]}
          />
        </div>
      ) : searchQuery ? (
        <NoResults />
      ) : (
        <EmptyState />
      )}
      <PopUp
        width="w-[30rem] md:w-[48rem]"
        hide
        height="h-[100dvh] lg:h-[90dvh]"
        show={openService}
        onClose={openServices}
      >
        <Suspense fallback={<LoadingSpinner />}>
          <ServicesForm
            openServices={openServices}
            categories={categoriesData}
          />
        </Suspense>
      </PopUp>
    </div>
  );
};

export default HotelServices;
