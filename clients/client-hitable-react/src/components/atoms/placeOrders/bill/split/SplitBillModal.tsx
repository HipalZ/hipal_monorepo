import { memo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Percent, List } from "lucide-react";
import type { IBillData } from "@/components/types/hiClientzData.ts";
import PortionSplit from "./PortionSplit";
import ItemWiseSplit from "./ItemWiseSplit";
import { useOrderStore } from "@/components/store/useOrderData.ts";

interface SplitBillModalProps {
  data: IBillData;
  onClose: () => void;
}

type SplitMode = "select" | "portion" | "itemwise";

const SplitBillModal = memo(({ data, onClose }: SplitBillModalProps) => {
  const [splitMode, setSplitMode] = useState<SplitMode>("select");
  const setActiveModal = useOrderStore((s) => s.setActiveModal);

  const handleBack = useCallback(() => {
    if (splitMode === "select") {
      setActiveModal("options");
    } else {
      setSplitMode("select");
    }
  }, [splitMode, onClose, setActiveModal]);

  const totalItems = data.billItems.reduce(
    (sum, group) =>
      sum + group.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 bg-white z-50 rounded-t-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-1"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {splitMode === "select" && "Split Bill"}
            {splitMode === "portion" && "Portion & Percentage Split"}
            {splitMode === "itemwise" && "Item-wise Split"}
            {" "}({data.tableName})
          </h2>
        </div>
        <div className="text-sm text-gray-600 mr-8">
          <p>Total: ₹{data.total}</p>
        </div>
      </div>

      <div className="p-4 h-[calc(100vh-80px)] overflow-auto">
        {splitMode === "select" && (
          <div className="space-y-4">
            {/* Bill Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Bill Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p>SubTotal: ₹{data.subTotal}</p>
                    <p>GST: ₹{data.gst}</p>
                    <p>Service Charge: ₹{data.serviceCharge}</p>
                  </div>
                  <div>
                    <p>Discount: ₹{data.discount}</p>
                    <p>Total Items: {totalItems}</p>
                    <p className="font-semibold text-lg">
                      Total: ₹{data.total}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Split Options */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Choose Split Method:</h3>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
                onClick={() => setSplitMode("portion")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Percent className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Portion & Percentage</h4>
                      <p className="text-sm text-gray-600">
                        Split bill by percentage (e.g., 50%-50%, 30%-70%)
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Max 20 variants, Min 1% each
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
                onClick={() => setSplitMode("itemwise")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <List className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Item-wise Split</h4>
                      <p className="text-sm text-gray-600">
                        Assign specific items to different bills
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Max {totalItems} variants based on items
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {splitMode === "portion" && (
          <PortionSplit data={data} onClose={onClose} />
        )}

        {splitMode === "itemwise" && (
          <ItemWiseSplit data={data} onClose={onClose} />
        )}
      </div>
    </div>
  );
});

SplitBillModal.displayName = "SplitBillModal";
export default SplitBillModal;
