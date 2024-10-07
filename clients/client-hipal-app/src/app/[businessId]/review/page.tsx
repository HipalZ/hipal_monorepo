import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import dynamics from "next/dynamic";

// export const dynamic = "force-dynamic";
// export const fetchCache = "force-no-store";

// 1 day time to revalidate
export const revalidate = 3600;
export async function generateMetadata() {
  return {
    title: "Review",
    description: "Review page for businesses",
  };
}

const MainReview = dynamics(
  () => import("@/components/templates/newReview/mainReviewPage"),
  {
    ssr: false,
    loading: () => <SkeletonLoader />,
  },
);

export default async function Page() {
  return (
    <main>
      <MainReview />
    </main>
  );
}
