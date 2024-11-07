import Explore from "../explore/page";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export async function generateMetadata() {
  return {
    title: "Package",
    description: "Package page for business",
  };
}
const Package = ({ params }: { params: { businessId: string } }) => {
  return <Explore params={params} />;
};

export default Package;
