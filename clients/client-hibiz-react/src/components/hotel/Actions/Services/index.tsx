"use client";

import { lazy, useState, useCallback, useEffect, Suspense } from "react";
import {
  Check,
  X,
  ToggleLeft,
  ToggleRight,
  Settings,
  Loader2,
  Search,
  Edit3,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import BirthdayImageUploader from "@/components/templates/events/birthdayImage";

const ServicesForm = lazy(() => import("./HotelServices"));

interface EditServiceData {
  _id: string;
  name: string;
  availability: boolean;
  image?: string;
  categoryName: string;
}

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

  const [editingService, setEditingService] = useState<EditServiceData | null>(
    null,
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (categoriesData) {
      const availabilityMap: Record<string, boolean> = {};

      for (const category of categoriesData) {
        for (const service of category.serviceIds) {
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

        // await refetchCategories();

        toast.success(
          `${service.name} is now ${
            newAvailability ? "available" : "unavailable"
          }`,
        );
      } catch (error) {
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
      serviceAvailability,
    ],
  );

  const handleServiceClick = useCallback(
    (service: IService, categoryName: string) => {
      setEditingService({
        _id: service._id,
        name: service.name,
        availability: serviceAvailability[service._id] || false,
        image: service.image,
        categoryName,
      });
      setNewImageUrl(null);
      setShowEditModal(true);
    },
    [serviceAvailability],
  );

  const handleImageUploadSuccess = useCallback(
    (url: string) => {
      if (editingService?.image === url) {
        toast.error("This image is already uploaded");
        return;
      }

      setNewImageUrl(url);
      toast.success("Image uploaded successfully");
    },
    [editingService?.image],
  );

  const handleSaveService = useCallback(async () => {
    if (!editingService || !businessId) return;

    try {
      setUploadingImage(true);

      const imageUrl = newImageUrl || editingService.image;

      await updateService({
        name: editingService.name,
        businessId: businessId,
        availability: editingService.availability,
        serviceId: editingService._id,
        image: imageUrl,
      });

      setServiceAvailability((prev) => ({
        ...prev,
        [editingService._id]: editingService.availability,
      }));

      // await refetchCategories();

      toast.success("Service updated successfully");
      setShowEditModal(false);
      setEditingService(null);
      setNewImageUrl(null);
    } catch (error) {
      console.error("Error updating service:", error);
      toast.error("Failed to update service");
    } finally {
      setUploadingImage(false);
    }
  }, [
    editingService,
    businessId,
    newImageUrl,
    updateService,
  ]);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditingService(null);
    setNewImageUrl(null);
  }, []);

  const filteredCategories = useCallback(() => {
    if (!categoriesData || !searchQuery.trim()) return categoriesData;

    return categoriesData
      .map((category) => {
        const filteredServices = category.serviceIds.filter((service) =>
          service.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );

        return {
          ...category,
          serviceIds: filteredServices,
        };
      })
      .filter((category) => category.serviceIds.length > 0);
  }, [categoriesData, searchQuery])();

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

  const ServiceCard = useCallback(
    ({
      service,
      categoryName,
    }: { service: IService; categoryName: string }) => {
      return (
        <Card className="overflow-hidden transition-shadow hover:shadow-md">
          <CardContent className="p-0">
            <div
              className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => handleServiceClick(service, categoryName)}
            >
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
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Click to edit
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-muted-foreground" />
                  {updatingServiceId === service._id ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  ) : (
                    <Switch
                      checked={serviceAvailability[service._id] || false}
                      onCheckedChange={(e) => {
                        e.stopPropagation();
                        handleToggleAvailability(service);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Toggle ${service.name} availability`}
                    />
                  )}
                </div>
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
    [
      handleToggleAvailability,
      serviceAvailability,
      updatingServiceId,
      handleServiceClick,
    ],
  );

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
          className="mt-4 bg-transparent"
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
        width="w-[30rem] md:w-[40rem]"
        height="h-auto"
        show={showEditModal}
        onClose={handleCloseEditModal}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Edit Service</h3>
            <Button variant="ghost" size="sm" onClick={handleCloseEditModal}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {editingService && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/30">
                <h4 className="font-medium">{editingService.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Category: {editingService.categoryName}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Availability</Label>
                  <p className="text-xs text-muted-foreground">
                    Toggle service availability for customers
                  </p>
                </div>
                <Switch
                  checked={editingService.availability}
                  onCheckedChange={(checked) =>
                    setEditingService((prev) =>
                      prev ? { ...prev, availability: checked } : null,
                    )
                  }
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Service Image</Label>

                <BirthdayImageUploader
                  image={newImageUrl || editingService.image || ""}
                  onUploadSuccess={handleImageUploadSuccess}
                />

                <p className="text-xs text-muted-foreground">
                  Upload a new image or keep the existing one. Images are
                  automatically uploaded to cloud storage.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleCloseEditModal}>
                  Cancel
                </Button>
                <Button onClick={handleSaveService} disabled={uploadingImage}>
                  {uploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopUp>

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
