import { useAlert } from "@/components/store/useAlert";
import { startTransition, useEffect } from "react";
import { PAGE_TYPES, singleRoute } from "@/components/utils/routes";
import { MdOutlineRedeem } from "react-icons/md";
import { useLocation, useNavigate, useParams } from "react-router-dom";

function FooterLite() {
  const navigate = useNavigate();
  const location = useLocation();
  const { businessId } = useParams<{
    businessId: string;
  }>();
  const currentRoute = location.pathname;
  const pathParts = currentRoute.split("/");
  const path = pathParts[pathParts.length - 1];

  const { newAlertsCount, newOrderCount } = useAlert();

  const handleRoute = () =>{
    startTransition(()=>{
      navigate(singleRoute[PAGE_TYPES.LOYALTY](businessId || ''))
    })
  }

  useEffect(() => {}, [newAlertsCount, newOrderCount]);

  return (
    <div className="fixed bottom-0 z-20 w-full py-2 bg-primary ">
      <div className="flex justify-around mx-6">
          <div onClick={handleRoute}>
            <button
              className={`${
                path === "loyalty"
                  ? "bg-base-100/80 text-primary"
                  : "bg-primary text-base-100"
              } px-4 py-1 rounded-full focus:outline-none transition duration-300`}
            >
              <MdOutlineRedeem className="text-[1.2rem]" />
            </button>
            <div className={`text-sm ml-2 font-normal text-base-100`}>Loyalty</div>
          </div>
      </div>
    </div>
  );
}

export default FooterLite;
