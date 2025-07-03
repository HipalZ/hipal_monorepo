"use client";

import { useGetServiceCategories } from "@/components/hooks/useServicesHotel";
import ServiceCategoryCard from "./ServiceCategoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { IMenuLayout } from "@/components/types/businessData";

interface ServiceCategoriesSectionProps {
  businessId: string;
  menuId:IMenuLayout
}

export default function ServiceCategoriesSection({
  businessId,
  menuId,
}: ServiceCategoriesSectionProps) {
  const { categoriesLoading, categoriesData } =
    useGetServiceCategories(businessId);

  if (categoriesLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Our Services</h2>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="w-full h-[160px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!categoriesData || categoriesData.length === 0) {
    return null;
  }
console.log('ServiceCategoryse',menuId)
  return (
    <div className="relative space-y-4">
      <div className="absolute -right-8 w-[calc(100%-10rem)] h-[2px] bg-black top-5" />
      <h2 className="text-3xl poppins-regular  text-h-primary">Our Services</h2>
      <div className="grid grid-cols-2 gap-4">
        {categoriesData.map((category, index) => (
          <div key={category._id} className={index === 2 ? "col-span-2" : ""}>
            <ServiceCategoryCard category={category} businessId={businessId} menuId={menuId}/>
          </div>
        ))}
      </div>
    </div>
  );
}
