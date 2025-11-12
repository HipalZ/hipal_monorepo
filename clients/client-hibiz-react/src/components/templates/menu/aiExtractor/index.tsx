import AdvancedBottomButton from '@/components/atom/bottomButton/advancedBottomButton';
import { ConfirmProceedModal } from '@/components/templates/menu/aiExtractor/ConfirmaionModal';
import { FileUpload } from '@/components/templates/menu/aiExtractor/file-upload';
import { CategoryLoader, DishLoader, ExtractLoader } from '@/components/templates/menu/aiExtractor/Loaders';
import { MenuPreview } from '@/components/templates/menu/aiExtractor/menu-preview';
import { useRefreshGuard } from '@/components/templates/menu/aiExtractor/RefreshGaurd';
import SuccessModal from '@/components/templates/menu/aiExtractor/SuccessModal';
import { Button } from '@/components/ui/button';
import { buildChildCategoryName, toCanonicalDishTypes } from '@/components/utils/helper';
import { useChildCategories, useSaveAiCategory } from '@/hooks/useCategory';
import { postDishData } from '@/hooks/useDish';
import { useMenuStore } from '@/lib/menu/store';
import type { PortionType } from '@/lib/menu/types';
import { fileToBase64, normalizeSubcatArrayToCategories, toNumber } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, FileText, Sparkles, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_KEY = 'AIzaSyC8UMDIXpTc4-CNSUL0k_tdQP1b1EROWz4';

export default function AIMenuExtractorPage() {
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { processingPhase: phase, setProcessingPhase: setPhase } = useMenuStore();

  const [successOpen, setSuccessOpen] = useState(false);
  const [createdCounts, setCreatedCounts] = useState({ categories: 0, dishes: 0 });

  // If this is react-query, expose mutateAsync for awaiting
  const { mutateAsync: createCategory } = useSaveAiCategory() as any;

  const { categories: fetchedCats, refetch } = useChildCategories();
  const { menuId, businessId } = useParams<{ menuId: string; businessId: string }>();

  const categories = useMenuStore((state) => state.categories);
  const setCategories = useMenuStore((state) => state.setCategories);
  const isEditing = useMenuStore((state) => state.isEditing);
  // const setEditing = useMenuStore((state) => state.setEditing);

  useRefreshGuard(
    phase === 'review' ||
      phase === 'creatingCategories' ||
      phase === 'creatingDishes' ||
      phase === 'done' ||
      phase === 'extracting' ||
      phase === 'idle',
  );

  const ACCEPTED_MIME = new Set([
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ]);
  const isAllowedType = (f: File) =>
    f.type.startsWith('image/') ||
    ACCEPTED_MIME.has(f.type) ||
    // fallback for some browsers that miss MIME:
    /\.(pdf|csv|png|jpe?g|gif|webp|bmp|tiff?)$/i.test(f.name);

  const MAX_FILES = 3;

  const dedupe = (list: File[]) => {
    const seen = new Set<string>();
    const out: File[] = [];
    for (const f of list) {
      const key = `${f.name}_${f.size}_${f.lastModified}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(f);
      }
    }
    return out;
  };

  const clampToMax = (list: File[]) => list.slice(0, MAX_FILES);

  // ---- Replace your handler with this ----
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;

    const valid = picked.filter(isAllowedType);
    if (valid.length !== picked.length) {
      setError('Some files were skipped because their type is not supported.');
    } else {
      setError(null);
    }

    // merge with existing files, dedupe, clamp
    setFiles((prev) => {
      const merged = dedupe([...prev, ...valid]);
      if (merged.length > MAX_FILES) {
        setError(`You can upload up to ${MAX_FILES} files.`);
      }
      return clampToMax(merged);
    });

    // allow re-selecting the same files again later
    e.currentTarget.value = '';
  };

  // ---- Optional: support drag & drop ----
  const handleDropFiles = (dropped: File[]) => {
    const valid = dropped.filter(isAllowedType);
    if (valid.length !== dropped.length) {
      setError('Some files were skipped because their type is not supported.');
    } else {
      setError(null);
    }
    setFiles((prev) => {
      const merged = dedupe([...prev, ...valid]);
      if (merged.length > MAX_FILES) {
        setError(`You can upload up to ${MAX_FILES} files.`);
      }
      return clampToMax(merged);
    });
  };

  // ---- Remove by index (for the ❌ button on each preview) ----
  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleExtract = async () => {
    if (files.length === 0) {
      setError('Please select at least one file first.');
      return;
    }
    if (!API_KEY) {
      setError('API Key is not set. Add your key.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPhase('extracting');

    try {
      const results: any[] = [];

      for (const file of files) {
        const base64 = await fileToBase64(file);

        // --- PROMPT: no "General". If no subcategory headings, create ONE subcategory named SAME as the category. ---
        const prompt = `
Extract the restaurant menu from the image and return ONLY JSON with EXACTLY this structure:

[
  {
    "subcategory": string,
    "dishes": [
      {
        "dishName": string,
        "description": string,
        "dishType": "veg" | "nonveg" | "vegan" | "egg" | "alcoholic" | "nonalcoholic",
        "price"?: number,
        "portions"?: [
          { "name": string, "price": number, "default": boolean }
        ]
      }
    ]
  }
]

RULES
A) Subcategories
 - Use visible section sub-headers (e.g., "Whisky", "Wine", "Starters").
 - If no sub-headers are visible for a block, create exactly ONE subcategory named the same as the detected category title. If neither is visible, use "General".
 - Do not include a "category" field anywhere. The top-level must be the array of subcategory objects.

B) Dishes
 - dishName: as printed (trim extra dots/emojis; normalize spacing ,remove special characters).
 - description: keep it short (1–2 sentences, ~12–25 words). If nothing is given, set write a natural, menu-style description of the dish in **30–50 words**.
    Focus on taste, key ingredients, preparation, and serving style; avoid marketing fluff, emojis, or repeated dishName. No emojis/markdown.
 - dishType: infer strictly to one of: veg | nonveg | vegan | egg | alcoholic | nonalcoholic.
   • Meat/fish terms → nonveg; egg/omelette → egg.
   • Spirits/beer/wine/cocktails → alcoholic; juices/mocks/sodas → nonalcoholic.
 - Deduplicate exact duplicates within a subcategory.

C) Pricing
 - Numbers only. Strip currency symbols and commas (₹199 → 199; 1,299 → 1299).
 - For a single price like "Butter Chicken — 320": use "price": 320 and DO NOT include "portions".
 - For variants/measurements like "Half 289 / Full 398" or "30ml 999 | Bottle 21879":
   → use ONLY "portions": [{ "name", "price", "default" }]
   → "default" = true for the CHEAPEST portion unless the menu explicitly marks a different default; others false.
 - Never include BOTH "price" and "portions" on the same dish.

