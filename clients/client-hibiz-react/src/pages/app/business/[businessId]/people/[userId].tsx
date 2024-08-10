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
import Pagination from "@/components/atom/pagination";
import CoinzUsage from "@/components/templates/people/coinzUsage";
import AddTagz from "@/components/templates/people/addTagz";
import AddNotes from "@/components/templates/people/addNotes";
import RemoveTag from "@/components/templates/people/removeTag";
import DateRangePicker from "@/components/templates/people/dateRangePicker";
import { SlCalender } from "react-icons/sl";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { format } from "date-fns";
import EditNotes from "@/components/templates/people/editNotes";

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
    openDatePickerModal,
    setOpenDatePickerModal,
    isLoading,
    dateRange,
    openEditNotes,
    setOpenEditNotes,
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
    openDatePickerModal: s.openDatePickerModal,
    setOpenDatePickerModal: s.setOpenDatePickerModal,
    isLoading: s.isLoading,
    dateRange: s.dateRange,
    openEditNotes: s.openEditNotes,
    setOpenEditNotes: s.setOpenEditNotes,
  }));
  const [from, to] = dateRange;

  const formattedFrom = from
    ? format(from, "dd MMM yyyy")
    : "Select Start Date";
  const formattedTo = to ? format(to, "dd MMM yyyy") : "Select End Date";

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
  const { isLoading: isLoadings } = useUserDashboard(params?.userId as string);

  const handleCloseTagz = () => {
    setOpenAddTagz(false);
  };

  const handleCloseNotes = () => {
    setOpenAddNotes(false);
  };

  const handleCloseDelete = () => {
    setOpenDeletePopup(false);
  };

  const handleCloseEditNotes = () => {
    setOpenEditNotes(false);
  };

  useLoyaltyData();
  userCoinzDetails();

  if (isLoadings) {
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
      {openDatePickerModal ? (
        <PopUp
          show={openDatePickerModal}
          onClose={() => setOpenDatePickerModal(!openDatePickerModal)}
          hide
        >
          <section className="h-[30rem]">
            <DateRangePicker />
          </section>
        </PopUp>
      ) : null}
      {selectedNavItem !== "TAGS & NOTES" ? (
        <center>
          <button
            onClick={() => setOpenDatePickerModal(true)}
            type="button"
            className="px-4 gap-2 py-2 flex justify-center items-center bg-[#5197F8] rounded-full text-white mt-4"
          >
            <SlCalender /> Choose Date
          </button>
          <h3 className="text-[#5197f8] text-sm mt-1">
            {formattedFrom} - {formattedTo}
          </h3>
        </center>
      ) : null}
      {selectedNavItem === "RECENT BILLS" ? <RecentBills /> : null}
      {selectedNavItem === "TAGS & NOTES" ? <TagsAndNotes /> : null}
      {selectedNavItem === "RECENT BILLS" && openBillPopup && (
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
      {openEditNotes && (
        <PopUp show={openEditNotes} onClose={handleCloseEditNotes}>
          <EditNotes />
        </PopUp>
      )}
      {selectedNavItem !== "TAGS & NOTES" ? <Pagination /> : null}
      {isLoading ? <LoadingSpinner /> : null}
    </main>
  );
};

const UserId = memo(MemoUserId);
export default UserId;
