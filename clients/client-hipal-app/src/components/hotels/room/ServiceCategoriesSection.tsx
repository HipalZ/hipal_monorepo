"use client";
import { useGetServiceCategories } from "@/components/hooks/useServicesHotel";
import ServiceCategoryCard from "./ServiceCategoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import bell from "@/assets/hotel/bell.png";
import foodDome from "@/assets/hotel/food dome.png";
import housekeeping from "@/assets/hotel/housekeeping.png";
import maintainance from "@/assets/hotel/maintainance.png";
import frontoffice from "@/assets/hotel/frontoffice.png";
import type { IMenuLayout } from "@/components/types/businessData";
interface ServiceCategoriesSectionProps {
  businessId: string;
  menuId: IMenuLayout;
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

  const categoryImages = {
    FOOD: foodDome,
    HOUSE_KEEPING: housekeeping,
    FRONT_OFFICE: frontoffice,
    OTHERS: maintainance,
  };

  const categoryDescriptions = {
    FOOD: "Order Delicious Food",
    FRONT_OFFICE: "24*7 Support",
    HOUSE_KEEPING: "cleaning services",
    OTHERS: "Repairs & fixes",
  };

  const primaryCategories = [
    "FOOD",
    "HOUSE_KEEPING",
    "MAINTAINANCE",
    "FRONT_OFFICE",
  ];

  // Separate the categories
  const primary = categoriesData.filter((cat) =>
    primaryCategories.includes(cat.name),
  );
  const others = categoriesData.filter(
    (cat) => !primaryCategories.includes(cat.name),
  );

  return (
    <div className="relative space-y-3">
      <div className="flex items-center justify-center">
        {/* Left ornament */}
        <svg
          width="32"
          height="10"
          viewBox="0 0 32 10"
          fill="none"
          className="mr-3"
        >
          <path
            d="M0 5h18M22 5h10M18 5a2 2 0 1 1 4 0 2 2 0 0 1-4 0z"
            stroke="#bbb"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
        <span className="poppins-regular text-gray-400 text-[0.9rem]">
          Guest Support
        </span>
        {/* Right ornament */}
        <svg
          width="32"
          height="10"
          viewBox="0 0 32 10"
          fill="none"
          className="ml-3"
        >
          <path
            d="M0 5h10M14 5h18M10 5a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"
            stroke="#bbb"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <section className="flex justify-center">
        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:gap-9 mt-2">
          {primary.map((category) => (
            <div key={category._id} className="min-w-[10rem] h-[10rem]">
              <ServiceCategoryCard
                category={{
                  ...category,
                  image:
                    categoryImages[
                      category.name as keyof typeof categoryImages
                    ] || bell,
                  description:
                    categoryDescriptions[
                      category.name as keyof typeof categoryDescriptions
                    ] || "",
                }}
                businessId={businessId}
                menuId={menuId}
              />
            </div>
          ))}

          {others.length > 0 && (
            <div key="others" className="min-w-[10rem] h-[10rem]">
              <ServiceCategoryCard
                category={{
                  _id: "others",
                  name: "MAINTAINANCE",
                  serviceIds: others.flatMap((c) => c.serviceIds),
                  image: maintainance,
                  description: categoryDescriptions.OTHERS,
                }}
                businessId={businessId}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
