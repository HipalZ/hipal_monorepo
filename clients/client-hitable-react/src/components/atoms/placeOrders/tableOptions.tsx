import { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  Users,
  UserCheck,
  CookingPot,
  BookmarkX,
  HomeIcon,
} from "lucide-react";
import {
  type orderModal,
  type TransferTable,
  useOrderStore,
} from "@/components/store/useOrderData";
import { Badge } from "@/components/ui/badge";
import { MdTableBar } from "react-icons/md";
import CommonBottomButton from "../bottomButton";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useHomeNavigation } from "@/components/hooks/useNavigateHome.ts";

const MemoTableOptions = () => {
  const setModalType = useOrderStore((s) => s.setModalType);
  const selectedTable = useOrderStore((s) => s.selectedTable);
  const setTransferTable = useOrderStore((s) => s.setTransferTable);
  const transferTable = useOrderStore((s) => s.transferTable);
  const transferModal = useOrderStore((s) => s.transferModal);
  const setTransferModal = useOrderStore((s) => s.setTransferModal);
  const setOpenOrderModal = useOrderStore((s) => s.setOpenOrderModal);
  const { goHome } = useHomeNavigation()

  const screenSize = useScreenSize();
  const toggleModalType = useCallback(
    (type: orderModal) => {
      setModalType(type);
    },
    [setModalType],
  );

  const handleTransferTable = useCallback(
    (type: TransferTable) => {
      setTransferTable(type);
      setTransferModal(true);
    },
    [setTransferTable, setTransferModal, transferModal, transferTable],
  );

  const closeOrderModalHandler = useCallback(() => {
    setOpenOrderModal(false);
  }, [setOpenOrderModal]);


  return (
    <section className="min-h-[90dvh] flex justify-center md:py-[8rem] px-4 mx-auto">
      <CardContent className="space-y-4 mt-24 md:mt-6 h-[70dvh] pb-[5rem] overflow-auto hide-scrollbar">
        {selectedTable?.hiCode && (
          <Badge variant="secondary" className="flex justify-between w-full">
            <div className="text-2xl font-bold">Table code :-</div>
            <div className="text-2xl font-bold">{selectedTable?.hiCode}</div>
          </Badge>
        )}

        <Button
          size="lg"
          variant="outline"
          className="w-full"
          onClick={() => toggleModalType("guest")}
        >
          <Users className="w-5 h-5 mr-2" />
          Add Guest Count
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="w-full"
          onClick={() => toggleModalType("customer")}
        >
          <UserCheck className="w-5 h-5 mr-2" />
          Know Your Customers
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="w-full"
          onClick={() => handleTransferTable("ITEM")}
        >
          <CookingPot className="w-5 h-5 mr-2" />
          Transfer Item
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="w-full"
          onClick={() => handleTransferTable("TABLE")}
        >
          <MdTableBar className="w-5 h-5 mr-2" />
          Transfer Table
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="w-full"
          onClick={() => handleTransferTable("DELETE")}
        >
          <BookmarkX className="w-5 h-5 mr-2" />
          Delete kot
        </Button>
      </CardContent>
      <CommonBottomButton
        fixed={true}
        maxWidth={screenSize === "xs" ? "30rem" : "48rem"}
        backgroundColor={screenSize === "xs" ? "" : "white"}
        buttons={[
          {
            text: " ",
            onClick: goHome,
            icon: <HomeIcon />,
            className: "rounded-md !w-[4rem] pl-2",
          },
          {
            text: "Back",
            onClick: closeOrderModalHandler,
            className: "rounded-md w-full",
          },
        ]}
      />
    </section>
  );
};

const TableOptions = memo(MemoTableOptions);
export default TableOptions;
