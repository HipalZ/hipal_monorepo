import { memo, useState } from "react";
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
import useStaffStore from "@/components/store/hotel/useHotelStaff";

const ThirdStep = () => {
  // Mock state management
  const { selectedServices, toggleService } = useStaffStore((state) => ({
    selectedServices: state.selectedServices,
    toggleService: state.toggleService,
  }));
  const businessId = useBusinessData((s) => s.businessData?._id);
  const { hotelServicesData } = useGetCatServices(businessId as string);

  // Use array for multiple open accordions
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const handleCategoryCheckbox = (
    categoryId: string,
    isChecked: boolean,
    event: React.MouseEvent,
  ) => {
    // Prevent event from bubbling to accordion trigger
    event.stopPropagation();

    const category = hotelServicesData?.find(
      (category) => category._id === categoryId,
    );
    if (category) {
      category.serviceIds.forEach((service) => {
        if (isChecked && !isServiceSelected(service._id)) {
          toggleService(service);
        }
        if (!isChecked && isServiceSelected(service._id)) {
          toggleService(service);
        }
      });
    }
  };

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some((service) => service._id === serviceId);
  };

  const handleAccordionValueChange = (value: string[]) => {
    setOpenCategories(value);
  };

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-xl font-semibold">Assign Services</h2>
      <p className="text-sm text-muted-foreground">
        Select the services this staff member will be responsible for
      </p>

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
                    checked={category.serviceIds.every((service) =>
                      isServiceSelected(service._id),
                    )}
                    onClick={(e) =>
                      handleCategoryCheckbox(
                        category._id,
                        !category.serviceIds.every((service) =>
                          isServiceSelected(service._id),
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
                            onCheckedChange={() => toggleService(service)}
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
        {selectedServices.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground">Selected:</p>
            <ul className="text-xs text-muted-foreground">
              {selectedServices.map((service) => (
                <li key={service._id}>• {service.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(ThirdStep);
