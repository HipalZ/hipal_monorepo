import { useState, useMemo, memo } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Papa from "papaparse";
import toast from "react-hot-toast";

import useMenuPageStore, {
  type Choice,
} from "@/components/store/useMenuStorage";
import {
  DishTypeEnum,
  type DishTypeEnumType,
} from "@hi/db-models/src/validators";

// shadcn
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiRpc } from "@hi/common";
import { useCategoryStore } from "@/components/store/useCategoryStore";

type CsvRow = {
  addonName?: string;
  choiceName?: string;
  choicePrice?: string;
  choiceDishType?: string;
  choiceType?: string;
  addOnMaxQuantity?: string;
  compulsory?: string;
};

type GroupedAddon = {
  id: string; // local id for preview/removal
  name: string;
  choiceType: "NUMBER" | "CHECKBOX";
  addOnMaxQuantity: number;
  compulsory: number;
  choices: Choice[];
};

// ---- Helpers ----

const parseDishTypes = (raw?: string): DishTypeEnumType[] => {
  if (!raw) return [];
  const parts = raw
    .split(",")
    .map((p) => p.trim().toUpperCase())
    .filter(Boolean);

  const validEnumValues = Object.values(DishTypeEnum) as DishTypeEnumType[];

  const mapped: DishTypeEnumType[] = [];
  for (const p of parts) {
    const match = validEnumValues.find((e) => e.toUpperCase() === p);
    if (match) mapped.push(match);
  }

  return Array.from(new Set(mapped));
};

const parseNumberOr = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) return fallback;
  return num;
};

const normalizeChoiceType = (value?: string): "NUMBER" | "CHECKBOX" => {
  const v = (value || "").trim().toUpperCase();
  if (v === "NUMBER") return "NUMBER";
  return "CHECKBOX";
};

// normalize addon key: name + type (case-insensitive)
const makeAddonKey = (name: string, type: "NUMBER" | "CHECKBOX") =>
  `${name.trim().toLowerCase()}|${type}`;

// normalize choice key: name + price + sorted dish types
const makeChoiceKey = (choice: {
  name: string;
  price?: number | null;
  choiceDishType?: DishTypeEnumType[] | null;
}) => {
  const name = (choice.name || "").trim().toLowerCase();
  const price = choice.price ?? 0;
  const types = Array.isArray(choice.choiceDishType)
    ? [...choice.choiceDishType].sort().join(",")
    : "";
  return `${name}|${price}|${types}`;
};

