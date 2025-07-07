import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import LoadingSpinner from "@/components/atom/loadingSpinner";
import {
  ChefHat,
  Users,
  Utensils,
  Info,
  Edit3,
  X,
  Search,
  ArrowUpDown,
} from "lucide-react";
import PopUp from "@/components/atom/popUp";
import { useGetIndividualKitchen } from "@/hooks/useKItchenHook.ts";
import { useDishes } from "@/hooks/useDish.ts";
import { useDishesStore } from "@/components/store/useDishesStore.ts";
import { useCallback, useMemo, useState } from "react";
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton.tsx";
import { useGetAllStaff } from "@/hooks/useStaff.ts";
import { useParams } from "react-router-dom";

interface KitchenDetailsModalProps {
  kitchenId: string;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export default function KitchenDetailsModal({
  kitchenId,
  isOpen,
  onClose,
  onEdit,
}: KitchenDetailsModalProps) {
  const { gettingKitchenData: kitchen, LoadingKitchen } =
    useGetIndividualKitchen(kitchenId);
  const { isLoading } = useDishes();
  const { dishes } = useDishesStore();
  const businessId = useParams<{ businessId: string }>().businessId;
  const { rawStaffDetails, isLoadingStaff } = useGetAllStaff(businessId);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const getAllDishesMemoized = useMemo(() => {
    return dishes.map((dish) => ({
      ...dish,
      dishTypes: dish.dishTypes?.map((dishType) => dishType.name) || [],
    }));
  }, [dishes]);

  // Filter dishes that are linked to this kitchen
  const kitchenDishes = useMemo(() => {
    if (!kitchen?.dishIds || !getAllDishesMemoized) return [];

    return getAllDishesMemoized.filter((dish) =>
      kitchen.dishIds.includes(dish._id),
    );
  }, [kitchen?.dishIds, getAllDishesMemoized]);

  const filteredAndSortedDishes = useMemo(() => {
    let filtered = kitchenDishes;

    if (searchTerm) {
      filtered = filtered.filter(
        (dish) =>
          dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dish.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    filtered.sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [kitchenDishes, searchTerm, sortOrder]);

  const renderStaffList = useCallback(
    (staffIds: string[]) => {
      const staffNames = staffIds
        .map((staffId) => rawStaffDetails?.find((s) => s._id === staffId)?.name)
        .filter(Boolean);

      return staffNames;
    },
    [rawStaffDetails],
  );

  const handleSortToggle = useCallback(() => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  }, [sortOrder, setSortOrder]);

  return (
    <PopUp
      hide
      height="h-[100dvh] xl:h-[80dvh]"
      onClose={onClose}
      show={isOpen}
      rightTopBack
    >
      <Card className="w-full mx-auto border-none shadow-none">
        <CardHeader className="pt-6 px-6">
          <div className="flex items-center gap-3 mb-2">
            <ChefHat className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl font-bold text-gray-800">
              {LoadingKitchen
                ? "Loading Kitchen..."
                : kitchen?.name || "Kitchen Details"}
            </CardTitle>
          </div>
          {kitchen && (
            <CardDescription className="text-gray-600">
              {kitchen.description || "No description provided."}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="px-6 py-4">
          {LoadingKitchen && (
            <div className="py-10">
              <LoadingSpinner />
            </div>
          )}

          {!LoadingKitchen && !kitchen && (
            <div className="py-10 text-center">
              <Info className="mx-auto h-12 w-12 text-red-500 mb-3" />
              <p className="text-lg text-gray-700">
                Could not load kitchen details.
              </p>
            </div>
          )}

          {!LoadingKitchen && kitchen && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Kitchen Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                    Staff Assigned
                    {kitchen.staffIds && kitchen.staffIds.length > 0 ? (
                      <span className="ml-2 text-sm text-gray-500">
                        ({kitchen.staffIds.length} staff member
                        {kitchen.staffIds.length > 1 ? "s" : ""})
                      </span>
                    ) : (
                      <span className="text-gray-500 italic ml-2">
                        No staff assigned.
                      </span>
                    )}
                  </h4>
                  <div className="text-gray-700 grid grid-cols-2 gap-4">
                    {renderStaffList(kitchen.staffIds).map((staffName) => (
                      <div
                        key={staffName}
                        className="font-semibold flex items-center"
                      >
                        <Users className="mr-2 h-5 w-5 text-primary" />
                        {staffName},
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                    Dishes Linked
                  </h4>
                  <div className="flex items-center text-gray-700">
                    <Utensils className="mr-2 h-5 w-5 text-green-500" />
                    {kitchen.dishIds && kitchen.dishIds.length > 0 ? (
                      <span className="font-semibold">
                        {kitchen.dishIds.length} dish(es)
                      </span>
                    ) : (
                      <span className="text-gray-500 italic">
                        No dishes linked.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Dishes Section */}
              {kitchenDishes.length > 0 && (
                <div className="space-y-4 pb-[7rem]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Kitchen Dishes
                    </h3>
                    <span className="text-sm text-gray-500">
                      {filteredAndSortedDishes.length} of {kitchenDishes.length}{" "}
                      dishes
                    </span>
                  </div>

                  {/* Search and Filter Controls */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search dishes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSortToggle}
                      className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                      title={`Sort ${
                        sortOrder === "asc" ? "Descending" : "Ascending"
                      }`}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                      <span className="text-sm">
                        {sortOrder === "asc" ? "A-Z" : "Z-A"}
                      </span>
                    </button>
                  </div>

                  {/* Dishes List */}
                  <div className="max-h-96 hide-scrollbar overflow-y-auto gap-4  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ">
                    {filteredAndSortedDishes.length > 0 ? (
                      filteredAndSortedDishes.map((dish) => (
                        <div
                          key={dish._id}
                          className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className=" text-primary font-semibold">
                                {dish.name}
                              </h4>
                            </div>
                            {dish.description && (
                              <p className="text-sm text-gray-600 mb-1 line-clamp-2 w-[96%]">
                                {dish.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ₹{dish.price}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Utensils className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-gray-500">
                          {searchTerm !== "all"
                            ? "No dishes match your search criteria."
                            : "No dishes found in this kitchen."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <AdvancedBottomButton
          fixed={true}
          maxWidth="30rem"
          buttons={[
            {
              text: "Close",
              icon: <X className="mr-2 h-4 w-4" />,
              onClick: onClose,
            },
            {
              text: "Edit Kitchen",
              icon: <Edit3 className="mr-2 h-4 w-4" />,
              onClick: onEdit,
            },
          ]}
        />
      </Card>
    </PopUp>
  );
}
