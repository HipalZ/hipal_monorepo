import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Clock, Users, AlertTriangle } from "lucide-react";
import {
  useFetchLevels,
  useUpdateStaffToHotelLevel,
  useRemoveStaffFromLevel,
  type IHotelStaff,
  type IHotelStaffLevel,
  type IStaffHotelLevel,
} from "@/hooks/useHotelStaff";
import useBusinessData from "@/components/store/useBusinessData";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton.tsx";
import { Button } from "@/components/ui/button";

interface EscalationAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: IHotelStaff | null;
}

// Helpers
const getLevelDocByNumber = (levels: IHotelStaffLevel[], levelNum: 1 | 2 | 3) =>
  levels.find((l) => l.level === levelNum);

const isStaffInLevel = (
  levelDoc: IHotelStaffLevel | undefined,
  staffId: string,
) => !!levelDoc && (levelDoc.staffIds ?? []).some((s) => s._id === staffId);

// Click guard so inputs/buttons inside a Card don't toggle it
const shouldIgnoreCardClick = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  !!target.closest(
    "input, textarea, select, button, a, [role=button], [data-no-card-toggle]",
  );

const EscalationAssignmentModal = ({
  isOpen,
  onClose,
  staff,
}: EscalationAssignmentModalProps) => {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);

  const { levelsData = [], gettingLevels } = useFetchLevels();
  const { updateStaffToLevel, updateStaffLoader } =
    useUpdateStaffToHotelLevel();
  const { removeStaff, removeStaffLoader } = useRemoveStaffFromLevel();

  const [selectedLevels, setSelectedLevels] = useState<Record<number, boolean>>(
    {
      1: false,
      2: false,
      3: false,
    },
  );
  const [escalationTimes, setEscalationTimes] = useState<
    Record<number, number>
  >({
    1: 5,
    2: 10,
    3: 15,
  });

  const levelByNumber = useMemo(() => {
    const map: Record<number, IHotelStaffLevel | undefined> = {};
    for (const lvl of levelsData) map[lvl.level] = lvl;
    return map;
  }, [levelsData]);

  const staffId = staff?._id ?? "";

  // Init from server
  useEffect(() => {
    if (!levelsData || !staff) return;

    const assignments: Record<number, boolean> = {
      1: false,
      2: false,
      3: false,
    };
    const times: Record<number, number> = { 1: 5, 2: 10, 3: 15 };

    ([1, 2, 3] as const).forEach((level) => {
      const levelDoc = getLevelDocByNumber(levelsData, level);
      const assigned = isStaffInLevel(levelDoc, staff._id);
      assignments[level] = assigned;
      if (assigned && typeof levelDoc?.nextLevelTime === "number") {
        times[level] = levelDoc.nextLevelTime;
      }
    });

    setSelectedLevels(assignments);
    setEscalationTimes(times);
  }, [levelsData, staff]);

  const handleLevelToggle = (level: number) => {
    setSelectedLevels((prev) => ({ ...prev, [level]: !prev[level] }));
  };

  const handleTimeChange = (level: number, value: number) => {
    const v = Number.isFinite(value) ? Math.max(1, value) : 1;
    setEscalationTimes((prev) => ({ ...prev, [level]: v }));
  };

  // Instant per-level actions
  const handleAddNow = async (level: number) => {
    if (!staff || !businessId) return;
    const levelDoc = getLevelDocByNumber(levelsData, level as 1 | 2 | 3);
    if (!levelDoc) return toast.error(`Level L${level} not configured`);
    try {
      await updateStaffToLevel({
        levelId: levelDoc._id,
        businessId,
        staffIds: [staff._id],
        nextLevelTime: escalationTimes[level],
      });
      toast.success(`Added ${staff.name} to L${level}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to add");
    }
  };

  const handleRemoveNow = async (level: number) => {
    if (!staff) return;
    const levelDoc = getLevelDocByNumber(levelsData, level as 1 | 2 | 3);
    if (!levelDoc) return toast.error(`Level L${level} not configured`);
    try {
      await removeStaff({
        levelId: levelDoc._id,
        staffIds: [staff._id],
      });
      toast.success(`Removed ${staff.name} from L${level}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove");
    }
  };

  const handleUpdateTimeNow = async (level: number) => {
    if (!staff || !businessId) return;
    const levelDoc = getLevelDocByNumber(levelsData, level as 1 | 2 | 3);
    if (!levelDoc) return toast.error(`Level L${level} not configured`);
    try {
      await updateStaffToLevel({
        levelId: levelDoc._id,
        businessId,
        nextLevelTime: escalationTimes[level],
      });
      toast.success(`Updated L${level} time`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update time");
    }
  };

  // Batch-save diff (kept for your existing flow)
  const handleSave = async () => {
    if (!staff || !businessId) return;

    const ops: Promise<any>[] = [];

    for (const levelNum of [1, 2, 3] as const) {
      const desired = !!selectedLevels[levelNum];
      const timeDesired = escalationTimes[levelNum];

      const levelDoc = getLevelDocByNumber(levelsData, levelNum);
      const currentlyAssigned = isStaffInLevel(levelDoc, staffId);

      if (desired && !currentlyAssigned && levelDoc) {
        ops.push(
          updateStaffToLevel({
            levelId: levelDoc._id,
            businessId,
            staffIds: [staffId],
            nextLevelTime: timeDesired,
          }),
        );
        continue;
      }

      if (!desired && currentlyAssigned && levelDoc) {
        ops.push(
          removeStaff({
            staffIds: [staffId],
            levelId: levelDoc._id,
          }),
        );
        continue;
      }

      if (desired && currentlyAssigned && levelDoc) {
        const serverTime = levelDoc.nextLevelTime;
        if (typeof serverTime === "number" && serverTime !== timeDesired) {
          ops.push(
            updateStaffToLevel({
              levelId: levelDoc._id,
              businessId,
              nextLevelTime: timeDesired,
            }),
          );
        }
      }
    }

    if (ops.length === 0) {
      toast("No changes to save");
      onClose();
      return;
    }

    try {
      await Promise.all(ops);
      toast.success("Escalation assignment saved");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save escalation assignment");
    }
  };

  const getLevelIcon = (level: number) => {
    switch (level) {
      case 1:
        return <Users className="w-4 h-4" />;
      case 2:
        return <Clock className="w-4 h-4" />;
      case 3:
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-green-100 text-green-800";
      case 2:
        return "bg-yellow-100 text-yellow-800";
      case 3:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelDescription = (level: number) => {
    switch (level) {
      case 1:
        return "First response team - immediate assistance";
      case 2:
        return "Supervisor level - escalated issues";
      case 3:
        return "Management level - critical situations";
      default:
        return "";
    }
  };

  // Render list of members for a level; highlight the current staff if assigned
  const renderMembers = (level: number) => {
    const levelDoc = levelByNumber[level];
    const members = (levelDoc?.staffIds ?? []) as IStaffHotelLevel[];
    if (!levelDoc) {
      return (
        <div className="text-xs text-muted-foreground">
          Level L{level} is not configured yet.
        </div>
      );
    }

    if (members.length === 0) {
      return (
        <div className="text-xs text-muted-foreground">
          No members in L{level} yet.
        </div>
      );
    }

    return (
      <div className="mt-3 space-y-2">
        <div className="text-xs font-medium">Members in L{level}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {members.map((m) => {
            const isThisStaff = m._id === staffId;
            return (
              <div
                key={m._id}
                className={cn(
                  "rounded-md border p-2 text-xs",
                  isThisStaff ? "border-primary ring-1 ring-primary/30" : "",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{m.name}</div>
                  {isThisStaff && (
                    <Badge className="text-xs ml-2">This Staff</Badge>
                  )}
                </div>
                <div className="text-muted-foreground">{m.phone}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const isSaving = updateStaffLoader || removeStaffLoader;

  return (
    <section
      className={cn(
        "w-full max-w-3xl mx-auto",
        "max-h-[80vh] overflow-y-auto hide-scrollbar",
        "rounded-lg border bg-background p-4",
      )}
    >
      <div className="mb-4">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <AlertTriangle className="w-5 h-5" />
          Assign {staff?.name ? staff.name : "Staff"} to Escalation Levels
        </div>
        <p className="text-sm text-muted-foreground">
          Select escalation levels and set the timing for escalation handoff.
        </p>
      </div>

      {gettingLevels ? (
        <div className="space-y-4">
          {[1, 2, 3].map((level) => (
            <Card key={level} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {[1, 2, 3].map((level) => {
            const assigned = isStaffInLevel(levelByNumber[level], staffId);
            const serverTime = levelByNumber[level]?.nextLevelTime;
            const timeChanged =
              typeof serverTime === "number" &&
              serverTime !== escalationTimes[level];

            return (
              <Card
                key={level}
                className={cn(
                  "cursor-pointer transition-all",
                  selectedLevels[level] ? "ring-2 ring-primary" : "",
                )}
                onClick={(e) => {
                  if (shouldIgnoreCardClick(e.target)) return;
                  handleLevelToggle(level);
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn("p-2 rounded-full", getLevelColor(level))}
                      >
                        {getLevelIcon(level)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">
                            Level {level}
                          </CardTitle>
                          {assigned && (
                            <Badge variant="secondary" className="text-xs">
                              Already Assigned
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {getLevelDescription(level)}
                        </p>
                        {renderMembers(level)}
                      </div>
                    </div>
                    <Badge
                      variant={selectedLevels[level] ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLevelToggle(level);
                      }}
                    >
                      {selectedLevels[level] ? "Assigned" : "Not Assigned"}
                    </Badge>
                  </div>
                </CardHeader>

                {assigned && !selectedLevels[level] && (
                  <div className="px-4 pb-3">
                    <div className="rounded-md border p-3 bg-muted/40">
                      <div className="text-xs font-medium mb-1">
                        This Staff in L{level}
                      </div>
                      <div className="text-xs">
                        <span className="font-medium">Name:</span> {staff?.name}
                      </div>
                      <div className="text-xs">
                        <span className="font-medium">Phone:</span>{" "}
                        {staff?.phone}
                      </div>
                    </div>
                  </div>
                )}

                {selectedLevels[level] && (
                  <>
                    <Separator />
                    <CardContent className="pt-3">
                      {assigned && (
                        <div className="mb-3 rounded-md border p-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">
                              This Staff in L{level}
                            </div>
                            <Badge>Assigned</Badge>
                          </div>
                          <div className="mt-1 text-xs">
                            <div>
                              <span className="font-medium">Name:</span>{" "}
                              {staff?.name}
                            </div>
                            <div>
                              <span className="font-medium">Phone:</span>{" "}
                              {staff?.phone}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <Label
                              htmlFor={`time-${level}`}
                              className="text-sm font-medium"
                            >
                              Escalation Time (minutes)
                            </Label>
                            <Input
                              id={`time-${level}`}
                              type="number"
                              min="1"
                              max="60"
                              value={escalationTimes[level]}
                              onChange={(e) => {
                                handleTimeChange(
                                  level,
                                  Number.parseInt(e.target.value, 10) || 1,
                                );
                              }}
                              className="mt-1"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Issues escalate to L{level} after{" "}
                            {escalationTimes[level]} min
                          </div>
                        </div>

                        {/* Per-level action buttons */}
                        <div
                          className="flex flex-wrap items-center gap-2"
                          data-no-card-toggle
                        >
                          {!assigned ? (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddNow(level);
                              }}
                              disabled={isSaving}
                            >
                              Add to L{level}
                            </Button>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveNow(level);
                                }}
                                disabled={isSaving}
                              >
                                Remove from L{level}
                              </Button>
                              <Button
                                size="sm"
                                variant={timeChanged ? "default" : "outline"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateTimeNow(level);
                                }}
                                disabled={isSaving || !timeChanged}
                                title={
                                  timeChanged ? "Update time" : "No changes"
                                }
                              >
                                {timeChanged
                                  ? "Update Time"
                                  : "Time up-to-date"}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <div className="h-16" />
      <AdvancedBottomButton
        fixed
        maxWidth="30rem"
        buttons={[
          {
            text: "Back",
            isBackButton: true,
            onClick: onClose,
            className: "pl-3 rounded-md",
          },
          {
            text: "Save",
            onClick: handleSave,
            className: "pl-3 rounded-md",
            disable: isSaving,
          },
        ]}
      />
    </section>
  );
};

export default EscalationAssignmentModal;
