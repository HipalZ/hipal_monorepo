import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Users, AlertTriangle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useFetchLevels,
  useUpdateStaffToHotelLevel,
  useRemoveStaffFromLevel,
  type IHotelStaff,
  type IHotelStaffLevel,
} from "@/hooks/useHotelStaff";
import useBusinessData from "@/components/store/useBusinessData";
import toast from "react-hot-toast";
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton.tsx";

interface BulkEscalationAssignmentPanelProps {
  staffList: IHotelStaff[];
  onClose: () => void;
}

export default function BulkEscalationAssignmentPanel({
  staffList,
  onClose,
}: BulkEscalationAssignmentPanelProps) {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);

  const { levelsData = [], gettingLevels } = useFetchLevels();
  const { updateStaffToLevel, updateStaffLoader } =
    useUpdateStaffToHotelLevel();
  const { removeStaff, removeStaffLoader } = useRemoveStaffFromLevel();

  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [minutes, setMinutes] = useState<number>(5);
  const [mode, setMode] = useState<"add" | "remove">("add");

  // NEW: selection for "Current members" bulk removal
  const [membersRemoveSet, setMembersRemoveSet] = useState<Set<string>>(
    new Set(),
  );

  const levelDoc = useMemo(
    () => levelsData.find((l) => l.level === level),
    [levelsData, level],
  );

  // membership lookup per level
  const assignedSets = useMemo(() => {
    const map: Record<1 | 2 | 3, Set<string>> = {
      1: new Set(),
      2: new Set(),
      3: new Set(),
    };
    for (const lvl of levelsData as IHotelStaffLevel[]) {
      const L = lvl.level as 1 | 2 | 3;
      for (const s of lvl.staffIds ?? []) map[L].add(s._id);
    }
    return map;
  }, [levelsData]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return staffList;
    return staffList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.phone ?? "").toLowerCase().includes(q),
    );
  }, [query, staffList]);

  // eligible ids based on the visible MODE (used by "Select All")
  const eligibleFilteredIds = useMemo(() => {
    if (mode === "add") {
      return filtered
        .map((s) => s._id)
        .filter((id) => !assignedSets[level].has(id));
    }
    return filtered
      .map((s) => s._id)
      .filter((id) => assignedSets[level].has(id));
  }, [filtered, assignedSets, level, mode]);

  const toggleSelect = (id: string, disabled: boolean) => {
    if (disabled) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => setSelectedIds(new Set(eligibleFilteredIds));
  const clearSelection = () => setSelectedIds(new Set());

  // compute both action sets regardless of mode (for footer buttons)
  const selectedForAdd = useMemo(
    () => Array.from(selectedIds).filter((id) => !assignedSets[level].has(id)),
    [selectedIds, assignedSets, level],
  );
  const selectedForRemove = useMemo(
    () => Array.from(selectedIds).filter((id) => assignedSets[level].has(id)),
    [selectedIds, assignedSets, level],
  );

  const alreadyInSelected = useMemo(
    () =>
      Array.from(selectedIds).filter((id) => assignedSets[level].has(id))
        .length,
    [selectedIds, assignedSets, level],
  );

  // handlers (footer)
  const handleAdd = async () => {
    if (!businessId) return;
    if (!levelDoc?._id)
      return toast.error(`Level L${level} not configured yet`);
    if (selectedForAdd.length === 0) return toast("Nothing to add");

    try {
      await updateStaffToLevel({
        levelId: levelDoc._id,
        businessId,
        staffIds: selectedForAdd,
        nextLevelTime: minutes,
      });
      toast.success(`Added ${selectedForAdd.length} staff to L${level}`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add staff");
    }
  };

  const handleRemove = async () => {
    if (!levelDoc?._id)
      return toast.error(`Level L${level} not configured yet`);
    if (selectedForRemove.length === 0) return toast("Nothing to remove");

    try {
      await removeStaff({
        levelId: levelDoc._id,
        staffIds: selectedForRemove,
      });
      toast.success(`Removed ${selectedForRemove.length} staff from L${level}`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove staff");
    }
  };

  const isSaving = updateStaffLoader || removeStaffLoader;

  // maps for preview panes
  const staffMap = useMemo(() => {
    const m = new Map<string, IHotelStaff>();
    for (const s of staffList) m.set(s._id, s);
    return m;
  }, [staffList]);

  const selectedObjects = Array.from(selectedIds)
    .map((id) => staffMap.get(id))
    .filter(Boolean) as IHotelStaff[];

  // current members of selected level
  const currentMembersObjects = (levelDoc?.staffIds ?? []).map((s) => ({
    _id: s._id,
    name: s.name,
    phone: s.phone,
  }));

  // === Current Members tools ===
  const toggleMemberRemove = (id: string) => {
    setMembersRemoveSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllMembers = () => {
    setMembersRemoveSet(new Set(currentMembersObjects.map((m) => m._id)));
  };

  const clearMembersSelection = () => setMembersRemoveSet(new Set());

  const handleRemoveSelectedMembers = async () => {
    if (!levelDoc?._id)
      return toast.error(`Level L${level} not configured yet`);
    const ids = Array.from(membersRemoveSet);
    if (ids.length === 0) return toast("No members selected");
    try {
      await removeStaff({ levelId: levelDoc._id, staffIds: ids });
      toast.success(
        `Removed ${ids.length} member${
          ids.length > 1 ? "s" : ""
        } from L${level}`,
      );
      setMembersRemoveSet(new Set());
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove selected members");
    }
  };

  const handleRemoveSingleMember = async (id: string) => {
    if (!levelDoc?._id)
      return toast.error(`Level L${level} not configured yet`);
    try {
      await removeStaff({ levelId: levelDoc._id, staffIds: [id] });
      toast.success("Removed from level");
      setMembersRemoveSet((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove");
    }
  };

  return (
    <section
      className={cn(
        "w-full max-w-5xl mx-auto",
        "max-h-[85vh] overflow-y-auto hide-scrollbar",
        "rounded-lg border bg-background p-4",
      )}
    >
      <div className="mb-4">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <AlertTriangle className="w-5 h-5" />
          Bulk Escalation — {mode === "add" ? "Add" : "Remove"}
        </div>
        <p className="text-sm text-muted-foreground">
          Search/select staff, choose a level, set time (for Add), then add or
          remove.
        </p>
      </div>

      {gettingLevels ? (
        <div className="grid gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-md bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Controls */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Selection</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Label htmlFor="search">Search staff</Label>
                <Input
                  id="search"
                  placeholder="Search by name or phone..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="mt-1"
                />
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllFiltered}
                  >
                    {mode === "add"
                      ? `Select All Eligible (${eligibleFilteredIds.length})`
                      : `Select All In L${level} (${eligibleFilteredIds.length})`}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearSelection}>
                    Clear
                  </Button>
                  <Badge variant="outline">Selected: {selectedIds.size}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                {/* Mode Switch */}
                <Label>Mode</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={mode === "add" ? "default" : "outline"}
                    onClick={() => {
                      setMode("add");
                      setSelectedIds(new Set());
                    }}
                    className={cn(mode === "add" && "ring-2 ring-primary")}
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant={mode === "remove" ? "default" : "outline"}
                    onClick={() => {
                      setMode("remove");
                      setSelectedIds(new Set());
                    }}
                    className={cn(mode === "remove" && "ring-2 ring-primary")}
                  >
                    Remove
                  </Button>
                </div>

                <Label className="mt-2">Level</Label>
                <div className="flex gap-2">
                  {[1, 2, 3].map((lv) => (
                    <Button
                      key={lv}
                      type="button"
                      variant={
                        level === (lv as 1 | 2 | 3) ? "default" : "outline"
                      }
                      onClick={() => {
                        setLevel(lv as 1 | 2 | 3);
                        setSelectedIds(new Set());
                        setMembersRemoveSet(new Set());
                      }}
                      className={cn(level === lv && "ring-2 ring-primary")}
                    >
                      L{lv}
                    </Button>
                  ))}
                </div>

                {/* Time only for Add */}
                <div className="mt-2">
                  <Label htmlFor="minutes">Escalation Time (minutes)</Label>
                  <Input
                    id="minutes"
                    type="number"
                    min={1}
                    max={60}
                    value={minutes}
                    onChange={(e) =>
                      setMinutes(
                        Math.max(1, Number.parseInt(e.target.value, 10) || 1),
                      )
                    }
                    className="mt-1"
                    disabled={mode === "remove"}
                  />
                </div>

                {/* Counters */}
                <div className="text-xs text-muted-foreground mt-2 space-y-1">
                  <div>
                    Already in L{level}:{" "}
                    <strong>{currentMembersObjects.length}</strong>
                  </div>
                  <div>
                    Selected in L{level}: <strong>{alreadyInSelected}</strong>
                  </div>
                  <div>
                    Will add to L{level}:{" "}
                    <strong>{selectedForAdd.length}</strong>
                  </div>
                  <div>
                    Will remove from L{level}:{" "}
                    <strong>{selectedForRemove.length}</strong>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details panes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Current members of selected level — with delete tools */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Current members of L{level}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllMembers}
                      disabled={currentMembersObjects.length === 0}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearMembersSelection}
                      disabled={membersRemoveSet.size === 0}
                    >
                      Clear
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleRemoveSelectedMembers}
                      disabled={
                        !levelDoc?._id ||
                        membersRemoveSet.size === 0 ||
                        isSaving
                      }
                      title={
                        membersRemoveSet.size
                          ? `Remove ${membersRemoveSet.size} selected`
                          : "Select members to remove"
                      }
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove Selected
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {currentMembersObjects.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No members in L{level} yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentMembersObjects.map((m) => {
                      const checked = membersRemoveSet.has(m._id);
                      return (
                        <div
                          key={m._id}
                          className={cn(
                            "rounded-md border p-2 text-xs flex items-center justify-between gap-2",
                            checked &&
                              "border-destructive ring-1 ring-destructive/30",
                          )}
                        >
                          <label className="flex items-center gap-2 flex-1 cursor-pointer">
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={checked}
                              onChange={() => toggleMemberRemove(m._id)}
                            />
                            <div>
                              <div className="font-medium">{m.name}</div>
                              <div className="text-muted-foreground">
                                {m.phone}
                              </div>
                            </div>
                          </label>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="shrink-0"
                            title="Remove this member"
                            onClick={() => handleRemoveSingleMember(m._id)}
                            disabled={!levelDoc?._id || isSaving}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected list preview (from the search list) */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Selected ({selectedObjects.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedObjects.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    {mode === "add"
                      ? `Choose staff from the list below. Staff already in L${level} are disabled.`
                      : `Choose staff from the list below. Only staff in L${level} are selectable.`}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedObjects.map((s) => (
                      <div
                        key={s._id}
                        className="rounded-md border p-2 text-xs"
                      >
                        <div className="font-medium">{s.name}</div>
                        <div className="text-muted-foreground">{s.phone}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Selectable staff list */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" /> All Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filtered.map((s) => {
                  const inLevel = assignedSets[level].has(s._id);
                  const checked = selectedIds.has(s._id);
                  const disabled = mode === "add" ? inLevel : !inLevel;

                  return (
                    <label
                      key={s._id}
                      className={cn(
                        "flex items-center justify-between rounded-md border p-3 cursor-pointer transition",
                        checked
                          ? "border-primary ring-2 ring-primary/30"
                          : "hover:bg-muted/40",
                        disabled && "opacity-60 cursor-not-allowed bg-muted/50",
                      )}
                      title={
                        disabled
                          ? mode === "add"
                            ? `Already in Level ${level}`
                            : `Not in Level ${level}`
                          : mode === "add"
                            ? "Select to add"
                            : "Select to remove"
                      }
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggleSelect(s._id, disabled)}
                          className="h-4 w-4"
                        />
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {s.name}
                            {inLevel && (
                              <Badge variant="secondary" className="text-xs">
                                In L{level}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {s.phone}
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No staff match your search.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Separator />
          <div className="h-16" />
        </div>
      )}

      <AdvancedBottomButton
        fixed
        maxWidth="36rem"
        buttons={[
          {
            text: "Back",
            isBackButton: true,
            onClick: onClose,
            className: "pl-3 rounded-md",
          },
          {
            text: `Remove from L${level}`,
            onClick: handleRemove,
            className: "pl-3 rounded-md",
            disable:
              isSaving || selectedForRemove.length === 0 || gettingLevels,
          },
          {
            text: `Add to L${level}`,
            onClick: handleAdd,
            className: "pl-3 rounded-md",
            disable: isSaving || selectedForAdd.length === 0 || gettingLevels,
          },
        ]}
      />
    </section>
  );
}
