import { lazy, Suspense } from "react";
import { useAddStaffStore } from "@/components/store/useAddStaffStore";
import { memo } from "react";
const AddTeam = lazy(() => import("./addTeam"));
const AddRole = lazy(() => import("./addRole"));
const AddPermissions = lazy(() => import("./addPermissions"));
import LoadingSpinner from "@/components/atom/loadingSpinner";

const MemoNewAddStaff = () => {
  const { pageToggle } = useAddStaffStore();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <section className="max-h-[85vh] overflow-auto rounded-t-3xl bg-[#F4F4F4] pb-[7rem] hide-scrollbar">
        {pageToggle === "ADD_STAFF" && <AddTeam />}
        {pageToggle === "ADD_ROLE" && <AddRole />}
        {pageToggle === "ADD_PERMISSIONS" && <AddPermissions />}
      </section>
    </Suspense>
  );
};

const NewAddStaff = memo(MemoNewAddStaff);
export default NewAddStaff;
