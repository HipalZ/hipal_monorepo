import { memo } from "react";
import { ReceiptTextIcon } from "lucide-react";

interface BillHeaderProps {
  title?: string;
}

const BillHeaderComponent = ({
  title = "Bill Summary",
}: BillHeaderProps = {}) => (
  <div className="flex items-center justify-center gap-3 mb-2">
    <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
      <ReceiptTextIcon className="h-6 w-6 text-white" />
    </div>
    <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent poppins-bold">
      {title}
    </h2>
  </div>
);

export const BillHeader = memo(BillHeaderComponent);