D) Output
 - Return valid JSON only (no markdown, comments, or trailing commas).
 - No extra keys beyond those defined above.

EXAMPLES (illustrative only; adjust to the image):

[
  {
    "subcategory": "Biryani",
    "dishes": [
      { "dishName": "Chicken Biryani", "description": "", "dishType": "nonveg",
        "portions": [
          { "name": "Half", "price": 289, "default": true },
          { "name": "Full", "price": 398, "default": false }
        ]
      },
      { "dishName": "Veg Dum Biryani", "description": "Aromatic basmati rice layered with vegetables and gentle spices.", "dishType": "veg", "price": 249 }
    ]
  },
  {
    "subcategory": "Whisky",
    "dishes": [
      { "dishName": "Glenfiddich 15yr", "description": "Premium single malt; served as 30ml pour or by the bottle.", "dishType": "alcoholic",
        "portions": [
          { "name": "30ml", "price": 999, "default": true },
          { "name": "Bottle", "price": 21879, "default": false }
        ]
      }
    ]
  }
]
`;

        const payload = {
          contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: file.type, data: base64 } }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              // TOP-LEVEL: an array of subcategory objects
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  subcategory: { type: 'STRING' },
                  dishes: {
                    type: 'ARRAY',
                    items: {
                      type: 'OBJECT',
                      properties: {
                        dishName: { type: 'STRING' },
                        description: { type: 'STRING' },
                        dishType: { type: 'STRING' },
                        price: { type: 'NUMBER' }, // optional
                        portions: {
                          // optional
                          type: 'ARRAY',
                          items: {
                            type: 'OBJECT',
                            properties: {
                              name: { type: 'STRING' },
                              price: { type: 'NUMBER' },
                              default: { type: 'BOOLEAN' },
                            },
                            propertyOrdering: ['name', 'price', 'default'],
                          },
                        },
                      },
                      propertyOrdering: ['dishName', 'description', 'dishType', 'price', 'portions'],
                    },
                  },
                },
                propertyOrdering: ['subcategory', 'dishes'],
              },
            },
          },
        } as const;

        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          let detailMessage = '';
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
        if (!jsonText) throw new Error('No JSON returned.');

        const raw = JSON.parse(jsonText); // [{ subcategory, dishes }, ...]
        const normalized = normalizeSubcatArrayToCategories(raw);
        results.push(...normalized);
      }

      setCategories(results); // no category merges/ensure — cat-free logic preserved
      setPhase('review');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Extraction failed');
      setPhase('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = useCallback(async () => {
    try {
      if (!Array.isArray(categories) || categories.length === 0) return;

      // Build wanted child-category names (subcategory names)
      const desiredNames = new Set<string>();
      for (const cat of categories) {
        const subs = Array.isArray(cat.subcategories) ? cat.subcategories : [];
        if (subs.length > 0) {
          for (const sub of subs) {
            const childName = buildChildCategoryName(cat.name, sub?.name).trim(); // sub-name preferred
            if (childName) desiredNames.add(childName);
          }
        } else {
          // fallback shouldn't happen because of ensureSubcategoriesForSameName
          const fallback = (cat?.name || '').trim();
          if (fallback) desiredNames.add(fallback);
        }
      }

      // Avoid duplicates with server
      const norm = (s: string) => s.trim().toLowerCase();
      const existingNames = new Set<string>((fetchedCats ?? []).map((c) => norm(c.name)));
      const namesToCreate = Array.from(desiredNames).filter((n) => !existingNames.has(norm(n)));

      // Create missing child categories
      setPhase('creatingCategories');
      let createdCatCount = 0;
      for (const name of namesToCreate) {
        const payload = { name, hierarchy: 'CHILD' as const, menuId, businessId };
        console.log('Creating category:', payload);
        await createCategory(payload);
        createdCatCount++;
      }

      // Build fresh name -> id map
      const refetchResult = await refetch();
      const latestCats = refetchResult?.data ?? fetchedCats ?? [];
      const byName: Record<string, string> = {};
      for (const item of latestCats) byName[norm(item.name)] = item._id;
      const catNameToId = (nm?: string | null) => (nm ? byName[norm(nm)] : undefined);

      setPhase('creatingDishes');
      let createdDishCount = 0;
      for (const cat of categories) {
        const subs = Array.isArray(cat.subcategories) ? cat.subcategories : [];
        const subBuckets = subs.length > 0 ? subs : [{ name: cat.name, dishes: (cat as any).dishes ?? [] }];

        for (const sub of subBuckets) {
          const childName = buildChildCategoryName(cat.name, sub?.name);
          const childId = catNameToId(childName) || catNameToId(cat.name);
          if (!childId) continue;

          const dishes = Array.isArray(sub?.dishes) ? sub!.dishes : [];
          for (const d of dishes) {
            const dishTypes = toCanonicalDishTypes(d.dishType);
            const price = typeof d.price === 'number' ? d.price : toNumber(d.price);

            // Build portions payload: use variants if present; else a single "Regular" portion.
            let portions: PortionType[];
            if (Array.isArray(d.portions) && d.portions.length > 0) {
              portions = d.portions.map((p: any) => ({
                name: String(p.name || 'Variant'),
                price: toNumber(p.price),
                default: !!p.default,
                portionTypes: dishTypes,
              }));
            } else {
              portions = [
                {
                  name: 'Regular',
                  price,
                  default: true,
                  portionTypes: dishTypes,
                },
              ];
            }
            let finalPrice = price;

            // if portions exist → use default portion price OR fallback to min portion price
            if (Array.isArray(d.portions) && d.portions.length > 0) {
              const defaultPortion = d.portions.find((p: any) => p.default);
              const minPortion = d.portions.reduce((min: number, p: any) => (p.price && p.price < min ? p.price : min), Number.MAX_SAFE_INTEGER);

              finalPrice = defaultPortion?.price ?? (minPortion !== Number.MAX_SAFE_INTEGER ? minPortion : price);
            }

            const payload = {
              name: d.dishName,
              price: finalPrice,
              visibility: true,
              availability: true,
              dishTypes,
              description: (d as any).description?.length ? (d as any).description : autoDescription(d.dishName, childName), // 👈 prefer AI,
              categoryIds: [childId],
              portions,
              menuId,
              businessId,
            };

            await postDishData(payload);
            createdDishCount++;
          }
        }
      }

      setCreatedCounts({ categories: createdCatCount, dishes: createdDishCount });
      setPhase('done');
      setSuccessOpen(true);
    } catch (e) {
      console.error('Proceed failed:', e);
      setPhase('review');
    }
  }, [categories, fetchedCats, refetch, createCategory, menuId, businessId, setPhase]);

  const handleReset = () => {
    setFiles([]);
    setCategories([]);
    setPhase('idle');
    setError(null);
  };

  const isBusy = phase === 'extracting' || phase === 'creatingCategories' || phase === 'creatingDishes';

  const steps = [
    { id: 1, name: 'Upload', icon: Upload, status: files.length > 0 ? 'complete' : 'current' },
    {
      id: 2,
      name: 'Extract',
      icon: Sparkles,
      status:
        phase === 'extracting'
          ? 'current'
          : phase === 'review' || phase === 'creatingCategories' || phase === 'creatingDishes' || phase === 'done'
            ? 'complete'
            : 'upcoming',
    },
    {
      id: 3,
      name: 'Review',
      icon: FileText,
      status:
        phase === 'review' ? 'current' : phase === 'creatingCategories' || phase === 'creatingDishes' || phase === 'done' ? 'complete' : 'upcoming',
    },
    {
      id: 4,
      name: 'Create',
      icon: CheckCircle2,
      status: phase === 'creatingCategories' || phase === 'creatingDishes' ? 'current' : phase === 'done' ? 'complete' : 'upcoming',
    },
  ] as const;

  return (
    <main className="w-full">
      <div className="mx-auto h-[80dvh] max-w-7xl px-4 pb-8">
        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Section */}
        <AnimatePresence mode="wait">
          {(phase === 'idle' || phase === 'extracting') && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="relative mb-8">
              <motion.div
                className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-indigo-50 to-blue-50 p-8 shadow-lg"
                initial={{ scale: 0.98 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                {/* ✨ Animated AI Aura */}
                <motion.div
                  className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-500/20 via-blue-500/10 to-transparent opacity-40 blur-3xl"
                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Title */}
                <div className="mb-6 text-center">
                  <h2 className="mb-2 bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-2xl font-extrabold text-transparent">
                    Upload Your Menu Files
                  </h2>
                  <p className="text-sm text-slate-600">
                    Let <span className="font-semibold text-indigo-600">Hipalz AI</span> read, understand, and transform your menu into structured
                    data.
                  </p>
                </div>

                {/* Upload Section */}
                <FileUpload
                  files={files}
                  onFileChange={handleFileChange}
                  onDropFiles={handleDropFiles}
                  onRemoveFile={handleRemoveFile}
                  maxFiles={3}
                />

                {/* AI Progress Bar */}
                {phase === 'extracting' && (
                  <motion.div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-slate-200" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                    />
                  </motion.div>
                )}

                {/* Extract Button */}
                {files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8 flex justify-center"
                  >
                    <Button
                      onClick={handleExtract}
                      disabled={isLoading || isBusy}
                      size="lg"
                      className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3 text-white shadow-lg hover:from-indigo-700 hover:to-blue-700"
                    >
                      <motion.span
                        className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 via-blue-400 to-indigo-600 opacity-0 blur-lg"
                        animate={{
                          opacity: [0.2, 0.6, 0.2],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <Sparkles className="relative z-10 h-5 w-5 text-white" />
                      <span className="relative z-10 font-medium">
                        {phase === 'extracting' ? 'Extracting with AI Magic…' : 'Extract Menu with Hipalz AI'}
                      </span>
                    </Button>
                  </motion.div>
                )}

                {/* Footer note */}
                <p className="mt-6 text-center text-xs text-slate-400">
                  ⚡ Secure upload • Files auto-processed by <span className="font-semibold text-indigo-500">Hipalz Intelligence Engine</span>
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loaders */}
        <AnimatePresence mode="wait">
          {phase === 'extracting' && <ExtractLoader />}
          {phase === 'creatingCategories' && <CategoryLoader />}
          {phase === 'creatingDishes' && <DishLoader />}
        </AnimatePresence>

        {/* Menu Preview */}
        {phase === 'review' && categories.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative shadow-sm">
            <MenuPreview categories={categories} isEditing={isEditing} />
            <AdvancedBottomButton
              fixed={true}
              maxWidth="30rem"
              buttons={[
                {
                  text: 'Clear',
                  onClick: handleReset,
                  className: '!w-[7rem] !flex-none',
                },
                {
                  text: 'Proceed & Create Menu',
                  onClick: () => setConfirmOpen(true),
                  disable: isBusy || categories.length === 0,
                  className: 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-500/30 hover:from-emerald-700 hover:to-teal-700',
                  icon: <CheckCircle2 className="mr-2 h-5 w-5" />,
                },
              ]}
            />
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
      {confirmOpen && (
        <ConfirmProceedModal
          open={confirmOpen}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false);
            handleProceed(); // your original function
          }}
        />
      )}
    </main>
  );
}
