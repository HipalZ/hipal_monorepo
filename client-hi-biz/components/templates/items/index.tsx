import React, { useEffect, useState } from "react";
import Header from "@/components/molecules/header";
import { BsChevronLeft } from "react-icons/bs";
import Hi from "@/assets/svg/hi.svg";
import SubheaderButtonList from "@/components/atom/subHeaderBtn";
import {
  MdOutlineCategory,
  MdOutlineQuickreply,
  MdSpaceDashboard,
} from "react-icons/md";
import { IoFastFoodOutline } from "react-icons/io5";
import { BiDish } from "react-icons/bi";
import { useSelectedButtonStore } from "@/components/store/useSelectBtn";
import { useRouter } from "next/router";
import axios from "@/axios";
import type { Dish, IAddOn, ICategory } from "@/components/types/businessData";
import CategoriesContent from "@/components/organisms/items/categories";
import DishContent from "@/components/organisms/items/dish";
import AddOns from "@/components/organisms/items/addons";
import SearchPanel from "@/components/atom/searchPanel";
import { useSearch } from "@/components/store/useSearch";
import { HiSearch } from "react-icons/hi";
import useItemStore from "@/components/store/useItemStore";
import DashboardContent from "@/components/organisms/items/dashboard";
import QuickMenuContent from "@/components/molecules/quickMenu";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/components/errorComponent";
import LoadingSpinner from "@/components/atom/loadingSpinner";

const buttons = [
  {
    text: "Dashboard",
    Icon: MdSpaceDashboard,
  },
  {
    text: "Dish",
    Icon: BiDish,
  },
  {
    text: "Categories",
    Icon: MdOutlineCategory,
  },
  {
    text: "Add Ons",
    Icon: IoFastFoodOutline,
  },
  {
    text: "Quick Menu",
    Icon: MdOutlineQuickreply,
  },
];

export interface IItems {
  categories: ICategory[];
  addOns: IAddOn[];
  dishes: Dish[];
}

const Items = () => {
  const router = useRouter();
  const { setSelectedIcon } = useSelectedIcon();
  const { businessId } = router.query as { businessId: string };
  const selectedButton = useSelectedButtonStore((s) => s.selectedButton);
  const setSelectedButton = useSelectedButtonStore((s) => s.setSelectedButton);
  const searchText = useSearch((s) => s.searchText);
  const setSearchText = useSearch((s) => s.setSearchText);
  const { data, setData } = useItemStore();
  const [state, setState] = useState({
    showSearchBox: false,
  });
  useEffect(() => {
    setSearchText("");
  }, []);
  const closeSearchBox = () => {
    setState({ ...state, showSearchBox: false });
  };

  const openSearchBox = () => {
    setState({ ...state, showSearchBox: !state.showSearchBox });
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `/v1/categories?businessId=${businessId}&queryCategories=true`
      );
      setData((prevData) => ({ ...prevData, categories: response.data }));
      return response.data;
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchAddOns = async () => {
    try {
      const response = await axios.get(
        `/v1/dishes/:id/getExtra?businessId=${businessId}&queryExtra=true`
      );
      setData((prevData) => ({ ...prevData, addOns: response.data }));
      return response.data;
    } catch (err) {
      console.error("Error fetching add-ons:", err);
    }
  };

  const fetchAllDishes = async () => {
    try {
      const response = await axios.get(
        `/v1/dishes?businessId=${businessId}&queryDish=true`
      );
      setData((prevData) => ({ ...prevData, dishes: response.data }));
      return response.data;
    } catch (err) {
      console.error("Error fetching dishes:", err);
    }
  };

  useEffect(() => {
    if (router.query.tab === "home") {
      setSelectedButton("Dashboard");
    } else {
      let key = router.query.tab?.toString() || "Dashboard";
      setSelectedButton(key);
    }
  }, [router.query.tab]);

  const {
    isLoading: isCatLoading,
    error: categoryError,
    data: catData,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["category", businessId],
    queryFn: fetchCategories,
    enabled:
      !!businessId &&
      (selectedButton === "Dashboard" || selectedButton === "Categories"),
  });

  const {
    isLoading: isDishPending,
    error: dishError,
    data: dishData,
    refetch: refetchDishes,
  } = useQuery({
    queryKey: ["dishes", businessId],
    queryFn: fetchAllDishes,
    enabled:
      !!businessId &&
      (selectedButton === "Dashboard" || selectedButton === "Dish"),
  });

  const {
    isLoading: isAddOnPending,
    error: addOnError,
    data: addOnData,
    refetch: refetchAddons,
  } = useQuery({
    queryKey: ["addOns", businessId],
    queryFn: fetchAddOns,
    enabled:
      !!businessId &&
      (selectedButton === "Dashboard" || selectedButton === "Add Ons"),
  });

  const isLoading = isCatLoading || isDishPending || isAddOnPending;

  if (dishError) return <ErrorComponent refetch={refetchDishes} />;
  if (categoryError) return <ErrorComponent refetch={refetchCategories} />;
  if (addOnError) return <ErrorComponent refetch={refetchAddons} />;

  return (
    <div>
      <div className="bg-[#f5f5f5] sticky z-20 top-0">
        <Header
          title="Items"
          onBack={() => setSelectedIcon("")}
          leftIcon={<BsChevronLeft />}
          centerImage={Hi}
          rightImage={Hi}
          isIconBusinessShow={false}
        />
        <SubheaderButtonList buttons={buttons} />
        <div className="flex justify-between items-center mt-2 pl-6 pb-2 border-b border-[#cacaca]">
          <div className="text-xl"> {selectedButton}</div>
          {selectedButton !== "Dashboard" && <div className="mr-4" onClick={openSearchBox}>
            {!state.showSearchBox  ? (
              <HiSearch className="w-4 h-4 mx-2 my-auto text-sm" />
            ) : (
              <SearchPanel closeSearchBox={closeSearchBox} />
            )}
          </div>}
        </div>
      </div>
      {selectedButton === "Dashboard" && <DashboardContent data={data} />}
      {selectedButton === "Dish" && (
        <DishContent dishes={data?.dishes || []} searchText={searchText} />
      )}
      {selectedButton === "Categories" && (
        <CategoriesContent
          hide={false}
          categories={data?.categories || []}
          searchText={searchText}
        />
      )}
      {selectedButton === "Add Ons" && (
        <AddOns addOns={data?.addOns || []} searchText={searchText || ""} />
      )}
      {selectedButton === "Quick Menu" && (
        <QuickMenuContent searchText={searchText} />
      )}
      {isLoading && <LoadingSpinner />}
    </div>
  );
};

export default Items;
