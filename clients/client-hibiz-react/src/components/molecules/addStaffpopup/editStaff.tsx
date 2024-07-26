import { useAddStaffStore } from "@/components/store/useAddStaffStore";
import AddRole from "./addRole";
import AddPermissions from "./addPermissions";
import { memo } from "react";
import EditTeam from "./editTeam";


const MemoiseEditStaff = ({ refetch }: { refetch: () => void }) => {
  const {
    pageToggle,
  } = useAddStaffStore();


  return (
    <section className="h-auto max-h-[85vh] overflow-auto rounded-t-3xl bg-[#F4F4F4]">

      {pageToggle === "EDIT_STAFF" && (
        <EditTeam refetch={refetch} />
      )}
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
  );
};

const EditStaff = memo(MemoiseEditStaff);

export default EditStaff;

