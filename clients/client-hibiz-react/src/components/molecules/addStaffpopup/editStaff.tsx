import { memo, lazy, Suspense } from "react";
import { useAddStaffStore } from "@/components/store/useAddStaffStore";
import LoadingSpinner from "@/components/atom/loadingSpinner";

const AddRole = lazy(() => import("./addRole"));
const AddPermissions = lazy(() => import("./addPermissions"));
const EditTeam = lazy(() => import("./editTeam"));


const MemoiseEditStaff = () => {
  const {
    pageToggle,
  } = useAddStaffStore();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <section className="max-h-[85vh] overflow-auto rounded-t-3xl bg-[#F4F4F4] hide-scrollbar">
        {pageToggle === "EDIT_STAFF" && <EditTeam />}
        {pageToggle === "ADD_ROLE" && <AddRole />}
        {pageToggle === "ADD_PERMISSIONS" && <AddPermissions />}
        {
          pageToggle === "DELETE_STAFF" && (
            <section className="p-4 mx-4 space-y-4 bg-white rounded-xl">
              <button
                type="button"
                className="bottom_btn"
              >
                Delete Staff
              </button>
            </section>
          )
        }
      </section>
    </Suspense>

  );
};

const EditStaff = memo(MemoiseEditStaff);

export default EditStaff;

