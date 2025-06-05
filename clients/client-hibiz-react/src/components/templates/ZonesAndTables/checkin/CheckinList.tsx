import ReactDOM from "react-dom/client";
import { memo, useCallback, useMemo } from "react";
import { Edit, Trash2, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCheckInStore } from "@/components/store/useCheckInStore";
import { useParams } from "react-router-dom";
import { useGetCheckInQrs } from "@/hooks/useCheckIn.ts";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";

interface ICheckInQr {
  _id: string;
  name: string;
  businessId: string;
  downloadLink: string;
  date: number;
  isDeleted: boolean;
}

interface CheckInItemProps {
  qr: ICheckInQr;
  onEdit: (qr: ICheckInQr) => void;
  onDelete: (qr: ICheckInQr) => void;
}

const CheckInItem = memo(({ qr, onEdit, onDelete }: CheckInItemProps) => {
  const handleEdit = useCallback(() => onEdit(qr), [qr, onEdit]);
  const handleDelete = useCallback(() => onDelete(qr), [qr, onDelete]);

  const formattedDate = useMemo(() => {
    return new Date(qr.date).toLocaleDateString();
  }, [qr.date]);

  const downloadQr = useCallback(
    async (link: string) => {
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.top = "-10000px";
      container.style.left = "-10000px";
      document.body.appendChild(container);

      const root = ReactDOM.createRoot(container);
      root.render(
        <QRCode
          value={link}
          size={1080}
          style={{ width: "100%", height: "100%" }}
        />,
      );
      await new Promise((resolve) => setTimeout(resolve, 100));

      try {
        if (container.firstChild) {
          const dataUrl = await toPng(container.firstChild as HTMLElement);
          const linkElement = document.createElement("a");
          linkElement.download = `${qr.name}.png`;
          linkElement.href = dataUrl;
          linkElement.click();
        }
      } catch (error) {
        console.error("Error downloading QR code:", error);
      } finally {
        root.unmount();
        document.body.removeChild(container);
      }
    },
    [qr.name],
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{qr.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadQr(qr?.downloadLink)}
              disabled={!qr.downloadLink}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

CheckInItem.displayName = "CheckInItem";

const CheckInList = memo(() => {
  const { openEditModal, openDeleteModal } = useCheckInStore((state) => ({
    openEditModal: state.openEditModal,
    openDeleteModal: state.openDeleteModal,
  }));
  const businessId = useParams().businessId as string;
  const { checkInQrs } = useGetCheckInQrs(businessId);
  const handleEdit = useCallback(
    (qr: ICheckInQr) => {
      openEditModal(qr);
    },
    [openEditModal],
  );

  const handleDelete = useCallback(
    (qr: ICheckInQr) => {
      openDeleteModal(qr);
    },
    [openDeleteModal],
  );

  const filteredQrs = useMemo(() => {
    return checkInQrs?.filter((qr) => !qr.isDeleted);
  }, [checkInQrs]);

  if (filteredQrs?.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No check-in QR codes found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredQrs?.map((qr) => (
        <CheckInItem
          key={qr._id}
          qr={qr}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
});

CheckInList.displayName = "CheckInList";

export default CheckInList;
