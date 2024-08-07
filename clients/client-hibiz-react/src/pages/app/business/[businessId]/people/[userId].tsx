import MemoizedHeader from "@/components/molecules/header";
import { memo } from "react";
import Hi from "@/assets/svg/hi.svg";
import { FaArrowLeft } from "react-icons/fa";
import { cn } from "@/components/utils/helper";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import RecentBills from "@/components/templates/people/recentBills";
import TagsAndNotes from "@/components/templates/people/tagsAndNotes";
import PopUp from "@/components/atom/popUp";
import RecentBillsPopup from "@/components/templates/people/recentBillsPopup";
import TagPopup from "@/components/templates/people/tagPopup";
import {
  useLoyaltyData,
  userCoinzDetails,
  useUserDashboard,
} from "@/hooks/useHipeople";
import { useParams } from "react-router-dom";
import PredefinedContacts from "@/components/templates/people/predefinedContacts";
import PredefinedAnalytics from "@/components/templates/people/predefinedAnalytics";
import SidebarUser from "@/components/templates/menu/sideNavbaar/userSideNavBar";
import MemoizedDateRangePicker from "@/components/molecules/dateRangePicker";
import Pagination from "@/components/atom/pagination";
import CoinzUsage from "@/components/templates/people/coinzUsage";
import AddTagz from "@/components/templates/people/addTagz";
import AddNotes from "@/components/templates/people/addNotes";
import RemoveTag from "@/components/templates/people/removeTag";

const MemoUserId = () => {
  const {
    selectedNavItem,
    setSelectedNavItem,
    openBillPopup,
    setOpenBillPopup,
    openTagPopup,
    setOpenTagPopup,
    userDashboardDetails,
    openAddTagz,
    setOpenAddTagz,
    openAddNotes,
    setOpenAddNotes,
    openDeletePopup,
    setOpenDeletePopup,
  } = useHiPeopleStore((s) => ({
    selectedNavItem: s.selectedNavItem,
    setSelectedNavItem: s.setSelectedNavItem,
    openBillPopup: s.openBillPopup,
    setOpenBillPopup: s.setOpenBillPopup,
    openTagPopup: s.openTagPopup,
    setOpenTagPopup: s.setOpenTagPopup,
    userDashboardDetails: s.userDashboardDetails,
    openAddTagz: s.openAddTagz,
    setOpenAddTagz: s.setOpenAddTagz,
    openAddNotes: s.openAddNotes,
    setOpenAddNotes: s.setOpenAddNotes,
    openDeletePopup: s.openDeletePopup,
    setOpenDeletePopup: s.setOpenDeletePopup,
  }));

  const sidebarItems = [
    {
      icon: Hi,
      text: "Recent Bills",
      onClick: () => setSelectedNavItem("RECENT BILLS"),
    },
    {
      icon: Hi,
      text: "Tags & Notes",
      onClick: () => setSelectedNavItem("TAGS & NOTES"),
    },
    {
      icon: Hi,
      text: "Coinz usage",
      onClick: () => setSelectedNavItem("COINZ USAGE"),
    },
  ];

  const params = useParams<{ userId: string }>();
  const { isLoading } = useUserDashboard(params?.userId as string);

  const handleCloseTagz = () => {
    setOpenAddTagz(false);
  };

  const handleCloseNotes = () => {
    setOpenAddNotes(false);
  };

  const handleCloseDelete = () => {
    setOpenDeletePopup(false);
  };

  useLoyaltyData();
  userCoinzDetails();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen">
      <header>
        <MemoizedHeader
          leftIcon={<FaArrowLeft />}
          rightImage={Hi}
          isIconBusinessShow={false}
        />
        <article
          style={{
            background:
              "linear-gradient(313.39deg, #4E62FF 32.64%, #B494FF 103.13%)",
          }}
          className="h-[7rem] relative rounded-xl mx-6"
        >
          <article className="h-[5rem] w-[5rem] rounded-full absolute -translate-x-1/2 -top-8 left-1/2 bg-gray-200 flex items-center justify-center">
            <h1 className="text-3xl capitalize">
              {userDashboardDetails?.name?.charAt(0)}
            </h1>
          </article>
          <center className="pt-16 text-2xl text-white">
            {userDashboardDetails?.name}
          </center>
        </article>
        <PredefinedContacts />
      </header>
      <PredefinedAnalytics />
      <nav className="sticky top-0 z-50 flex justify-between w-full px-4 space-x-4 text-sm bg-white mobile-only">
        {sidebarItems.map((item) => (
          <button
            className={cn(
              "pb-3 pt-4 bg-white ",
              selectedNavItem?.toLowerCase() === item.text.toLowerCase()
                ? "border-b-2 border-[#15BBB3] transition-all text-[#15BBB3]"
                : "",
            )}
            key={item.text}
            type="button"
            onClick={item.onClick}
          >
            {item.text}
          </button>
        ))}
      </nav>
      <SidebarUser items={sidebarItems} />
      {selectedNavItem !== "TAGS & NOTES" ? <MemoizedDateRangePicker /> : null}
      <br />
      {selectedNavItem === "RECENT BILLS" ? <RecentBills /> : null}
      {selectedNavItem === "TAGS & NOTES" ? <TagsAndNotes /> : null}
      {selectedNavItem === "RECENT BILLS" && (
        <PopUp show={openBillPopup} onClose={() => setOpenBillPopup(false)}>
          <RecentBillsPopup />
        </PopUp>
      )}
      {selectedNavItem === "COINZ USAGE" ? <CoinzUsage /> : null}
      {selectedNavItem === "TAGS & NOTES" && (
        <PopUp show={openTagPopup} onClose={() => setOpenTagPopup(false)}>
          <TagPopup />
        </PopUp>
      )}
      {openAddTagz && (
        <PopUp show={openAddTagz} onClose={handleCloseTagz}>
          <AddTagz />
        </PopUp>
      )}
      {openAddNotes && (
        <PopUp show={openAddNotes} onClose={handleCloseNotes}>
          <AddNotes />
        </PopUp>
      )}
      {openDeletePopup && (
        <PopUp show={openDeletePopup} onClose={handleCloseDelete}>
          <RemoveTag />
        </PopUp>
      )}
      {selectedNavItem !== "TAGS & NOTES" ? <Pagination /> : null}
    </main>
  );
};

const UserId = memo(MemoUserId);
export default UserId;
