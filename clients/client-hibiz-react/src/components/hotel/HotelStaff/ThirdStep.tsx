import { memo, useEffect, useMemo, useState } from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import {
  Accordion,
  AccordionItem,
  AccordionContent,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { useGetCatServices } from "@/hooks/useHotelStaff";
import useBusinessData from "@/components/store/useBusinessData";
import useStaffStore, {
  useStaffDataStore,
} from "@/components/store/hotel/useHotelStaff";
import type { IService } from "@/components/store/hotel/useHotelStaff";

/** Format raw service/category names like HOUSE_KEEPING → House Keeping */
const formatName = (name: string) =>
  name
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

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

  const selectedStaff = staffData?.find((staff) => staff._id === editStaffId);
  const selectedServiceIds = selectedStaff?.customRole?.[0]?.serviceIds || [];

  useEffect(() => {
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

  const isIndeterminate = useMemo(() => {
    const count = allServices.filter(
      (s) => s && isServiceSelected(s._id),
    ).length;
    return count > 0 && count < allServices.length;
  }, [allServices, selectedServices]);

  const handleSelectAll = (isChecked: boolean) => {
    allServices.forEach((service) => {
      const isSelected = isServiceSelected(service._id);
      if (isChecked && !isSelected) toggleService(service as IService);
      if (!isChecked && isSelected) toggleService(service as IService);
    });
  };

  const handleCategoryCheckbox = (
    categoryId: string,
    isChecked: boolean,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    const category = hotelServicesData?.find((c) => c._id === categoryId);
    if (category) {
      category.serviceIds.forEach((service) => {
        const isSelected = isServiceSelected(service._id);
        if (isChecked && !isSelected) toggleService(service as IService);
        if (!isChecked && isSelected) toggleService(service as IService);
      });
    }
  };

  const getCategoryState = (
    category: NonNullable<typeof hotelServicesData>[number],
  ) => {
    const total = category.serviceIds?.length ?? 0;
    const selected = (category.serviceIds ?? []).filter((s) =>
      isServiceSelected(s._id),
    ).length;
    if (selected === 0) return "none";
    if (selected === total) return "all";
    return "partial";
  };

  return (
    <div className="flex flex-col gap-4 p-1">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Assign Services
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Select the services this staff member will be responsible for
        </p>
      </div>

      {/* Select All row + counter badge */}
      <div className="flex items-center justify-between rounded-xl border bg-muted/40 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Checkbox
            id="select-all"
            checked={areAllServicesSelected}
            data-state={
              areAllServicesSelected
                ? "checked"
                : isIndeterminate
                  ? "indeterminate"
                  : "unchecked"
            }
            onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
          />
          <Label
            htmlFor="select-all"
            className="text-sm font-medium cursor-pointer select-none"
          >
            Select All Services
          </Label>
        </div>

        <Badge
          variant={selectedServices.length > 0 ? "default" : "secondary"}
          className="rounded-full tabular-nums text-xs px-2.5 py-0.5 transition-all"
        >
          {selectedServices.length} / {allServices.length}
        </Badge>
      </div>

      {/* Category Accordion */}
      <div className="space-y-2">
        <Accordion
          type="multiple"
          value={openCategories}
          onValueChange={setOpenCategories}
          className="space-y-2"
        >
          {hotelServicesData?.map((category) => {
            const state = getCategoryState(category);
            const selectedCount = (category.serviceIds ?? []).filter((s) =>
              isServiceSelected(s._id),
            ).length;

            return (
              <AccordionItem
                key={category._id}
                value={category._id}
                className="border rounded-xl overflow-hidden shadow-sm data-[state=open]:shadow-md transition-shadow"
              >
                {/*
                  Use AccordionPrimitive.Header directly so the Checkbox is a
                  sibling of the trigger button — NOT nested inside it.
                  Nesting a <button> (Checkbox) inside a <button> (AccordionTrigger)
                  is invalid HTML and causes the checkbox to visually drop/shift.
                */}
                <AccordionPrimitive.Header className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                  {/* Checkbox — sibling of trigger, not inside it */}
                  <Checkbox
                    id={`cat-${category._id}`}
                    checked={state === "all"}
                    data-state={
                      state === "all"
                        ? "checked"
                        : state === "partial"
                          ? "indeterminate"
                          : "unchecked"
                    }
                    onClick={(e) =>
                      handleCategoryCheckbox(category._id, state !== "all", e)
                    }
                    className="shrink-0"
                  />

                  {/* Trigger — name + badge + chevron only, no interactive children */}
                  <AccordionPrimitive.Trigger className="flex flex-1 items-center gap-2 min-w-0 cursor-pointer [&[data-state=open]>svg]:rotate-180">
                    <span className="text-sm font-semibold truncate flex-1 text-left">
                      {formatName(category.name)}
                    </span>

                    {state !== "none" && (
                      <Badge
                        variant={state === "all" ? "default" : "secondary"}
                        className="text-[11px] px-2 py-0 rounded-full shrink-0"
                      >
                        {selectedCount}/{category.serviceIds?.length ?? 0}
                      </Badge>
                    )}

                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground" />
                  </AccordionPrimitive.Trigger>
                </AccordionPrimitive.Header>

                <AccordionContent className="px-4 pb-3 pt-0">
                  <div className="grid grid-cols-1 gap-1.5 pt-2">
                    {category.serviceIds.map((service) => {
                      const active = isServiceSelected(service._id);
                      return (
                        <label
                          key={service._id}
                          htmlFor={`svc-${service._id}`}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-all select-none ${
                            active
                              ? "bg-primary/8 border border-primary/25 text-primary"
                              : "border border-transparent hover:bg-muted/50"
                          }`}
                        >
                          <Checkbox
                            id={`svc-${service._id}`}
                            checked={active}
                            onCheckedChange={() =>
                              toggleService(service as IService)
                            }
                            className="shrink-0"
                          />
                          <span className="text-sm font-medium leading-none">
                            {formatName(service.name)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
};

export default memo(ThirdStep);
