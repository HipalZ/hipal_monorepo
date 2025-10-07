import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Users, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useFetchLevels,
  useUpdateStaffToHotelLevel,
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
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const { levelsData = [], gettingLevels } = useFetchLevels();
  const { updateStaffToLevel, updateStaffLoader } =
    useUpdateStaffToHotelLevel();

  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [minutes, setMinutes] = useState<number>(5);

  const levelDoc = useMemo(
    () => levelsData.find((l) => l.level === level),
    [levelsData, level],
  ) as IHotelStaffLevel | undefined;

  const levelMinutes = useMemo(() => {
    const raw =
      (levelDoc as any)?.nextLevelTime ??
      (levelDoc as any)?.nextLevelDelayMinutes;
    return Number.isFinite(raw) ? Number(raw) : undefined;
  }, [levelDoc]);

  useEffect(() => {
    if (typeof levelMinutes === "number") {
      setMinutes(levelMinutes);
    } else {
      setMinutes(5);
    }
  }, [levelMinutes, level]);

  const assignedSets = useMemo(() => {
    const map: Record<1 | 2 | 3, Set<string>> = {
      1: new Set(),
      2: new Set(),
      3: new Set(),
    };
    for (const lvl of levelsData as IHotelStaffLevel[]) {
      const L = (lvl.level as 1 | 2 | 3) ?? 1;
      for (const s of lvl.staffIds ?? []) {
        const id = typeof s === "string" ? s : s._id;
        if (id) map[L].add(id);
      }
    }
    return map;
  }, [levelsData]);

  const getRole = (s: IHotelStaff) =>
    s.customRole?.[0]?.role?.trim() || "Unassigned";

  const roleIndex = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of staffList) {
      const r = getRole(s);
      map.set(r, (map.get(r) || 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [staffList]);

  const slug = (s: string) =>
    s
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  const searchFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return staffList;
    return staffList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.phone ?? "").toLowerCase().includes(q),
    );
  }, [query, staffList]);

  const filtered = useMemo(() => {
    if (roleFilter === "ALL") return searchFiltered;
    return searchFiltered.filter((s) => getRole(s) === roleFilter);
  }, [searchFiltered, roleFilter]);

  const groupedByRole = useMemo(() => {
    const map = new Map<string, IHotelStaff[]>();
    for (const s of filtered) {
      const r = getRole(s);
      if (!map.has(r)) map.set(r, []);
      map.get(r)!.push(s);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const eligibleFilteredIds = useMemo(
    () =>
      filtered.map((s) => s._id).filter((id) => !assignedSets[level].has(id)),
    [filtered, assignedSets, level],
  );

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

  const selectedForAdd = useMemo(
    () => Array.from(selectedIds).filter((id) => !assignedSets[level].has(id)),
    [selectedIds, assignedSets, level],
  );

  const alreadyInSelected = useMemo(
    () =>
      Array.from(selectedIds).filter((id) => assignedSets[level].has(id))
        .length,
    [selectedIds, assignedSets, level],
  );

  const staffMap = useMemo(() => {
    const m = new Map<string, IHotelStaff>();
    for (const s of staffList) m.set(s._id, s);
    return m;
  }, [staffList]);

  const selectedObjects = Array.from(selectedIds)
    .map((id) => staffMap.get(id))
    .filter(Boolean) as IHotelStaff[];

  const currentMembersObjects =
    (levelDoc?.staffIds ?? []).map((s: any) => ({
      _id: typeof s === "string" ? s : s._id,
      name: typeof s === "string" ? "" : s.name,
      phone: typeof s === "string" ? "" : s.phone,
    })) ?? [];

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

  const isSaving = updateStaffLoader;

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
          Bulk Escalation — Add Members
        </div>
        <p className="text-sm text-muted-foreground">
          Search/select staff, choose a level, set the escalation time
          (minutes), then add.
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
                    Select All Eligible ({eligibleFilteredIds.length})
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearSelection}>
                    Clear
                  </Button>
                  <Badge variant="outline">Selected: {selectedIds.size}</Badge>
                </div>
              </div>

              <div className="">
                <Label className="">Level</Label>
                <div className="flex gap-2 mt-1">
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
                      }}
                      className={cn(level === lv && "ring-2 ring-primary")}
                    >
                      L{lv}
                    </Button>
                  ))}
                </div>

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
                  />
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {typeof levelMinutes === "number"
                      ? `Loaded from L${level}: ${levelMinutes} min`
                      : `No saved time for L${level} yet. Using 5 min default.`}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground mt-2 space-y-1">
                  <div>
                    Already in L{level}:{" "}
                    <strong>{currentMembersObjects.length}</strong>
                  </div>
                  <div>
                    Selected already in L{level}:{" "}
                    <strong>{alreadyInSelected}</strong>
                  </div>
                  <div>
                    Will add to L{level}:{" "}
                    <strong>{selectedForAdd.length}</strong>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Current members of L{level}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {currentMembersObjects.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No members in L{level} yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentMembersObjects.map((m) => (
                      <div
                        key={m._id}
                        className="rounded-md border p-2 text-xs"
                      >
                        <div className="font-medium">
                          {m.name || "(Unnamed)"}{" "}
                        </div>
                        <div className="text-muted-foreground">{m.phone}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Selected ({selectedObjects.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedObjects.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Choose staff from the list below. Staff already in L{level}{" "}
                    are disabled.
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" /> All Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 overflow-x-auto p-2 mb-3 border-b">
                <Button
                  variant={roleFilter === "ALL" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRoleFilter("ALL")}
                  className={cn(roleFilter === "ALL" && "ring-2 ring-primary")}
                >
                  All{" "}
                  <Badge
                    variant={roleFilter === "ALL" ? "default" : "outline"}
                    className="ml-2"
                  >
                    {staffList.length}
                  </Badge>
                </Button>

                {roleIndex.map(([role, count]) => (
                  <Button
                    key={role}
                    variant={roleFilter === role ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRoleFilter(role)}
                    className={cn(roleFilter === role && "ring-2 ring-primary")}
                  >
                    {role}{" "}
                    <Badge
                      variant={roleFilter === role ? "default" : "outline"}
                      className="ml-2"
                    >
                      {count}
                    </Badge>
                  </Button>
                ))}
              </div>

              {groupedByRole.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No staff match your search.
                </div>
              ) : (
                <div className="space-y-6">
                  {groupedByRole.map(([role, people]) => (
                    <section
                      key={role}
                      id={`role-${slug(role)}`}
                      className="space-y-2"
                    >
                      <h3 className="text-sm font-semibold tracking-wide">
                        {role}{" "}
                        <span className="text-muted-foreground">
                          ({people.length})
                        </span>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {people.map((s) => {
                          const inLevel = assignedSets[level].has(s._id);
                          const checked = selectedIds.has(s._id);
                          const disabled = inLevel;
                          const staffRole = getRole(s);

                          return (
                            <label
                              key={s._id}
                              className={cn(
                                "flex items-center justify-between rounded-md border p-3 cursor-pointer transition",
                                checked
                                  ? "border-primary ring-2 ring-primary/30"
                                  : "hover:bg-muted/40",
                                disabled &&
                                  "opacity-60 cursor-not-allowed bg-muted/50",
                              )}
                              title={
                                disabled
                                  ? `Already in Level ${level}`
                                  : "Select to add"
                              }
                            >
                              <div className="flex gap-3">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={disabled}
                                  onChange={() => toggleSelect(s._id, disabled)}
                                  className="h-4 w-4"
                                />
                                <div>
                                  <div className="font-medium flex flex-wrap items-center gap-2">
                                    {s.name}
                                    {inLevel && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        In L{level}
                                      </Badge>
                                    )}
                                    {staffRole && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {staffRole}
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
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />
          <div className="h-16" />
        </div>
      )}

      <AdvancedBottomButton
        fixed={true}
        maxWidth="30rem"
        buttons={[
          {
            text: "Back",
            isBackButton: true,
            onClick: onClose,
            className: "pl-3 rounded-md",
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
