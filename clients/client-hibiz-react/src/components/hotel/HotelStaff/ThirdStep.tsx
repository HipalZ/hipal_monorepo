import type { IService } from '@/components/store/hotel/useHotelStaff';
import useStaffStore, { useStaffDataStore } from '@/components/store/hotel/useHotelStaff';
import useBusinessData from '@/components/store/useBusinessData';
import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { findBusinessRole } from '@/components/utils/helper';
import { useGetLinkedRestaurantForHotel } from '@/hooks/hotel/useLinkRestaurantHook';
import { useGetCatServices } from '@/hooks/useHotelStaff';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import type { MouseEvent } from 'react';
import { memo, useEffect, useMemo, useState } from 'react';

const formatName = (name: string) =>
  name
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const SERVICE_GROUPS = [
  {
    key: 'food',
    title: 'Food',
    keywords: ['food', 'restaurant', 'dining', 'kitchen', 'meal', 'order'],
  },
  {
    key: 'housekeeping',
    title: 'Housekeeping',
    keywords: ['housekeeping', 'house keeping', 'clean', 'laundry', 'towel', 'linen', 'soap', 'comb', 'water', 'bath'],
  },
  {
    key: 'frontoffice',
    title: 'Front Office',
    keywords: ['front office', 'frontoffice', 'reception', 'checkout', 'check out', 'wake', 'alarm', 'call', 'support'],
  },
  {
    key: 'maintenance',
    title: 'Maintenance',
    keywords: ['maintenance', 'maintainance', 'repair', 'electric', 'plumb', 'ac', 'air condition', 'light', 'fix'],
  },
] as const;

const normalizeSearchName = (value?: string) => (value || '').replace(/[_-]/g, ' ').toLowerCase();

const getServiceGroupKey = (categoryName: string, serviceName: string) => {
  const searchName = normalizeSearchName(`${categoryName} ${serviceName}`);
  return SERVICE_GROUPS.find((group) => group.keywords.some((keyword) => searchName.includes(keyword)))?.key ?? 'housekeeping';
};

const EMPTY_SERVICE_IDS: string[] = [];

interface LinkedRestaurant {
  _id: string;
  name: string;
  logoUrl?: string;
  customLink?: string;
}

const areServiceIdListsEqual = (left: string[], right: string[]) => {
  if (left.length !== right.length) return false;
  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return sortedLeft.every((id, index) => id === sortedRight[index]);
};

