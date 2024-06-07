import { startTransition, useEffect } from "react";
import { HiArrowLeft } from "react-icons/hi";
import { PAGE_TYPES, singleRoute } from "@/components/utils/routes";
import { toast } from "react-toastify";
import { useUserLogin } from "@/components/store/useUserLogin";
import { useNavigate, useParams } from "react-router-dom";

function Setting() {
    const { businessId } = useParams<{ businessId: string }>();
    const navigate = useNavigate();
    const isLogin = useUserLogin((s) => s.isLogin);
    const handleImageClick = () => {
        startTransition(()=>{
            navigate(singleRoute[PAGE_TYPES.KITCHENS](businessId || ""));
        })
    };

    const handleLogout = () => {
        useUserLogin.getState().setIsLogin(false);
        localStorage.clear();
        toast.success("Logout Successful...");
        startTransition(()=>{
            navigate(singleRoute[PAGE_TYPES.LOGIN](businessId || ""));
        })
    };

    useEffect(() => {
        if (!isLogin) {
            startTransition(()=>{
                navigate(singleRoute[PAGE_TYPES.LOGIN](businessId || ""));
            })
        }
    }, []);

    return (
        <div className="px-6 pt-4 bg-[#f5f5f5] min-h-screen">
            <div className="flex items-center">
                <HiArrowLeft
                    onClick={handleImageClick}
                    className="mr-[1.5rem] text-2xl"
                />
                <span>Settings</span>
            </div>
            <div
                className="py-2 pl-6 mt-4 text-sm bg-white rounded-2xl"
                onClick={handleLogout}
            >
                Log Out
            </div>
        </div>
    );
}

export default Setting;
