"use client";

import { useState, useCallback, useMemo } from "react";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import CommonBottomButton from "@/components/atoms/bottomButton";
import {
  useHotelRoomData,
  useCreateAlert,
  useGetAllLinkRestautants,
} from "@/components/hooks/useHotelRoom";
import { toast } from "react-toastify";
import LoadingSpinnerCircle from "@/components/atoms/loader";
import type { IService } from "@/components/hooks/useServicesHotel";
import { RestaurantListView } from "./RestaurantListView";
import { MenuView } from "./MenuView";
import { useCartStore } from "@/components/store/useCartStore";
import { useCart } from "@/components/store/useCart";
import { SuccessView } from "./SuccessView";
import type { IMenuLayout } from "@/components/types/businessData";

interface FoodOrderPopupProps {
  show: boolean;
  onClose: () => void;
  businessId: string;
  room: string;
  userId: string;
  services: IService[];
  menuId: IMenuLayout;
}

interface ILinkHotels {
  _id: string;
  name: string;
  customLink: string;
  logo: string;
}

// View types
type ViewType = "restaurants" | "menu";
type OrderStatus = "idle" | "loading" | "success" | "error";

export default function FoodOrderPopup({
  show,
  onClose,
  businessId,
  room,
  userId,
  services,
  menuId,
}: FoodOrderPopupProps) {
  // State
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("idle");
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<ILinkHotels | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>("restaurants");
  const [menuLoading, setMenuLoading] = useState(false);

  // Hooks
  const { gettingRoomLoader, roomPayload } = useHotelRoomData();
  const { creatingAlert, createAlert } = useCreateAlert();
  const { fetchingRestaurants, restaurantData } = useGetAllLinkRestautants(
    businessId,
  ) as {
    fetchingRestaurants: boolean;
    restaurantData: ILinkHotels[];
  };

  const { cart, setCartEmpty } = useCartStore();
  const { setShowCart } = useCart();

  const sanitizedCart = useMemo(() => {
    return cart.map(({ dish, ...item }) => {
      const { recommendationIds, addOnIds, ...sanitizedDish } = dish;
      return { ...item, dish: sanitizedDish };
    });
  }, [cart]);

  // Handle restaurant selection
  const handleSelectRestaurant = useCallback(
    (restaurant: ILinkHotels) => {
      if (selectedRestaurant?._id === restaurant._id) {
        // If already selected, toggle menu view
        setCurrentView((prev) =>
          prev === "restaurants" ? "menu" : "restaurants",
        );
      } else {
        setSelectedRestaurant(restaurant);
        setCurrentView("menu");

        // Simulate menu loading
        setMenuLoading(true);
        setTimeout(() => {
          setMenuLoading(false);
        }, 1000);

        // Here you would call your API to get the restaurant menu
        console.log("Fetching menu for restaurant:", restaurant._id);
      }
    },
    [selectedRestaurant],
  );

  // Handle back to restaurants list
  const handleBackToRestaurants = useCallback(() => {
    setCurrentView("restaurants");
    setCartEmpty();
    setShowCart(false);
  }, [setCartEmpty, setShowCart]);

  // Handle order submission
  const handlePlaceOrder = useCallback(async () => {
    try {
      setOrderStatus("loading");

      // Get room data
      const roomData = await roomPayload({
        businessId,
        roomName: room || "hipalz",
      });

      if (!roomData?.data?._id) {
        throw new Error("Could not find room data");
      }

      await createAlert({
        serviceIds: [services?.[0]?._id],
        businessId,
        userId,
        roomId: roomData.data._id,
        cart: sanitizedCart,
      });

      setOrderStatus("success");
    } catch (error) {
      console.error("Error placing food order:", error);
      setOrderStatus("error");
      toast.error("Failed to place your order. Please try again.");
    }
  }, [
    roomPayload,
    businessId,
    room,
    createAlert,
    userId,
    services,
    sanitizedCart,
  ]);

  // Loading state
  const isLoading =
    fetchingRestaurants ||
    gettingRoomLoader ||
    creatingAlert ||
    orderStatus === "loading";

  // Render content based on current state
  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinnerCircle />;
    }

    if (orderStatus === "success") {
      return <SuccessView restaurant={selectedRestaurant} />;
    }
    const onlyOneRestaurant =
      restaurantData && restaurantData.length === 1 && !selectedRestaurant;

    if (onlyOneRestaurant) {
      const sole = restaurantData[0];
      setSelectedRestaurant(sole);
      setCurrentView("menu");
      setMenuLoading(true);
      setTimeout(() => setMenuLoading(false), 1000);
      return <LoadingSpinnerCircle />;
    }

    if (currentView === "menu" && selectedRestaurant) {
      return (
        <MenuView
          restaurant={selectedRestaurant}
          onBack={handleBackToRestaurants}
          isLoading={menuLoading}
          menuId={menuId}
        />
      );
    }

    return (
      <RestaurantListView
        restaurants={restaurantData}
        selectedRestaurant={selectedRestaurant}
        onSelectRestaurant={handleSelectRestaurant}
        isLoading={fetchingRestaurants}
      />
    );
  };

  return (
    <BottomPopUp hide show={show} onClose={onClose}>
      <section className="relative h-full overflow-auto hide-scrollbar pb-36">
        {renderContent()}
      </section>

      <CommonBottomButton
        fixed={true}
        buttons={[
          {
            text: currentView === "menu" ? "Back" : "Cancel",
            onClick: currentView === "menu" ? handleBackToRestaurants : onClose,
            className: "rounded-md pl-3",
            isBackButton: true,
            disable: isLoading,
          },
          {
            text: orderStatus === "success" ? "Back to room" : "Place Orders",
            onClick: orderStatus === "success" ? onClose : handlePlaceOrder,
            className: "w-full rounded-md",
            disable:
              isLoading ||
              cart?.length === 0 ||
              (!selectedRestaurant && orderStatus !== "success"),
          },
        ]}
      />
    </BottomPopUp>
  );
}
