import MemoizedHeader from "@/components/molecules/header";
import { memo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetAllLayouts } from "@/hooks/useMenuLayout";



const MemoService = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const { isLoading, allMenuLayouts } = useGetAllLayouts(businessId as string);

  // Redirect if a layout ID exists
  useEffect(() => {
    if (!isLoading && allMenuLayouts?.data?.length > 0) {
      navigate(`${allMenuLayouts.data[0]._id}`);
    }
  }, [isLoading, allMenuLayouts, businessId, navigate]);

  return (
    <main>
      <div className="sticky top-0 z-50 w-full linear_gradient_background">
        <MemoizedHeader title="Services Menu" />
      </div>
      <h3>
        Contact with service team to create the default layout for your services
      </h3>
    </main>
  );
};

const Services = memo(MemoService);
export default Services;
