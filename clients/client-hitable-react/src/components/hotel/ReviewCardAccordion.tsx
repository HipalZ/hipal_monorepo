import { memo, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  DoorOpen,
  CalendarDays,
  Wrench,
  ChevronDown,
  Phone,
  ClipboardList,
  CheckCircle2,
  CircleHelp,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { IHotelStaff } from "@/hooks/useStaff";
import {
  useMarkReviewAsRead,
  useAddReviewNote, // ⬅️ import the hook
  type reviewResponse as ReviewItem,
} from "@/hooks/useReview";
import { Button } from "../ui/button";
import { useHiClientZ } from "../store/useHiClientzData";
import { Textarea } from "@/components/ui/textarea"; // ⬅️ if you don't have this, replace with <textarea>
import { Label } from "@/components/ui/label";

const safeFormatDate = (ms?: number) => {
  if (!ms || Number.isNaN(ms)) return "—";
  try {
    const ts = ms < 1e12 ? ms * 1000 : ms;
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(ts));
  } catch {
    return "—";
  }
};

const Stars = ({ value }: { value: number }) => (
  <div
    className="flex absolute top-2 right-2 items-center gap-1"
    aria-label={`Rating ${value} of 5`}
  >
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={cn(
          "w-6 h-6",
          i < (Number.isFinite(value) ? value : 0)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300",
        )}
      />
    ))}
  </div>
);

const InitialAvatar = ({ name }: { name?: string }) => {
  const letter = name?.trim()?.[0]?.toUpperCase() || "U";
  return (
    <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 grid place-items-center text-sm font-semibold">
      {letter}
    </div>
  );
};

