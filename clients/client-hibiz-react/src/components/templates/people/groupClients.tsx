import BottomButton from "@/components/atom/bottomButton";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import type { ICustomerRecord } from "@/components/types/businessData";
import { FaMoneyBills } from "react-icons/fa6";
import { LuSettings } from "react-icons/lu";
import { MdRebaseEdit } from "react-icons/md";
import { SlLocationPin } from "react-icons/sl";
import { VscGraph } from "react-icons/vsc";

const topNavigationArr = [
  {
    icon: LuSettings,
    name: "Settings",
  },
  {
    icon: VscGraph,
    name: "Analytics",
  },
  {
    icon: MdRebaseEdit,
    name: "Action",
  },
];

const GroupClients = ({
  groupUserData,
}: { groupUserData: ICustomerRecord[] }) => {
  const { selectedGroup, setGroupDetailsModal } = useHiPeopleStore();
  return (
    <>
      <h3 className="ml-6 text-3xl relative z-10 text-[#6F649B] capitalize">
        {selectedGroup.name}
      </h3>

      <section className="bg-[#E3DCFF] rounded-3xl px-4 py-3 justify-evenly mx-6 mt-4 flex items-center relative z-10">
        {topNavigationArr.map((item) => (
          <article key={item.name}>
            <button
              type="button"
              className="flex items-center gap-2 p-4 bg-black text-white rounded-full max-w-[28rem] md:max-w-[19rem] lg:max-w-[21.5rem]"
            >
              <item.icon />
            </button>
            <h3 className="text-sm">{item.name}</h3>
          </article>
        ))}
      </section>

      <section className="flex flex-wrap justify-start mt-6 pb-[7rem] gap-4 mx-4 lg:pb-[5rem]">
        {groupUserData.map((user: ICustomerRecord) => (
          <button
            key={user._id}
            type="button"
            className="relative w-full p-4 bg-white rounded-2xl max-w-[28rem] md:max-w-[19rem] lg:max-w-[21.5rem]"
          >
            <article className="flex items-center justify-between">
              <h3>{user?.userId.name}</h3>
              <p>
                {user?.userId?.phone?.slice(0, 2)}******
                {user?.userId?.phone?.slice(-2)}
              </p>
            </article>
            <div className="flex items-center justify-between gap-2 text-[#6F649B]">
              <div className="flex items-center gap-1">
                <SlLocationPin />
                {user?.visitCount} visits
              </div>
              <div className="flex items-center gap-1">
                <FaMoneyBills />
                {user?.avgSpend}
              </div>
            </div>
          </button>
        ))}
      </section>
      <BottomButton
        buttons={[
          {
            text: "Close",
            onClick: () => setGroupDetailsModal(false),
          },
        ]}
      />
    </>
  );
};

export default GroupClients;
