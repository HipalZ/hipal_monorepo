import MemoizedHeader from "@/components/molecules/header";
import { FaArrowLeft } from "react-icons/fa";
import Hi from "@/assets/svg/hi.svg";
import { cn } from "@hi/common";
import Sidebar from "@/components/templates/menu/sideNavbaar";
import useHiPeopleStore from "@/components/store/useHipeopleStore";

const HiPeople = () => {
  const { selectedPage, setSelectedPage } = useHiPeopleStore();

  const sidebarItems = [
    { icon: Hi, text: "Summary", onClick: () => setSelectedPage("SUMMARY") },
    {
      icon: Hi,
      text: "Clients",
      onClick: () => setSelectedPage("CLIENTS"),
    },
    {
      icon: Hi,
      text: "Target Groups",
      onClick: () => setSelectedPage("TARGET GROUPS"),
    },
    { icon: Hi, text: "Actions", onClick: () => setSelectedPage("ACTIONS") },
  ];
  return (
    <main>
      <div className="sticky top-0 z-50 w-full">
        <article className="linear_gradient_background">
          <MemoizedHeader
            title="Hi PplZ"
            leftIcon={<FaArrowLeft />}
            centerImage={Hi}
            rightImage={Hi}
            isIconBusinessShow={false}
          />
        </article>
        <section className="absolute w-full px-4 space-x-4 text-sm mobile-only">
          {sidebarItems.map((item) => (
            <button
              className={cn(
                "pb-3 pt-4",
                selectedPage.toLowerCase() === item.text.toLowerCase()
                  ? "border-b-2 border-black transition-all"
                  : "",
              )}
              key={item.text}
              type="button"
              onClick={item.onClick}
            >
              {item.text}
            </button>
          ))}
        </section>
      </div>
      <Sidebar items={sidebarItems} />
    </main>
  );
};

export default HiPeople;
