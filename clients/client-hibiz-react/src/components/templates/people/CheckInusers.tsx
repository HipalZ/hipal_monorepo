import { memo, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Calendar, Hash, QrCode, Download, Loader2, User, Mail, Briefcase, MapPin, Cake } from "lucide-react";
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
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    dob: number;
    address: string;
    profession: string;
  };
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
  console.log(user);

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(user.date);
  }, [user.date]);

  const formattedDOB = useMemo(() => {
    if (!user.userId.dob) return null;
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(user.userId.dob);
  }, [user.userId.dob]);

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Header with name and QR badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
              <User className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-base">{user.userId.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            {user.qrId && (
              <Badge variant="secondary" className="h-6 px-2 text-xs">
                <QrCode className="h-3 w-3 mr-1" />
                QR
              </Badge>
            )}
            <Badge variant="outline" className="h-6 px-2 text-xs font-mono">
              <Hash className="h-3 w-3 mr-1" />
              {user.code}
            </Badge>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <a
              href={`tel:${user.userId.phone}`}
              className="text-primary hover:underline"
              aria-label={`Call ${user.userId.name}`}
            >
              {user.userId.phone}
            </a>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <a
              href={`mailto:${user.userId.email}`}
              className="text-primary hover:underline truncate"
              aria-label={`Email ${user.userId.name}`}
            >
              {user.userId.email}
            </a>
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-foreground">{user.userId.profession}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-foreground line-clamp-2">{user.userId.address}</span>
          </div>

          {formattedDOB && (
            <div className="flex items-center gap-2 text-sm">
              <Cake className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-foreground">{formattedDOB}</span>
            </div>
          )}
        </div>

        {/* Check-in Information */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>Checked in on {formattedDate}</span>
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
    <section className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
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
