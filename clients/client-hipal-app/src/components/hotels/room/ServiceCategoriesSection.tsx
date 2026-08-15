"use client";
import { useGetServiceCategories } from "@/components/hooks/useServicesHotel";
import ServiceCategoryCard from "./ServiceCategoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import orderfood from "@/assets/hotel/orderfood.jpeg";
import housekeeping from "@/assets/hotel/housekeeping.jpeg";
import maintainance from "@/assets/hotel/maintainace.jpeg";
import frontoffice from "@/assets/hotel/frontoffice.jpeg";
import type { IMenuLayout } from "@/components/types/businessData";
import { MessageCircle, Phone, Search } from "lucide-react";
import { useLogin } from "@/components/store/useLogin";
import SearchModal from "./SearchModal";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import HotelAlarmReminder from "./HotelAlarmReminder";
import { useHotelBusinessData } from "@/components/store/useHotelBusinessData";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useHotelTemp } from "@/components/store/useHotelTemp";

interface ServiceCategoriesSectionProps {
  businessId: string;
  menuId: IMenuLayout;
  room?: string;
  contactPhone?: string;
}

export default function ServiceCategoriesSection({
  businessId,
  menuId,
  room,
  contactPhone,
}: ServiceCategoriesSectionProps) {
  const { categoriesLoading, categoriesData } =
    useGetServiceCategories(businessId);
  const userDetails = useLogin((s) => s.userDetails);
  const hotelData = useHotelBusinessData((s) => s.hotelData);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const suppressSearchAutoOpenRef = useRef(false);
  const setIsOpenChat = useHotelTemp((s) => s.setIsOpenChat);
  const phone =
    contactPhone || hotelData?.phone || hotelData?.phoneNumber || "";

  // Memoize static configuration objects to prevent unnecessary re-renders
  const config = useMemo(
    () => ({
      categoryImages: {
        FOOD: orderfood,
        HOUSE_KEEPING: housekeeping,
        FRONT_OFFICE: frontoffice,
        OTHERS: maintainance,
      },
      categoryDescriptions: {
        FOOD: "Order Delicious Food",
        FRONT_OFFICE: "24*7 Support",
        HOUSE_KEEPING: "cleaning services",
        OTHERS: "Repairs & fixes",
      },
      nameMap: {
        FOOD: "ORDER_FOOD",
        MAINTENANCE: "MAINTAINANCE",
      } as Record<string, string>,
      primaryKeys: [
        "ORDER_FOOD",
        "HOUSE_KEEPING",
        "MAINTAINANCE",
        "FRONT_OFFICE",
      ],
    }),
    []
  );

  // Stable callbacks for UI actions
  const handleOpenSearch = useCallback(() => {
    suppressSearchAutoOpenRef.current = false;
    const params = new URLSearchParams(searchParams.toString());
    params.set("supportSearch", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setShowSearchModal(true);
  }, [pathname, router, searchParams]);

  const handleCloseSearch = useCallback(() => {
    suppressSearchAutoOpenRef.current = true;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("supportSearch");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setShowSearchModal(false);
  }, [pathname, router, searchParams]);

  const handleCall = useCallback(() => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  }, [phone]);

  const handleOpenChat = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("chat", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setIsOpenChat(true);
  }, [pathname, router, searchParams, setIsOpenChat]);

  useEffect(() => {
    const shouldOpenSearch = searchParams.get("supportSearch") === "1";
    if (!shouldOpenSearch) {
      suppressSearchAutoOpenRef.current = false;
    }
    if (shouldOpenSearch && suppressSearchAutoOpenRef.current) return;
    setShowSearchModal(shouldOpenSearch);
  }, [searchParams]);

  // Quick Actions is a system category rendered separately as quick-action
  // tiles - it must not appear as a regular browsing category.
  const browsableCategories = useMemo(
    () =>
      (categoriesData || []).filter((cat) => cat.systemKey !== "QUICK_ACTIONS"),
    [categoriesData]
  );

  // Memoize the data transformation and filtering
  const { primary, others } = useMemo(() => {
    if (!browsableCategories.length) return { primary: [], others: [] };

    const transformed = browsableCategories.map((cat) => ({
      ...cat,
      name: config.nameMap[cat.name] || cat.name,
    }));

    return {
      primary: transformed.filter((cat) =>
        config.primaryKeys.includes(cat.name)
      ),
      others: transformed.filter(
        (cat) => !config.primaryKeys.includes(cat.name)
      ),
    };
  }, [browsableCategories, config]);

  const hasCategories = Boolean(browsableCategories.length);
  const displayRoom = room && room !== "hipalz";

  return (
    <div className="relative plus-jakarta-font">
      <div className="mb-5 space-y-3 px-1 pt-1">
        <section className="min-w-0">
          <h1 className="truncate text-[1.18rem] font-bold leading-tight tracking-normal text-[#211915]">
            Hello {userDetails?.name ? userDetails.name.split(" ")[0] : "Guest"}
          </h1>
          <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[0.74rem] leading-none tracking-normal text-[#8A756B]">
            {displayRoom && (
              <>
                <span className="font-semibold text-[#3B302B]">
                  Room {room}
                </span>
                <span className="h-1 w-1 rounded-full bg-[#D4C3B8]" />
              </>
            )}
            <span className="font-medium">Guest support</span>
          </div>
        </section>

        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={handleCall}
            disabled={!phone}
            aria-label="Call hotel"
            className="inline-flex h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl border border-[#E5DAD2] bg-white text-[#3B302B] shadow-[0_6px_16px_rgba(72,49,37,0.06)] transition-all duration-200 active:scale-[0.98] disabled:opacity-45"
          >
            <Phone className="h-4 w-4" strokeWidth={2.2} />
            <span className="text-[0.64rem] font-semibold leading-none tracking-normal">
              Call
            </span>
          </button>
          <HotelAlarmReminder
            businessId={businessId}
            room={room}
            triggerLabel="Wake-up"
            triggerClassName="h-12 w-full flex-col gap-1 rounded-2xl border border-[#7B2C4C] bg-[#7B2C4C] px-1 text-[0.64rem] font-semibold text-white shadow-[0_8px_18px_rgba(123,44,76,0.18)] hover:scale-100 hover:bg-[#7B2C4C] active:scale-[0.98] focus-visible:ring-[#B24A74]/20 [&>svg]:h-4 [&>svg]:w-4 [&>span]:leading-none [&>span]:tracking-normal"
          />

          <button
            type="button"
            onClick={handleOpenSearch}
            className="inline-flex h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl border border-[#E5DAD2] bg-white text-[#3B302B] shadow-[0_6px_16px_rgba(72,49,37,0.06)] transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B24A74]/20"
          >
            <Search className="h-4 w-4" strokeWidth={2.2} />
            <span className="text-[0.64rem] font-semibold leading-none tracking-normal">
              Search
            </span>
          </button>
          <button
            type="button"
            onClick={handleOpenChat}
            aria-label="Open service chat"
            className="inline-flex h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl border border-[#E5DAD2] bg-white text-[#3B302B] shadow-[0_6px_16px_rgba(72,49,37,0.06)] transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B24A74]/20"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={2.2} />
            <span className="text-[0.64rem] font-semibold leading-none tracking-normal">
              Chat
            </span>
          </button>
        </div>
      </div>

      {categoriesLoading ? (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Our Services</h2>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="w-full h-[160px] rounded-xl" />
            ))}
          </div>
        </section>
      ) : hasCategories ? (
        <section className="flex justify-center">
          <div className="grid grid-cols-2 gap-2 md:gap-4 lg:gap-4 mt-2 w-full">
            {primary.map((category) => (
              <div key={category._id} className="w-full aspect-square">
                <ServiceCategoryCard
                  category={{
                    ...category,
                    image:
                      config.categoryImages[
                        category.name as keyof typeof config.categoryImages
                      ] || orderfood,
                    description:
                      config.categoryDescriptions[
                        category.name as keyof typeof config.categoryDescriptions
                      ] || "",
                  }}
                  businessId={businessId}
                  menuId={menuId}
                  room={room}
                />
              </div>
            ))}

            {others.length > 0 && (
              <div key="others" className="w-full aspect-square">
                <ServiceCategoryCard
                  category={{
                    _id: "others",
                    name: "MAINTAINANCE",
                    serviceIds: others.flatMap((c) => c.serviceIds),
                    image: maintainance,
                    description: config.categoryDescriptions.OTHERS,
                  }}
                  businessId={businessId}
                  room={room}
                />
              </div>
            )}
          </div>
        </section>
      ) : null}

      <SearchModal
        show={showSearchModal}
        onClose={handleCloseSearch}
        businessId={businessId}
        categories={browsableCategories}
      />
    </div>
  );
}