const MemoReviewAccordionCard = ({
  r,
  staffData,
  refetch,
}: { r: ReviewItem; staffData: IHotelStaff[]; refetch: () => void }) => {
  const services =
    r.alertId?.serviceIds?.map((s) => s?.name).filter(Boolean) ?? [];
  const staffs = (r.staffs ?? []).filter(Boolean);
  const getStaffById = (id: string) =>
    staffData.find((s) => s._id === id)?.name;

  const userData = useHiClientZ((s) => s.captainData);
  const { isPending: isMarking, markReviewAsRead } = useMarkReviewAsRead();

  const { isPending: isAddingNote, addReviewNote } = useAddReviewNote();

  // ---- Note state (120-word hard limit) ----
  const [note, setNote] = useState("");
  const wordCount = useMemo(
    () => (note.trim() ? note.trim().split(/\s+/).filter(Boolean).length : 0),
    [note],
  );

  const handleNoteChange: React.ChangeEventHandler<HTMLTextAreaElement> = (
    e,
  ) => {
    const raw = e.target.value;
    const tokens = raw.trim().split(/\s+/).filter(Boolean);
    if (tokens.length <= 120) {
      setNote(raw);
    } else {
      setNote(tokens.slice(0, 120).join(" "));
    }
  };

  const canAddNote =
    !!note.trim() && wordCount > 0 && wordCount <= 120 && !isAddingNote;

  const handleAddNote = async () => {
    if (!canAddNote) return;
    const res = await addReviewNote({ reviewId: r._id, note: note.trim() });
    // hook shows toasts; just refresh UI on success
    if (res.status === 200 || res.status === 201) {
      setNote("");
      refetch();
    }
  };

  const markAsRead = async (rId: string) => {
    const payload = { reviewId: rId, readBy: userData._id };
    const res = await markReviewAsRead(payload);
    if (res.status === 200 || res.status === 201) {
      refetch();
    }
  };

  return (
    <Collapsible>
      <Card className="rounded-xl border shadow-sm overflow-hidden relative">
        <CollapsibleTrigger asChild>
          <CardHeader className="p-4 cursor-pointer select-none">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <InitialAvatar name={r.userId?.name} />
                <div className="leading-tight">
                  <div className="text-sm font-semibold">
                    {r.userId?.name || "Guest"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <DoorOpen className="inline w-4 h-4 mr-1" />
                    {r.roomId?.name || "—"}
                  </div>
                </div>
              </div>

              <section>
                <Stars value={Number(r.reviewRating) || 0} />
                <div className="flex absolute top-10 right-2 items-center gap-2">
                  {r.isRead ? (
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Read
                    </Badge>
                  ) : (
                    <Badge className="text-xs">Unread</Badge>
                  )}
                  <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
                </div>
              </section>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-4 space-y-4 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                <span>{safeFormatDate(r.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{r.userId?.phone || "—"}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1 text-sm font-medium text-muted-foreground">
                <Wrench className="w-4 h-4" />
                Services
              </div>
              {services.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No services listed
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {services.map((s, i) => (
                    <Badge
                      key={`${r._id}-svc-${i}`}
                      variant="secondary"
                      className="text-xs"
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Staff Assigned
              </div>
              {staffs.length === 0 ? (
                <p className="text-xs text-muted-foreground">No staff linked</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {staffs.map((sid) => (
                    <Badge
                      key={`${r._id}-stf-${sid}`}
                      variant="outline"
                      className="text-xs"
                    >
                      {getStaffById(sid) || "unknown"}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground mb-1">
                  Accepted By
                </div>
                {r.alertId?.acceptedBy ? (
                  <div className="text-sm">
                    <div className="font-medium">
                      {r.alertId.acceptedBy.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {r.alertId.acceptedBy.phone || "—"}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">—</div>
                )}
              </div>
              <div className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground mb-1">
                  Delivered By
                </div>
                {r.alertId?.deliveredBy ? (
                  <div className="text-sm">
                    <div className="font-medium">
                      {r.alertId.deliveredBy.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {r.alertId.deliveredBy.phone || "—"}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">—</div>
                )}
              </div>
               <div className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground mb-1">
                  Read By
                </div>
                {r.readBy?._id ? (
                  <div className="text-sm">
                    <div className="font-medium">
                      {r.readBy.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {r.readBy.phone || "—"}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">—</div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1 text-sm font-medium text-muted-foreground">
                <ClipboardList className="w-4 h-4" /> Improvement Areas
              </div>
              {(r.improvementAreas ?? []).length === 0 ? (
                <p className="text-xs text-muted-foreground">None</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {r.improvementAreas!.map((imp, i) => (
                    <Badge
                      key={`${r._id}-imp-${i}`}
                      variant="outline"
                      className="text-xs"
                    >
                      {imp}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground mb-1">
                Read Status
              </div>
              <div className="text-sm flex items-center gap-2">
                {r.isRead ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Read at {safeFormatDate(r.readAt || undefined)}
                  </>
                ) : (
                  <>
                    <CircleHelp className="w-4 h-4 text-amber-500" />
                    Unread
                  </>
                )}
              </div>
            </div>

            {/* ---- Note block ---- */}
            {r.note ? (
              <div className="rounded-md border p-3 bg-muted/30">
                <div className="text-xs text-muted-foreground mb-1">Note</div>
                <p className="text-sm whitespace-pre-wrap">{r.note}</p>
              </div>
            ) : (
              <div className="rounded-md border p-3">
                <Label htmlFor={`note-${r._id}`} className="text-xs">
                  Add Note (max 120 words)
                </Label>
                <Textarea
                  id={`note-${r._id}`}
                  className="mt-2 min-h-[90px]"
                  placeholder="Type a short note..."
                  value={note}
                  onChange={handleNoteChange}
                  disabled={isAddingNote}
                />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span
                    className={cn(
                      "text-muted-foreground",
                      wordCount >= 110 && wordCount < 120 && "text-amber-600",
                      wordCount >= 120 && "text-red-600",
                    )}
                  >
                    {wordCount}/120 words
                  </span>
                  <Button
                    size="sm"
                    onClick={handleAddNote}
                    disabled={!canAddNote}
                  >
                    {isAddingNote ? "Saving..." : "Add Note"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="gap-2">
            {!r.isRead && (
              <Button
                onClick={() => markAsRead(r._id)}
                className="w-full"
                variant="outline"
                disabled={isMarking}
              >
                {isMarking ? "Marking..." : "Mark as Read"}
              </Button>
            )}
          </CardFooter>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

const ReviewAccordionCard = memo(MemoReviewAccordionCard);
export default ReviewAccordionCard;
