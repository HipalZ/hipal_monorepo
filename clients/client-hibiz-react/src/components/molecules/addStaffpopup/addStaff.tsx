import AddTeam from "./addTeam";
import AddRole from "./addRole";
import AddPermissions from "./addPermissions";
import { useAddStaffStore } from "@/components/store/useAddStaffStore";

const NewAddStaff = ({refetch}:{refetch:()=>void}) => {
  const { pageToggle } = useAddStaffStore();
   const getUser = () => {
    refetch()
   }
  return (
    <section className="max-h-[85vh] overflow-auto rounded-t-3xl bg-[#F4F4F4]">
      {pageToggle === "ADD_STAFF" && <AddTeam getUser={getUser} />}
      {pageToggle === "ADD_ROLE" && <AddRole />}
      {pageToggle === "ADD_PERMISSIONS" &&  <AddPermissions />}
    </section>
  );
};

export default NewAddStaff;
