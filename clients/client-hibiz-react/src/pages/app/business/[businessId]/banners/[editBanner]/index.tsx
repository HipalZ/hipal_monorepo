import CreateBanner from "@/components/templates/explorePage/createBanner";
import { memo } from "react";

const MemoEditBanner = () => {
  return <CreateBanner />;
};

const EditBanner = memo(MemoEditBanner);
export default EditBanner;
