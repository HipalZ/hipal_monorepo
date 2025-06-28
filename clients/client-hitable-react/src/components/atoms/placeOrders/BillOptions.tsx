import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BottomPopUp from "../universalPopup";
import DiscountModal from "./billModals/DiscountModal.tsx";
import ServiceChargeModal from "./billModals/ServiceChargeModal.tsx";
import type { IBillData } from "@/components/types/hiClientzData.ts";

interface BillOptionsProps {
  data: IBillData;
}

type ModalType = "discount" | "serviceCharge" | "coupon" | "coinz" | null;

const MemoBillOptions = ({ data }: BillOptionsProps) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const closeModal = () => setActiveModal(null);


  return (
    <>
      <div className="absolute top-0 z-50 rounded-t-xl p-4 bg-white w-full flex justify-between items-center">
        <h2 className="text-xl font-semibold -mt-4">Bill Options</h2>
        <section className="mt-4">
          <p className="text-sm text-gray-600">Table: {data.tableName}</p>
          <p className="text-sm text-gray-600">
            {data.customerName} ({data.customerPhone})
          </p>
        </section>
      </div>
      <div className="space-y-4 px-4 pt-[5rem] pb-[5rem] h-[90dvh] overflow-auto">
        {/* Current Bill Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Bill Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">SubTotal: ₹{data.subTotal}</p>
                <p className="font-medium">GST: ₹{data.gst}</p>
                <p className="font-medium">
                  Service Charge: ₹{data.serviceCharge}
                </p>
              </div>
              <div>
                <p className="font-medium">Discount: ₹{data.discount}</p>
                <p className="font-medium">
                  Claimed Coins: ₹{data.claimedCoins}
                </p>
                <p className="font-medium text-lg">Total: ₹{data.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => setActiveModal("discount")}
            className="h-12 w-full"
          >
            <div className="flex justify-between items-center w-full">
              <p className="font-medium">Manage Discount</p>
              <p className="text-xs">Current: ₹{data.discount}</p>
            </div>
          </Button>

          <Button
            onClick={() => setActiveModal("serviceCharge")}
            className="h-12 w-full"
          >
            <div className="flex justify-between items-center w-full">
              <p className="font-medium">Service Charge</p>
              <p className="text-xs">Current: ₹{data.serviceCharge}</p>
            </div>
          </Button>
        </div>
      </div>

      {/* Modals */}
      {activeModal === "discount" && (
        <BottomPopUp
          width="w-[30rem]"
          height="h-[100dvh] lg:h-[90dvh]"
          show={true}
          onClose={closeModal}
          rightTopBack
          hide
        >
          <DiscountModal data={data} onClose={closeModal} />
        </BottomPopUp>
      )}

      {activeModal === "serviceCharge" && (
        <BottomPopUp
          rightTopBack
          height="h-[50dvh]"
          width="w-[30rem]"
          show={true}
          onClose={closeModal}
        >
          <ServiceChargeModal data={data} onClose={closeModal} />
        </BottomPopUp>
      )}
    </>
  );
};

const BillOptions = memo(MemoBillOptions);

export default BillOptions;
