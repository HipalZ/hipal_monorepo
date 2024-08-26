import MemoizedHeader from "@/components/molecules/header";
import { FaArrowLeft } from "react-icons/fa";
import Hi from "@/assets/svg/hi.svg";
import { cn } from "@hi/common";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import SidebarPeople from "@/components/templates/menu/sideNavbaar/peopleSideNavBar";
import Summary from "@/components/templates/people/summary";
import Client from "@/components/templates/people/client";
import Tagz from "@/components/templates/people/tagz";
import TargetGroups from "@/components/templates/people/targetGropus";
import { useNavigate, useParams } from "react-router-dom";

const HiPeople = () => {
  const { selectedPage, setSelectedPage } = useHiPeopleStore();
  const navigate = useNavigate();
  const { businessId } = useParams<{ businessId: string }>();
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
    {
      icon: Hi,
      text: "Tagz",
      onClick: () => setSelectedPage("TAGZ"),
    },
    { icon: Hi, text: "Actions", onClick: () => setSelectedPage("ACTIONS") },
  ];

  const handleBack = () => {
    navigate(`/app/business/${businessId}`);
  };

  return (
    <main>
      <div className="sticky top-0 z-50 w-full">
        <article className="linear_gradient_background">
          <MemoizedHeader
            title="Hi PplZ"
            leftIcon={<FaArrowLeft />}
            rightImage={Hi}
            isIconBusinessShow={false}
            onBack={handleBack}
          />
        </article>
        <section className="absolute w-full px-4 space-x-4 overflow-x-auto text-sm shadow-lg whitespace-nowrap mobile-only">
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
      <SidebarPeople items={sidebarItems} />
      <br />
      <br />
      {selectedPage === "SUMMARY" && <Summary />}
      {selectedPage === "CLIENTS" && <Client />}
      {selectedPage === "TAGZ" && <Tagz />}
      {selectedPage === "TARGET GROUPS" && <TargetGroups />}
    </main>
  );
};

export default HiPeople;
