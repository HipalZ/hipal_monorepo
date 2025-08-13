import { memo, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Calendar, Hash, QrCode, Download, Loader2 } from "lucide-react";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import DateRangePicker from "@/components/molecules/dateRangePicker";
import usePaginationStore from "@/components/store/usePaginationStore";
import useTimings from "@/components/store/useTimings";
import {
  useFetchCheckInUsers,
  useDownloadCheckInCsv,
  useGetCHeckIn,
} from "@/hooks/useCheckIn";

// shadcn select
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface CheckInUser {
  _id: string;
  userId: { _id: string; name: string; phone: string };
  businessId: string;
  code: string;
  date: number;
  qrId?: string;
}

interface CheckInQr {
  _id: string;
  name: string;
  downloadLink: string;
  date: number;
}

interface CheckInUserCardProps {
  user: CheckInUser;
}

const CheckInUserCard = memo(({ user }: CheckInUserCardProps) => {
  const formattedDate = useMemo(() => {
    // keep consistent format; change TZ if you prefer IST explicitly
    return new Intl.DateTimeFormat("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(user.date);
  }, [user.date]);

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-2">
          {/* Left: user */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate">
                {user.userId.name}
              </h3>
              {user.qrId && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  <QrCode className="h-3 w-3" />
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              <a
                href={`tel:${user.userId.phone}`}
                className="truncate"
                aria-label={`Call ${user.userId.name}`}
              >
                {user.userId.phone}
              </a>
            </div>
          </div>

          {/* Right: details */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              <Hash className="h-3 w-3 text-muted-foreground" />
              <Badge variant="outline" className="h-5 px-1.5 text-xs font-mono">
                {user.code}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
CheckInUserCard.displayName = "CheckInUserCard";

const CheckInUsersList = memo(({ users }: { users: CheckInUser[] }) => {
  if (!users?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No check-in users found for the selected filters.
        </p>
      </div>
    );
  }

  return (
    <section className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
      {users.map((user) => (
        <CheckInUserCard key={user._id} user={user} />
      ))}
    </section>
  );
});
CheckInUsersList.displayName = "CheckInUsersList";

const SaveAllDataButton = memo(() => {
  const businessId = useParams<{ businessId: string }>().businessId;
  const { timeStampStart, timeStampEnd } = useTimings((s) => ({
    timeStampStart: s.timeStampStart,
    timeStampEnd: s.timeStampEnd,
  }));
  const { selectedQrId } = usePaginationStore((s) => ({
    selectedQrId: s.selectedQrId,
  }));
  const { downloadCheckInCsv, isDownloadingCsv } = useDownloadCheckInCsv();

  const handleSaveAllData = async () => {
    if (!businessId || !timeStampStart || !timeStampEnd) return;
    try {
      await downloadCheckInCsv({
        businessId,
        from: String(timeStampStart),
        to: String(timeStampEnd),
        // If your API supports CSV by qrId, include this:
        ...(selectedQrId ? { qrId: selectedQrId } : {}),
      });
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <Button
      onClick={handleSaveAllData}
      disabled={isDownloadingCsv || !businessId}
      variant="outline"
      size="sm"
    >
      {isDownloadingCsv ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Downloading...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Save All Data
        </>
      )}
    </Button>
  );
});
SaveAllDataButton.displayName = "SaveAllDataButton";

const MemoCheckInUsers = () => {
  const businessId = useParams<{ businessId: string }>().businessId;

  const { pageNumber, selectedQrId, setSelectedQrId } = usePaginationStore(
    (s) => ({
      pageNumber: s.pageNumber,
      selectedQrId: s.selectedQrId,
      setSelectedQrId: s.setSelectedQrId,
    }),
  );

  const { timeStampStart, timeStampEnd } = useTimings((s) => ({
    timeStampStart: s.timeStampStart,
    timeStampEnd: s.timeStampEnd,
  }));

  // Load QR sources
  const { gettingCheckInQrs, checkInQrsData } = useGetCHeckIn();
  const qrOptions: CheckInQr[] = checkInQrsData ?? [];

  const { checkInUsers, isLoadingCheckInUsers } = useFetchCheckInUsers({
    businessId: businessId || "",
    pageNumber: String(pageNumber),
    from: String(timeStampStart),
    to: String(timeStampEnd),
    ...(selectedQrId ? { qrId: selectedQrId } : {}),
  });

  const usersToRender = useMemo(() => {
    const list = checkInUsers ?? [];
    return selectedQrId ? list.filter((u) => u.qrId === selectedQrId) : list;
  }, [checkInUsers, selectedQrId]);

  return (
    <main className="space-y-6">
      <section className="lg:-mt-12">
        <DateRangePicker />
      </section>

      {/* Filters row */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Check-in Users</h2>
          <Badge variant="outline" className="text-sm">
            {usersToRender?.length || 0} entries
          </Badge>
        </div>

        {/* QR Select */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter by QR:</span>
          <Select
            value={selectedQrId ?? "all"}
            onValueChange={(v) => setSelectedQrId(v === "all" ? undefined : v)}
            disabled={gettingCheckInQrs}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue
                placeholder={gettingCheckInQrs ? "Loading QRs..." : "Select QR"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All check-in QRs</SelectItem>
              {qrOptions.map((qr) => (
                <SelectItem key={qr._id} value={qr._id}>
                  {qr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <SaveAllDataButton />
      </section>

      {/* Users list */}
      {isLoadingCheckInUsers ? (
        <LoadingSpinner />
      ) : (
        <section className="space-y-6">
          <CheckInUsersList users={usersToRender} />
        </section>
      )}
    </main>
  );
};

const CheckInUsers = memo(MemoCheckInUsers);
export default CheckInUsers;