const MemoBulkAddonCsvUpload = () => {
  const { businessId, menuId } = useParams<{
    businessId?: string;
    menuId: string;
  }>();

  const queryClient = useQueryClient();
  const recommendationIds = useMenuPageStore((s) => s.recommendationIds);
  const setOpenMenu = useMenuPageStore((s) => s.setOpenMenu);
  const resetStore = useMenuPageStore((s) => s.resetStore);
  const addOns = useCategoryStore((s) => s.addOns);

  const [fileName, setFileName] = useState<string>("");
  const [totalRows, setTotalRows] = useState(0);
  const [skippedRows, setSkippedRows] = useState<number>(0);
  const [createdAddons, setCreatedAddons] = useState(0);
  const [skippedAddons, setSkippedAddons] = useState(0);

  const [groupedAddons, setGroupedAddons] = useState<GroupedAddon[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isBusy = isProcessing || isSaving;

  // ---- build map of existing addons + their choice signatures ----
  const existingAddonChoicesMap = useMemo(() => {
    const map = new Map<string, Set<string>>();

    (addOns ?? []).forEach((addon: any) => {
      if (!addon?.name || !addon?.choiceType) return;

      const choiceType = normalizeChoiceType(addon.choiceType);
      const key = makeAddonKey(addon.name, choiceType);

      const choiceSet = new Set<string>();
      (addon.choices ?? []).forEach((c: any) => {
        if (!c?.name) return;
        choiceSet.add(
          makeChoiceKey({
            name: c.name,
            price: c.price,
            choiceDishType: c.choiceDishType,
          }),
        );
      });

      map.set(key, choiceSet);
    });

    return map;
  }, [addOns]);

  // ---- template download ----
  const handleDownloadTemplate = () => {
    const csvContent = [
      "addonName,choiceName,choicePrice,choiceDishType,choiceType,addOnMaxQuantity,compulsory",
      "Pizza Toppings,Extra Cheese,30,VEG,CHECKBOX,3,0",
      "Pizza Toppings,Jalapenos,20,VEG,CHECKBOX,3,0",
      "Sides,Coke,0,VEG,NUMBER,1,0",
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "addon_bulk_upload_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ---- file change ----
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file.");
      return;
    }

    setFileName(file.name);
    setTotalRows(0);
    setCreatedAddons(0);
    setSkippedRows(0);
    setSkippedAddons(0);
    setGroupedAddons([]);

    parseCsv(file);
  };

  // ---- CSV parsing → preview data ----
  const parseCsv = (file: File) => {
    setIsProcessing(true);

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsProcessing(false);

        const rows = results.data || [];
        setTotalRows(rows.length);

        if (!rows.length) {
          toast.error("CSV is empty.");
          return;
        }

        const byKey: Record<string, GroupedAddon> = {};
        let skippedRowCount = 0;

        for (const row of rows) {
          const addonName = row.addonName?.trim();
          const choiceName = row.choiceName?.trim();
          const dishTypes = parseDishTypes(row.choiceDishType);

          // Important fields missing → skip row
          if (!addonName || !choiceName || dishTypes.length === 0) {
            skippedRowCount += 1;
            continue;
          }

          const choicePrice = parseNumberOr(row.choicePrice, 0);
          const choiceType = normalizeChoiceType(row.choiceType);
          const key = makeAddonKey(addonName, choiceType);

          const choice: Choice = {
            uuid: crypto.randomUUID(),
            name: choiceName,
            price: choicePrice,
            description: "",
            visibility: true,
            availability: true,
            choiceMaxQuantity: 0, // will set later
            choiceDishType: dishTypes,
          };

          if (!byKey[key]) {
            const addOnMaxQuantity = parseNumberOr(row.addOnMaxQuantity, 0);
            const compulsory = parseNumberOr(row.compulsory, 0);

            byKey[key] = {
              id: crypto.randomUUID(),
              name: addonName,
              choiceType,
              addOnMaxQuantity,
              compulsory,
              choices: [choice],
            };
          } else {
            byKey[key].choices.push(choice);
          }
        }

        setSkippedRows(skippedRowCount);

        const rawAddonsArray = Object.values(byKey);

        if (rawAddonsArray.length === 0) {
          toast.error("No valid rows found. Check required columns.");
          return;
        }

        // ---- NEW: club vs existing addOns – drop exact dup choices ----
        const finalAddons: GroupedAddon[] = [];
        let skippedBecauseExisting = 0;

        for (const addon of rawAddonsArray) {
          const key = makeAddonKey(addon.name, addon.choiceType);
          const existingChoiceSet = existingAddonChoicesMap.get(key);

          // No existing addon with this name+type → take as is
          if (!existingChoiceSet) {
            finalAddons.push(addon);
            continue;
          }

          // Filter out choices that already exist on that addon
          const uniqueChoices = addon.choices.filter((c) => {
            const sig = makeChoiceKey({
              name: c.name,
              price: c.price,
              choiceDishType: c.choiceDishType,
            });
            return !existingChoiceSet.has(sig);
          });

          if (uniqueChoices.length === 0) {
            // Entire add-on is duplicate of existing → skip
            skippedBecauseExisting += 1;
            continue;
          }

          finalAddons.push({
            ...addon,
            choices: uniqueChoices,
          });
        }

        if (skippedBecauseExisting > 0) {
          toast.success(
            `Skipped ${skippedBecauseExisting} add-ons already present with same choices.`,
          );
        }

        if (finalAddons.length === 0) {
          toast.error(
            "All rows map to existing add-ons with same choices. Nothing new to add.",
          );
          setGroupedAddons([]);
          return;
        }

        setGroupedAddons(finalAddons);
        toast.success(
          `Parsed ${finalAddons.length} add-ons. Review and save when ready.`,
        );
      },
      error: (err) => {
        setIsProcessing(false);
        console.error(err);
        toast.error("Failed to parse CSV.");
      },
    });
  };

  // ---- remove single addon from preview ----
  const handleRemoveAddon = (id: string) => {
    setGroupedAddons((prev) => prev.filter((addon) => addon.id !== id));
  };

  // ---- clear all preview ----
  const handleClearAll = () => {
    setGroupedAddons([]);
    setCreatedAddons(0);
    setSkippedAddons(0);
  };

  // ---- save all addons from preview ----
  const handleSaveAll = async () => {
    if (!menuId) {
      toast.error("Missing menuId in URL.");
      return;
    }

    if (groupedAddons.length === 0) {
      toast.error("No add-ons to save. Upload a CSV first.");
      return;
    }

    setIsSaving(true);
    let created = 0;
    let skippedAddonsLocal = 0;

    for (const addon of groupedAddons) {
      if (!addon.choices.length) {
        skippedAddonsLocal += 1;
        continue;
      }

      const addOnMaxQuantity =
        addon.addOnMaxQuantity && addon.addOnMaxQuantity > 0
          ? addon.addOnMaxQuantity
          : addon.choices.length;

      const payloadChoices = addon.choices.map((c) => ({
        ...c,
        choiceMaxQuantity: addOnMaxQuantity,
      }));

      const payload = {
        businessId: businessId || "",
        name: addon.name,
        dishIds: recommendationIds ?? [],
        choices: payloadChoices,
        choiceType: addon.choiceType,
        addOnMaxQuantity,
        compulsory: addon.compulsory ?? 0,
        menuId,
      };

      try {
        const response = await apiRpc.addons.$post({
          json: payload,
        });
        const data = await response.json();

        if (data.err) {
          console.error("Failed to create addon:", addon.name, data.message);
          skippedAddonsLocal += 1;
        } else {
          created += 1;
        }
      } catch (err) {
        console.error("Failed to create addon:", addon.name, err);
        skippedAddonsLocal += 1;
      }
    }

    setIsSaving(false);
    setCreatedAddons(created);
    setSkippedAddons(skippedAddonsLocal);

    // 👉 After all add-ons are added, invalidate & close ONCE
    if (created > 0) {
      toast.success(`Created ${created} add-ons.`);
      await queryClient.invalidateQueries({ queryKey: ["getAllAddOn"] });
      resetStore();
      setOpenMenu(false);
    }
    if (skippedAddonsLocal > 0) {
      toast.error(`Failed to create ${skippedAddonsLocal} add-ons.`);
    }
  };

  return (
    <Card className="mx-4 my-4 max-w-3xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Bulk upload add-ons (CSV)
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Upload + Download template */}
        <div className="space-y-2">
          <Label className="font-semibold">Step 1: Upload CSV</Label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isBusy}
              className="sm:max-w-xs"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadTemplate}
            >
              Download bulk upload
            </Button>
          </div>
          {fileName && (
            <p className="mt-1 text-xs text-muted-foreground">
              Selected file: <span className="font-semibold">{fileName}</span>
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Required columns:{" "}
            <span className="font-semibold">
              addonName, choiceName, choiceDishType
            </span>
            . Optional: choicePrice, choiceType, addOnMaxQuantity, compulsory.
          </p>
        </div>

        {/* Stats */}
        {(totalRows > 0 || skippedRows > 0) && (
          <div className="mt-2 text-xs space-y-1">
            <p>Total CSV rows: {totalRows}</p>
            <p>Skipped rows (missing important fields): {skippedRows}</p>
          </div>
        )}

        {/* Preview section */}
        {groupedAddons.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">
                Step 2: Preview add-ons ({groupedAddons.length})
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
              >
                Clear all
              </Button>
            </div>

            <div className="space-y-3 max-h-[26rem] overflow-y-auto pr-1">
              {groupedAddons.map((addon) => (
                <Card key={addon.id} className="border border-gray-200">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold">{addon.name}</h4>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline">{addon.choiceType}</Badge>
                        <span>
                          Choices:{" "}
                          <span className="font-semibold">
                            {addon.choices.length}
                          </span>
                        </span>
                        <span>
                          Max per add-on:{" "}
                          <span className="font-semibold">
                            {addon.addOnMaxQuantity || addon.choices.length}
                          </span>
                        </span>
                        <span>
                          Min required:{" "}
                          <span className="font-semibold">
                            {addon.compulsory ?? 0}
                          </span>
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAddon(addon.id)}
                    >
                      Remove
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1 text-xs">
                      {addon.choices.map((choice) => (
                        <div
                          key={choice.uuid}
                          className="flex flex-wrap items-center justify-between rounded-md bg-muted/40 px-2 py-1"
                        >
                          <span className="font-semibold truncate max-w-[10rem]">
                            {choice.name}
                          </span>
                          <span className="text-muted-foreground">
                            {choice.price ? `₹${choice.price}` : "₹0"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {Array.isArray(choice.choiceDishType)
                              ? choice.choiceDishType.join(", ")
                              : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Save button */}
            <div className="flex justify-end pt-2">
              <Button
                type="button"
                onClick={handleSaveAll}
                disabled={isBusy || groupedAddons.length === 0}
              >
                {isSaving ? "Saving..." : "Save all add-ons"}
              </Button>
            </div>

            {(createdAddons > 0 || skippedAddons > 0) && (
              <div className="mt-1 text-xs space-y-1">
                <p>Created add-ons: {createdAddons}</p>
                <p>Failed add-ons: {skippedAddons}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const BulkAddonCsvUpload = memo(MemoBulkAddonCsvUpload);
export default BulkAddonCsvUpload;
