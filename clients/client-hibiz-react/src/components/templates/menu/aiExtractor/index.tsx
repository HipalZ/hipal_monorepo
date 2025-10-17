import { useChildCategories } from "../../../../hooks/useCategory";
import { postDishData } from "../../../../hooks/useDish";
import { useRefreshGuard } from "./RefreshGaurd";
import { FileUpload } from "./file-upload";
import { CategoryLoader, DishLoader, ExtractLoader } from "./Loaders";
import { MenuPreview } from "./menu-preview";
import { SuccessModal } from "./SuccessModal";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Sparkles,
  AlertCircle,
  FileText,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useMenuStore } from "@/lib/menu/store";
import {
  normalizeToCategories,
  mergeCategories,
  fileToBase64,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { CanonicalDishType, PortionType } from "@/lib/menu/types";
import { useSaveAiCategory } from "../../../../hooks/useCategory";
import { useParams } from "react-router-dom";

const API_KEY = "AIzaSyC8UMDIXpTc4-CNSUL0k_tdQP1b1EROWz4";

const toCanonicalDishTypes = (raw: string): CanonicalDishType[] => {
  const key = String(raw || "")
    .trim()
    .toLowerCase();
  const map: Record<string, CanonicalDishType> = {
    veg: "VEG",
    vegetarian: "VEG",
    paneer: "VEG",
    "non veg": "NON_VEG",
    "non-veg": "NON_VEG",
    nonveg: "NON_VEG",
    non_veg: "NON_VEG",
    chicken: "NON_VEG",
    mutton: "NON_VEG",
    fish: "NON_VEG",
    egg: "EGG",
    eggetarian: "EGG",
    vegan: "VEGAN",
    "plant-based": "VEGAN",
    alcohol: "ALCOHOL",
    alcoholic: "ALCOHOL",
    non_alcoholic: "NON_ALCOHOL",
    beer: "ALCOHOL",
    wine: "ALCOHOL",
    "non alcohol": "NON_ALCOHOL",
    mocktail: "NON_ALCOHOL",
    juice: "NON_ALCOHOL",
    "gluten free": "GLUTEN_FREE",
    glutenfree: "GLUTEN_FREE",
  };
  return map[key] ? [map[key]] : ["MIX"];
};

const autoDescription = (dishName: string, catName?: string) => {
  const base = `${dishName} crafted with balanced flavors${
    catName ? ` in ${catName}` : ""
  }.`;
  if (base.length < 50) return base.padEnd(50, ".");
  if (base.length > 100) return base.slice(0, 100);
  return base;
};

const buildChildCategoryName = (categoryName: string, subName?: string) =>
  (subName && subName.trim()) || categoryName;

export default function AIMenuExtractorPage() {
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { processingPhase: phase, setProcessingPhase: setPhase } =
    useMenuStore();

  const [successOpen, setSuccessOpen] = useState(false);
  const [createdCounts, setCreatedCounts] = useState({
    categories: 0,
    dishes: 0,
  });
  const { mutate: createCategory } = useSaveAiCategory();
  const { categories: fetchedCats, refetch } = useChildCategories();
  const { menuId, businessId } = useParams<{
    menuId: string;
    businessId: string;
  }>();

  const categories = useMenuStore((state) => state.categories);
  const setCategories = useMenuStore((state) => state.setCategories);
  const isEditing = useMenuStore((state) => state.isEditing);
  const setEditing = useMenuStore((state) => state.setEditing);

  useRefreshGuard(
    phase === "review" ||
      phase === "creatingCategories" ||
      phase === "creatingDishes" ||
      phase === "done" ||
      phase === "extracting" ||
      phase === "idle",
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    const maxFiles = 3;
    if (!selected) return;

    if (selected.length > maxFiles) {
      setError(`Please select no more than ${maxFiles} files.`);
      setFiles([]);
    } else {
      setFiles(Array.from(selected));
      setError(null);
    }
  };

  const handleExtract = async () => {
    if (files.length === 0) {
      setError("Please select at least one file first.");
      return;
    }
    if (!GOOGLE_AI_API_KEY) {
      setError("API Key is not set. Add your key.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPhase("extracting");

    try {
      const results: any[] = [];

      for (const file of files) {
        const base64 = await fileToBase64(file);
        const prompt =
          "Extract the menu grouped by category and subcategory (if shown). Always return subcategories; if the image has none, create a single subcategory named 'General'. For each dish, include dishName, price (number), and dishType: one of 'veg','nonveg','vegan','egg','alcoholic','nonalcoholic'. Return ONLY JSON with this exact schema: [{category, subcategories:[{subcategory, dishes:[{dishName, price, dishType}]}]}].";

        const payload = {
          contents: [
            {
              parts: [
                { text: prompt },
                { inlineData: { mimeType: file.type, data: base64 } },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  category: { type: "STRING" },
                  subcategories: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        subcategory: { type: "STRING" },
                        dishes: {
                          type: "ARRAY",
                          items: {
                            type: "OBJECT",
                            properties: {
                              dishName: { type: "STRING" },
                              price: { type: "NUMBER" },
                              dishType: { type: "STRING" },
                            },
                            propertyOrdering: ["dishName", "price", "dishType"],
                          },
                        },
                      },
                      propertyOrdering: ["subcategory", "dishes"],
                    },
                  },
                },
                propertyOrdering: ["category", "subcategories"],
              },
            },
          },
        } as const;

        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          let detailMessage = "";
          try {
            const detail = await res.json();
            detailMessage = detail?.error?.message || String(res.status);
          } catch {
            detailMessage = String(res.status);
          }
          throw new Error(`API error for ${file.name}: ${detailMessage}`);
        }

        const json = await res.json();
        const jsonText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!jsonText) throw new Error("No JSON returned.");

        const raw = JSON.parse(jsonText);
        const normalized = normalizeToCategories(raw);
        results.push(...normalized);
      }

      const merged = mergeCategories(results);
      setCategories(merged);
      setPhase("review");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Extraction failed");
      setPhase("idle");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = useCallback(async () => {
    try {
      // --- 0) Guard ---
      if (!Array.isArray(categories) || categories.length === 0) return;

      // --- 1) Build desired child-category names from subcategories (preferred) ---
      // If a category has no subcategories or an empty array, fall back to the parent category name once.
      const desiredNames = new Set<string>();
      for (const cat of categories) {
        const subs = Array.isArray(cat.subcategories) ? cat.subcategories : [];
        if (subs.length > 0) {
          for (const sub of subs) {
            const childName = buildChildCategoryName(
              cat.name,
              sub?.name,
            ).trim();
            if (childName) desiredNames.add(childName);
          }
        } else {
          const fallback = (cat?.name || "").trim();
          if (fallback) desiredNames.add(fallback);
        }
      }

      // --- 1a) Remove names that already exist on the server (avoid duplicate create) ---
      const norm = (s: string) => s.trim().toLowerCase();
      const existingNames = new Set<string>(
        (fetchedCats ?? []).map((c) => norm(c.name)),
      );
      const namesToCreate = Array.from(desiredNames).filter(
        (n) => !existingNames.has(norm(n)),
      );

      // --- 2) Create missing CHILD categories (with menuId & businessId) ---
      setPhase("creatingCategories");
      let createdCatCount = 0;

      for (const name of namesToCreate) {
        const commonPayload = {
          name,
          hierarchy: "CHILD" as const,
          menuId, // <- make sure these are defined in your component scope
          businessId, // <-
        };
        await createCategory(commonPayload);
        createdCatCount++;
      }

      // --- 3) Refetch categories and build a fresh name → _id map ---
      const refetchResult = await refetch(); // react-query v5 returns { data, ... }
      const latestCats = refetchResult?.data ?? fetchedCats ?? [];
      const byName: Record<string, string> = {};
      for (const item of latestCats) {
        byName[norm(item.name)] = item._id;
      }

      const catNameToId = (nm: string | undefined | null) => {
        if (!nm) return undefined;
        return byName[norm(nm)];
      };

      // --- 4) Create dishes, linking to the resolved child category id ---
      setPhase("creatingDishes");
      let createdDishCount = 0;

      for (const cat of categories) {
        const subs = Array.isArray(cat.subcategories) ? cat.subcategories : [];

        // If no subcategories at all, treat it like one implicit bucket with the parent name.
        const subBuckets =
          subs.length > 0 ? subs : [{ name: cat.name, dishes: [] }];

        for (const sub of subBuckets) {
          const childName = buildChildCategoryName(cat.name, sub?.name);
          const childId = catNameToId(childName) || catNameToId(cat.name);
          if (!childId) {
            // If we still can't resolve a category, skip this sub's dishes.
            // (Could also log or collect for a retry UI)
            continue;
          }

          const dishes = Array.isArray(sub?.dishes) ? sub!.dishes : [];
          for (const d of dishes) {
            const dishTypes = toCanonicalDishTypes(d.dishType);
            const price =
              typeof d.price === "number" ? d.price : Number(d.price ?? 0);

            const portions: PortionType[] = [
              {
                name: "Regular",
                price,
                default: true,
                portionTypes: dishTypes,
              },
            ];

            const payload = {
              name: d.dishName,
              price,
              visibility: true,
              availability: true,
              dishTypes,
              description: autoDescription(d.dishName, childName),
              categoryIds: [childId],
              portions,
              menuId: menuId, // <- ensure these are defined in your component scope
              businessId: businessId, // <-
            };

            await postDishData(payload);
            createdDishCount++;
          }
        }
      }

      setCreatedCounts({
        categories: createdCatCount,
        dishes: createdDishCount,
      });
      setPhase("done");
      setSuccessOpen(true);
    } catch (e) {
      console.error("Proceed failed:", e);
      // You can surface a toast here if you have one in scope
      setPhase("review"); // fall back to review so user can retry
    }
    // IMPORTANT: include all ids and funcs in deps so the latest values are used.
  }, [
    categories,
    fetchedCats,
    refetch,
    createCategory,
    postDishData,
    menuId,
    businessId,
    setPhase,
  ]);

  const handleReset = () => {
    setFiles([]);
    setCategories([]);
    setPhase("idle");
    setError(null);
  };

  const isBusy =
    phase === "extracting" ||
    phase === "creatingCategories" ||
    phase === "creatingDishes";

  const steps = [
    {
      id: 1,
      name: "Upload",
      icon: Upload,
      status: files.length > 0 ? "complete" : "current",
    },
    {
      id: 2,
      name: "Extract",
      icon: Sparkles,
      status:
        phase === "extracting"
          ? "current"
          : phase === "review" ||
              phase === "creatingCategories" ||
              phase === "creatingDishes" ||
              phase === "done"
            ? "complete"
            : "upcoming",
    },
    {
      id: 3,
      name: "Review",
      icon: FileText,
      status:
        phase === "review"
          ? "current"
          : phase === "creatingCategories" ||
              phase === "creatingDishes" ||
              phase === "done"
            ? "complete"
            : "upcoming",
    },
    {
      id: 4,
      name: "Create",
      icon: CheckCircle2,
      status:
        phase === "creatingCategories" || phase === "creatingDishes"
          ? "current"
          : phase === "done"
            ? "complete"
            : "upcoming",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="w-full border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className="relative"
                animate={{ rotate: [0, 360] }}
                transition={{
                  duration: 20,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-20" />
                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  AI Menu Extractor
                </h1>
                <p className="text-sm text-slate-600 mt-0.5">
                  Transform your menu images into structured data instantly
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {categories.length > 0 && (
                <Button
                  onClick={() => setEditing(!isEditing)}
                  disabled={isBusy}
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                >
                  {isEditing ? "Done Editing" : "Edit Menu"}
                </Button>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center gap-2">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: step.status === "current" ? 1.1 : 1,
                    }}
                    className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                      step.status === "complete"
                        ? "bg-blue-500 border-blue-500"
                        : step.status === "current"
                          ? "bg-white border-blue-500"
                          : "bg-white border-slate-300"
                    }`}
                  >
                    <step.icon
                      className={`w-5 h-5 ${
                        step.status === "complete"
                          ? "text-white"
                          : step.status === "current"
                            ? "text-blue-500"
                            : "text-slate-400"
                      }`}
                    />
                  </motion.div>
                  <span
                    className={`text-sm font-medium ${
                      step.status === "complete" || step.status === "current"
                        ? "text-slate-900"
                        : "text-slate-400"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <ArrowRight
                    className={`w-4 h-4 mx-3 ${
                      step.status === "complete"
                        ? "text-blue-500"
                        : "text-slate-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Section */}
        <AnimatePresence mode="wait">
          {(phase === "idle" || phase === "extracting") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">
                    Upload Menu Files
                  </h2>
                  <p className="text-sm text-slate-600">
                    Upload up to 3 images (PNG, JPG, JPEG) of your menu
                  </p>
                </div>
                <FileUpload files={files} onFileChange={handleFileChange} />

                {files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 flex justify-end"
                  >
                    <Button
                      onClick={handleExtract}
                      disabled={isLoading || isBusy}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      {phase === "extracting"
                        ? "Extracting..."
                        : "Extract Menu with Hipalz AI"}
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loaders - Full viewport */}
        <AnimatePresence mode="wait">
          {phase === "extracting" && <ExtractLoader />}
          {phase === "creatingCategories" && <CategoryLoader />}
          {phase === "creatingDishes" && <DishLoader />}
        </AnimatePresence>

        {/* Menu Preview */}
        {phase === "review" && categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                  Review Extracted Menu
                </h2>
                <p className="text-sm text-slate-600">
                  Review and edit your menu before creating
                </p>
              </div>
            </div>

            <MenuPreview categories={categories} isEditing={isEditing} />

            <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-200">
              <Button variant="outline" onClick={handleReset} disabled={isBusy}>
                Start Over
              </Button>
              <Button
                onClick={handleProceed}
                disabled={isBusy || categories.length === 0}
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Proceed & Create Menu
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Success Modal */}
      <SuccessModal
        open={successOpen}
        onClose={() => {
          setSuccessOpen(false);
          handleReset();
        }}
        categoriesCount={createdCounts.categories}
        dishesCount={createdCounts.dishes}
      />
    </div>
  );
}