const ThirdStep = () => {
  const selectedServices = useStaffStore((state) => state.selectedServices);
  const selectedRestaurants = useStaffStore((state) => state.selectedRestaurants);
  const toggleService = useStaffStore((state) => state.toggleService);
  const toggleRestaurant = useStaffStore((state) => state.toggleRestaurant);
  const setSelectedServices = useStaffStore((state) => state.setSelectedServices);
  const setSelectedRestaurants = useStaffStore((state) => state.setSelectedRestaurants);
  const editStaffId = useStaffStore((s) => s.editStaffId);
  const staffData = useStaffDataStore((s) => s.staffData);
  const businessId = useBusinessData((s) => s.outletInfo?.businessId || s.businessData?._id);
  const { hotelServicesData = [] } = useGetCatServices(businessId as string);
  const { restaurantData: linkedRestaurantData = [] } = useGetLinkedRestaurantForHotel(businessId as string);
  const linkedRestaurants = linkedRestaurantData as LinkedRestaurant[];

  const allServices = useMemo(() => {
    const uniqueServices = new Map<string, IService>();
    hotelServicesData.forEach((category) => {
      (category.serviceIds ?? []).forEach((service) => {
        if (service) uniqueServices.set(service._id, service as IService);
      });
    });
    return Array.from(uniqueServices.values());
  }, [hotelServicesData]);

  const groupedServices = useMemo(() => {
    const groups = SERVICE_GROUPS.map((group) => ({
      ...group,
      servicesById: new Map<string, IService>(),
    }));

    hotelServicesData.forEach((category) => {
      const categoryName = `${category.name || ''} ${(category as { systemKey?: string }).systemKey || ''}`;
      (category.serviceIds ?? []).forEach((service) => {
        if (!service) return;
        const groupKey = getServiceGroupKey(categoryName, service.name);
        const group = groups.find((item) => item.key === groupKey) ?? groups[1];
        group.servicesById.set(service._id, service as IService);
      });
    });

    return groups.map((group) => ({
      key: group.key,
      title: group.title,
      services: Array.from(group.servicesById.values()).sort((left, right) => left.name.localeCompare(right.name)),
    }));
  }, [hotelServicesData]);

  const selectedStaff = useMemo(() => staffData?.find((staff) => staff._id === editStaffId), [editStaffId, staffData]);
  const selectedServiceIds = useMemo(
    () => findBusinessRole(selectedStaff?.customRole, businessId)?.serviceIds || EMPTY_SERVICE_IDS,
    [businessId, selectedStaff?.customRole],
  );
  const selectedRestaurantIds = useMemo(
    () => findBusinessRole(selectedStaff?.customRole, businessId)?.restaurantIds || EMPTY_SERVICE_IDS,
    [businessId, selectedStaff?.customRole],
  );

  useEffect(() => {
    const initialSelectedServices = allServices.filter((service) => selectedServiceIds.includes(service._id));
    const currentSelectedServiceIds = useStaffStore.getState().selectedServices.map((service) => service._id);
    if (
      areServiceIdListsEqual(
        currentSelectedServiceIds,
        initialSelectedServices.map((service) => service._id),
      )
    ) {
      return;
    }
    setSelectedServices(initialSelectedServices);
  }, [allServices, selectedServiceIds, setSelectedServices]);

  useEffect(() => {
    const currentRestaurantIds = useStaffStore.getState().selectedRestaurants;
    if (areServiceIdListsEqual(currentRestaurantIds, selectedRestaurantIds)) return;
    setSelectedRestaurants(selectedRestaurantIds);
  }, [selectedRestaurantIds, setSelectedRestaurants]);

  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const isServiceSelected = (serviceId: string) => selectedServices.some((service) => service._id === serviceId);

  const areAllServicesSelected = useMemo(() => {
    const totalCount = allServices.length + linkedRestaurants.length;
    const allHotelServicesSelected = allServices.every((service) => isServiceSelected(service._id));
    const allRestaurantsSelected = linkedRestaurants.every((restaurant) => selectedRestaurants.includes(restaurant._id));
    return totalCount > 0 && allHotelServicesSelected && allRestaurantsSelected;
  }, [allServices, linkedRestaurants, selectedRestaurants, selectedServices]);

  const isIndeterminate = useMemo(() => {
    const totalCount = allServices.length + linkedRestaurants.length;
    const selectedCount = allServices.filter((service) => isServiceSelected(service._id)).length + selectedRestaurants.length;
    return selectedCount > 0 && selectedCount < totalCount;
  }, [allServices, linkedRestaurants.length, selectedRestaurants.length, selectedServices]);

  const handleSelectAll = (isChecked: boolean) => {
    allServices.forEach((service) => {
      const isSelected = isServiceSelected(service._id);
      if (isChecked && !isSelected) toggleService(service);
      if (!isChecked && isSelected) toggleService(service);
    });
    if (isChecked) {
      setSelectedRestaurants(linkedRestaurants.map((restaurant) => restaurant._id));
    } else {
      setSelectedRestaurants([]);
    }
  };

  const handleGroupCheckbox = (groupKey: string, isChecked: boolean, event: MouseEvent) => {
    event.stopPropagation();
    if (groupKey === 'food') {
      setSelectedRestaurants(isChecked ? linkedRestaurants.map((restaurant) => restaurant._id) : []);
      return;
    }

    const group = groupedServices.find((item) => item.key === groupKey);
    if (!group) return;

    group.services.forEach((service) => {
      const isSelected = isServiceSelected(service._id);
      if (isChecked && !isSelected) toggleService(service);
      if (!isChecked && isSelected) toggleService(service);
    });
  };

  const getGroupState = (group: (typeof groupedServices)[number]) => {
    if (group.key === 'food') {
      const total = linkedRestaurants.length;
      const selected = linkedRestaurants.filter((restaurant) => selectedRestaurants.includes(restaurant._id)).length;
      if (selected === 0) return 'none';
      if (selected === total) return 'all';
      return 'partial';
    }

    const total = group.services.length;
    const selected = group.services.filter((service) => isServiceSelected(service._id)).length;
    if (selected === 0) return 'none';
    if (selected === total) return 'all';
    return 'partial';
  };

  return (
    <div className="flex flex-col gap-4 p-1">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Assign Services</h2>
        <p className="text-muted-foreground mt-0.5 text-sm">Select the services this staff member will be responsible for</p>
      </div>

      <div className="bg-muted/40 flex items-center justify-between rounded-xl border px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Checkbox
            id="select-all"
            checked={areAllServicesSelected}
            data-state={areAllServicesSelected ? 'checked' : isIndeterminate ? 'indeterminate' : 'unchecked'}
            onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
          />
          <Label htmlFor="select-all" className="cursor-pointer select-none text-sm font-medium">
            Select All Services
          </Label>
        </div>

        <Badge
          variant={selectedServices.length > 0 ? 'default' : 'secondary'}
          className="rounded-full px-2.5 py-0.5 text-xs tabular-nums transition-all"
        >
          {selectedServices.length + selectedRestaurants.length} / {allServices.length + linkedRestaurants.length}
        </Badge>
      </div>

      <div className="space-y-2">
        <Accordion type="multiple" value={openCategories} onValueChange={setOpenCategories} className="space-y-2">
          {groupedServices.map((group) => {
            const state = getGroupState(group);
            const isFoodGroup = group.key === 'food';
            const groupTotal = isFoodGroup ? linkedRestaurants.length : group.services.length;
            const selectedCount = isFoodGroup
              ? linkedRestaurants.filter((restaurant) => selectedRestaurants.includes(restaurant._id)).length
              : group.services.filter((service) => isServiceSelected(service._id)).length;

            return (
              <AccordionItem
                key={group.key}
                value={group.key}
                className="overflow-hidden rounded-xl border shadow-sm transition-shadow data-[state=open]:shadow-md"
              >
                <AccordionPrimitive.Header className="hover:bg-muted/30 flex items-center gap-3 px-4 py-3 transition-colors">
                  <Checkbox
                    id={`cat-${group.key}`}
                    checked={state === 'all'}
                    data-state={state === 'all' ? 'checked' : state === 'partial' ? 'indeterminate' : 'unchecked'}
                    onClick={(event) => handleGroupCheckbox(group.key, state !== 'all', event)}
                    className="shrink-0"
                    disabled={groupTotal === 0}
                  />

                  <AccordionPrimitive.Trigger className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 [&[data-state=open]>svg]:rotate-180">
                    <span className="flex-1 truncate text-left text-sm font-semibold">{group.title}</span>

                    <Badge
                      variant={state === 'none' ? 'secondary' : state === 'all' ? 'default' : 'secondary'}
                      className="shrink-0 rounded-full px-2 py-0 text-[11px]"
                    >
                      {selectedCount}/{groupTotal}
                    </Badge>

                    <ChevronDown className="text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200" />
                  </AccordionPrimitive.Trigger>
                </AccordionPrimitive.Header>

                <AccordionContent className="px-4 pb-3 pt-0">
                  <div className="grid grid-cols-1 gap-1.5 pt-2">
                    {isFoodGroup && linkedRestaurants.length === 0 && (
                      <p className="text-muted-foreground px-3 py-2 text-sm">No linked restaurants yet.</p>
                    )}
                    {isFoodGroup &&
                      linkedRestaurants.map((restaurant) => {
                        const active = selectedRestaurants.includes(restaurant._id);
                        return (
                          <label
                            key={restaurant._id}
                            htmlFor={`restaurant-${restaurant._id}`}
                            className={`flex cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                              active ? 'bg-primary/8 border-primary/25 text-primary border' : 'hover:bg-muted/50 border border-transparent'
                            }`}
                          >
                            <Checkbox
                              id={`restaurant-${restaurant._id}`}
                              checked={active}
                              onCheckedChange={() => toggleRestaurant(restaurant._id)}
                              className="shrink-0"
                            />
                            <span className="text-sm font-medium leading-none">{restaurant.name}</span>
                          </label>
                        );
                      })}
                    {!isFoodGroup && group.services.length === 0 && (
                      <p className="text-muted-foreground px-3 py-2 text-sm">No services in this group yet.</p>
                    )}
                    {!isFoodGroup &&
                      group.services.map((service) => {
                        const active = isServiceSelected(service._id);
                        return (
                          <label
                            key={service._id}
                            htmlFor={`svc-${service._id}`}
                            className={`flex cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                              active ? 'bg-primary/8 border-primary/25 text-primary border' : 'hover:bg-muted/50 border border-transparent'
                            }`}
                          >
                            <Checkbox
                              id={`svc-${service._id}`}
                              checked={active}
                              onCheckedChange={() => toggleService(service)}
                              className="shrink-0"
                            />
                            <span className="text-sm font-medium leading-none">{formatName(service.name)}</span>
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
