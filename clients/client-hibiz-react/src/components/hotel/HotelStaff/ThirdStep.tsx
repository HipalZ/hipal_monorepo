import { memo, useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useGetCatServices } from "@/hooks/useHotelStaff";
import useBusinessData from "@/components/store/useBusinessData";
import useStaffStore, {
  useStaffDataStore,
} from "@/components/store/hotel/useHotelStaff";

const ThirdStep = () => {
  const selectedServices = useStaffStore((state) => state.selectedServices);
  const toggleService = useStaffStore((state) => state.toggleService);
  const setSelectedServices = useStaffStore(
    (state) => state.setSelectedServices,
  );
  const editStaffId = useStaffStore((s) => s.editStaffId);
  const staffData = useStaffDataStore((s) => s.staffData);
  const businessId = useBusinessData((s) => s.businessData?._id);
  const { hotelServicesData } = useGetCatServices(businessId as string);

  const allServices = useMemo(
    () => hotelServicesData?.flatMap((category) => category.serviceIds) || [],
    [hotelServicesData],
  );
  const selectedStaff = staffData?.find((staff) => staff._id === editStaffId); // Example staff _id
  const selectedServiceIds = selectedStaff?.customRole?.[0]?.serviceIds || [];
  useEffect(() => {
    // Update the selected services based on selected staff's serviceIds
    const initialSelectedServices = allServices.filter((service) =>
      selectedServiceIds.includes(service._id),
    );
    setSelectedServices(initialSelectedServices);
  }, [hotelServicesData, staffData]);

  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const isServiceSelected = (serviceId: string) =>
    selectedServices.some((service) => service._id === serviceId);

  const areAllServicesSelected = useMemo(() => {
    return (
      allServices.length > 0 &&
      allServices.every((service) => isServiceSelected(service._id))
    );
  }, [allServices, selectedServices]);

  const handleSelectAll = (isChecked: boolean) => {
    allServices.forEach((service) => {
      const isSelected = isServiceSelected(service._id);
      if (isChecked && !isSelected) toggleService(service);
      if (!isChecked && isSelected) toggleService(service);
    });
  };

  const handleCategoryCheckbox = (
    categoryId: string,
    isChecked: boolean,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();

    const category = hotelServicesData?.find(
      (category) => category._id === categoryId,
    );
    if (category) {
      category.serviceIds.forEach((service) => {
        const isSelected = isServiceSelected(service._id);
        if (isChecked && !isSelected) toggleService(service);
        if (!isChecked && isSelected) toggleService(service);
      });
    }
  };

  const handleAccordionValueChange = (value: string[]) =>
    setOpenCategories(value);

  const handleServiceToggle = (service: any) => {
    toggleService(service);
  };

  return (
    <div className="p-3">
      <h2 className="text-xl font-semibold">Assign Services</h2>
      <p className="text-sm text-muted-foreground">
        Select the services this staff member will be responsible for
      </p>

      {/* Select All */}
      <div className="flex items-center space-x-2 my-2">
        <Checkbox
          id="select-all"
          checked={areAllServicesSelected}
          onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
        />
        <Label
          htmlFor="select-all"
          className={`font-semibold cursor-pointer ${
            areAllServicesSelected ? "text-primary" : ""
          }`}
        >
          Select All Services
        </Label>
      </div>
      <hr />
      <div className="space-y-3 max-h-[60dvh] overflow-y-auto pr-2">
        <Accordion
          type="multiple"
          value={openCategories}
          onValueChange={handleAccordionValueChange}
        >
          {hotelServicesData?.map((category) => (
            <AccordionItem key={category._id} value={category._id}>
              <AccordionTrigger className="cursor-pointer flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category._id}`}
                    checked={category.serviceIds.every((s) =>
                      isServiceSelected(s._id),
                    )}
                    onClick={(e) =>
                      handleCategoryCheckbox(
                        category._id,
                        !category.serviceIds.every((s) =>
                          isServiceSelected(s._id),
                        ),
                        e,
                      )
                    }
                  />
                  <Label
                    htmlFor={`category-${category._id}`}
                    className="cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {category.name}
                  </Label>
                </div>
              </AccordionTrigger>

              <AccordionContent>
                <div className="space-y-2">
                  {category.serviceIds.map((service) => (
                    <Card
                      key={service._id}
                      className={`border ${
                        isServiceSelected(service._id) ? "border-primary" : ""
                      }`}
                    >
                      <CardContent className="flex items-center justify-between p-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={service._id}
                            checked={isServiceSelected(service._id)}
                            onCheckedChange={() => handleServiceToggle(service)}
                          />
                          <Label
                            htmlFor={service._id}
                            className="cursor-pointer"
                          >
                            {service.name}
                          </Label>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="pt-2">
        <p className="text-sm font-medium">
          Selected services: {selectedServices.length}
        </p>
      </div>
    </div>
  );
};

export default memo(ThirdStep);
