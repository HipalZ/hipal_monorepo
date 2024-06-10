import { PAGE_TYPES, singleRoute } from "@/components/utils/routes";
import { BiLogOut } from "react-icons/bi";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const Logout = () => {
  const navigate = useNavigate();
  const { businessId } = useParams<{ businessId: string }>();
  async function redirect() {
    toast.success("Logout Successful...");
    navigate(singleRoute[PAGE_TYPES.LOGIN_LITE](businessId || ''));
  }
  async function logOutWaiter() {
    await redirect();
    localStorage.clear();
  }
  return (
    <div onClick={logOutWaiter}>
      <BiLogOut size={20} />
    </div>
  );
};

export default Logout;
