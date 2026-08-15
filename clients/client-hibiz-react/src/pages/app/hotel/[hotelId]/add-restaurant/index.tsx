import { useCallback, useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { Search, Link, ExternalLink } from "lucide-react";
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import PopUp from "@/components/atom/popUp";
import MemoizedHeader from "@/components/molecules/header";
import useBusinessData from "@/components/store/useBusinessData";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useGetAllRestaurantsForHotel,
  useGetLinkedRestaurantForHotel,
  useLinkRestaurantToHotel,
} from "@/hooks/hotel/useLinkRestaurantHook";

interface IRestaurant {
  _id: string;
  name: string;
  logo?: string;
  logoUrl?: string;
  customLink?: string;
}

const AddRestaurant = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);
  const { restaurantData: linkedRestaurants, retaurantLoader: linkedLoader } =
    useGetLinkedRestaurantForHotel(businessId as string);
  const { restaurantData: allRestaurants, retaurantLoader: allLoader } =
    useGetAllRestaurantsForHotel();
  const { linkRestaurant, linkingRestaurantLoader, isLinkedSuccessfully } =
    useLinkRestaurantToHotel();

  const [openLinkModal, setOpenLinkModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const linkedRestaurantList = (linkedRestaurants ?? []) as IRestaurant[];
  const allRestaurantList = (allRestaurants ?? []) as IRestaurant[];

  // Initialize selected restaurants with already linked ones
  useEffect(() => {
    setSelectedRestaurants(
      ((linkedRestaurants ?? []) as IRestaurant[]).map((r) => r._id),
    );
  }, [linkedRestaurants]);

  // Close modal on successful linking
  useEffect(() => {
    if (isLinkedSuccessfully) {
      setOpenLinkModal(false);
    }
  }, [isLinkedSuccessfully]);

  const openLinkModalFunc = useCallback(() => {
    setOpenLinkModal(true);
  }, []);

  const closeLinkModalFunc = useCallback(() => {
    setOpenLinkModal(false);
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const toggleRestaurantSelection = useCallback((id: string) => {
    setSelectedRestaurants((prev) => {
      if (prev.includes(id)) {
        return prev.filter((r) => r !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!businessId) return;

    await linkRestaurant({
      businessId: businessId,
      restaurantIds: selectedRestaurants,
    });
  }, [businessId, linkRestaurant, selectedRestaurants]);

  // Filter restaurants based on search query
  const filteredRestaurants = allRestaurantList.filter((restaurant) =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <main className="pb-20">
      <header className="linear_gradient_background">
        <MemoizedHeader title="Link Restaurant" leftIcon={<FaArrowLeft />} />
      </header>

      <div className="px-4 py-6 mx-auto ">
        <h2 className="mb-6 text-2xl font-bold">Linked Restaurants</h2>

        {linkedLoader ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : linkedRestaurantList.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {linkedRestaurantList.map((restaurant) => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      {openLinkModal && (
        <PopUp
          hide
          width="flex w-[calc(100vw-2rem)] max-w-[69rem] flex-col overflow-hidden p-0"
          height="h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] lg:h-[46rem] lg:max-h-[calc(100dvh-3rem)]"
          show={openLinkModal}
          onClose={closeLinkModalFunc}
        >
          <div className="flex min-h-0 flex-1 flex-col bg-white">
            <div className="shrink-0 px-5 pb-4 pt-5 sm:px-6">
              <div className="flex items-start justify-between gap-4 pr-8">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                    Link Restaurants
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Choose the restaurants connected to this hotel.
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="mt-0.5 shrink-0 rounded-full border-slate-200 px-3 py-1 text-slate-700"
                >
                  {selectedRestaurants.length} selected
                </Badge>
              </div>
            </div>

            <div className="relative mx-5 mb-4 shrink-0 sm:mx-6">
              <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
              <Input
                placeholder="Search restaurants..."
                value={searchQuery}
                onChange={handleSearch}
                className="h-10 rounded-xl border-slate-200 bg-white pl-10 shadow-sm shadow-slate-100/80"
              />
            </div>

            {allLoader ? (
              <div className="flex min-h-0 flex-1 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="mx-5 min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-2xl border border-slate-100 bg-slate-50/70 p-3 [scrollbar-gutter:stable] sm:mx-6">
                {filteredRestaurants && filteredRestaurants.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredRestaurants.map((restaurant) => {
                      const isSelected = selectedRestaurants.includes(
                        restaurant._id,
                      );
                      const logo = restaurant.logoUrl || restaurant.logo;

                      return (
                        <div
                          key={restaurant._id}
                          className={`flex min-h-[4.75rem] cursor-pointer items-center justify-between gap-3 rounded-xl border bg-white p-3 transition-all duration-200 ${
                            isSelected
                              ? "border-emerald-700 shadow-sm ring-1 ring-emerald-700/10"
                              : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                          }`}
                          onClick={() =>
                            toggleRestaurantSelection(restaurant._id)
                          }
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                              {logo ? (
                                <img
                                  src={logo}
                                  alt={restaurant.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-emerald-950/5">
                                  <span className="text-base font-semibold text-emerald-950">
                                    {restaurant.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-semibold text-slate-950">
                                {restaurant.name}
                              </h3>
                              {restaurant.customLink && (
                                <div className="mt-1 flex min-w-0 items-center text-xs text-slate-500">
                                  <ExternalLink className="mr-1 h-3 w-3 shrink-0" />
                                  <span className="truncate">
                                    {restaurant.customLink}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Checkbox
                            checked={isSelected}
                            className="pointer-events-none shrink-0"
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex h-full min-h-[14rem] items-center justify-center text-center">
                    <p className="text-muted-foreground">
                      No restaurants found
                    </p>
                  </div>
                )}
              </div>
            )}

            <footer className="shrink-0 border-t border-slate-100 bg-white/95 px-5 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] sm:px-6">
              <div className="mx-auto flex max-w-[30rem] gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-12 shrink-0 rounded-xl border-slate-200 p-0 text-slate-950 hover:bg-slate-50"
                  onClick={closeLinkModalFunc}
                >
                  <FaArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  className="h-12 flex-1 rounded-xl bg-black text-sm font-semibold text-white hover:bg-slate-900"
                  onClick={handleSave}
                  disabled={linkingRestaurantLoader}
                >
                  {linkingRestaurantLoader ? "Saving..." : "Save"}
                </Button>
              </div>
            </footer>
          </div>
        </PopUp>
      )}

      <AdvancedBottomButton
        fixed={true}
        maxWidth="30rem"
        buttons={[
          {
            text: "Link Restaurant",
            onClick: openLinkModalFunc,
            className: "w-full rounded-md",
            icon: <Link className="w-4 h-4 mr-2" />,
          },
        ]}
      />
    </main>
  );
};

// Restaurant Card Component
const RestaurantCard = ({ restaurant }: { restaurant: IRestaurant }) => {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex items-center p-4">
          <div className="flex-shrink-0 w-16 h-16 mr-4 overflow-hidden rounded-md bg-muted">
            {restaurant.logoUrl || restaurant.logo ? (
              <img
                src={restaurant.logoUrl || restaurant.logo}
                alt={restaurant.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-primary/10">
                <span className="text-2xl font-bold text-primary">
                  {restaurant.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate">
              {restaurant.name}
            </h3>
            {restaurant?.customLink && (
              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                <ExternalLink className="flex-shrink-0 w-4 h-4 mr-1" />
                <span className="truncate">{restaurant.customLink}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Empty State Component
const EmptyState = () => {
  return (
    <Card className="p-8 mt-4 text-center">
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="p-4 rounded-full shadow-lg bg-gradient-to-br from-amber-400 to-amber-600">
          <Link className="w-10 h-10 text-white drop-shadow-md" />
        </div>
        <h3 className="text-lg font-medium">No Restaurants Linked</h3>
        <p className="text-sm text-muted-foreground">
          Link restaurants to your hotel to provide dining options for your
          guests
        </p>
      </div>
    </Card>
  );
};

export default AddRestaurant;
