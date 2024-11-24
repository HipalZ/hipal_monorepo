import MemoizedHeader from "@/components/molecules/header";
import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import Hi from "@/assets/svg/hi.svg";
import { cn } from "@hi/common";
import UniversalNav from "@/components/templates/menu/sideNavbaar/universelSidenav";
import Items from "@/components/templates/analytics/items";
import UserUnique from "@/components/templates/analytics/user";

const navItems = [{ text: "Item" }, { text: "User" }];

const ItemAnalytics = () => {
  const [selectedTab, setSelectedTab] = useState<"item" | "user">("item");

  const changeLayout = (text: string) => {
    setSelectedTab(text.toLowerCase() as "item" | "user");
  };

  return (
    <main>
      <div className="sticky top-0 z-50 w-full">
        <article className="linear_gradient_background">
          <MemoizedHeader
            title="Item Analytics"
            leftIcon={<FaArrowLeft />}
            rightImage={Hi}
          />
        </article>

        <nav className="absolute w-full px-4 space-x-4 text-sm mobile-only">
          {navItems.map((item) => (
            <button
              className={cn(
                "pb-3 pt-4 bg-white ",
                selectedTab?.toLowerCase() === item.text.toLowerCase()
                  ? "border-b-2 border-[#8162e6] transition-all text-[#8162e6] font-semibold text-lg"
                  : "",
              )}
              key={item.text}
              type="button"
              onClick={() => changeLayout(item.text)}
            >
              {item.text}
            </button>
          ))}
        </nav>
      </div>
      <UniversalNav
        items={navItems}
        selectedNavItem={selectedTab}
        changeNav={changeLayout}
      />
      {selectedTab === "item" && <Items />}
      {selectedTab === "user" && <UserUnique />}
    </main>
  );
};

export default ItemAnalytics;
