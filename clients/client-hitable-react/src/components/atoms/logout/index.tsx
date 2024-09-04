import { PAGE_TYPES, singleRoute } from "@/components/utils/routes";
import { memo, startTransition } from "react";
import { BiLogOut } from "react-icons/bi";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const Logout = () => {
  const navigate = useNavigate();
  const { businessId } = useParams<{ businessId: string }>();
  async function redirect() {
    toast.success("Logout Successful...");
    startTransition(() => {
      navigate(singleRoute[PAGE_TYPES.LOGIN_LITE](businessId || ""));
    });
  }
  async function logOutWaiter() {
    await redirect();
    localStorage.clear();
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log("Service worker unregistered:", registration);
      }
    }
  }
  return (
    <div onClick={logOutWaiter}>
      <BiLogOut size={20} />
    </div>
  );
};

const LogOutMemo = memo(Logout);

export default LogOutMemo;
