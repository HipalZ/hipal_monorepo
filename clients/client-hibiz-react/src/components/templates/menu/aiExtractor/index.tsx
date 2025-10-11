import { memo, useCallback, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  findLocationByDishNodeId,
  resolveTarget,
  isDishNode,
  normalizeToCategories,
  mergeCategories,
  fileToBase64,
} from "@/lib/utils";
import { FileUpload } from "./file-upload";
import { useMenuStore } from "@/lib/menu/store";
import { MenuPreview } from "./menu-preview";

const API_KEY = "AIzaSyC8UMDIXpTc4-CNSUL0k_tdQP1b1EROWz4"; // ⚠️ Do not commit real keys

const MemoAIMenuExtractor = () => {
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { categories, setCategories, isEditing, setEditing } = useMenuStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    const maxFiles = 3;
    if (!selected) return;

    if (selected.length > maxFiles) {
      setError(`Please select no more than ${maxFiles} images.`);
      setFiles([]);
    } else {
      setFiles(Array.from(selected));
      setError(null);
    }
  };

  const handleExtract = async () => {
    if (files.length === 0) {
      setError("Please select at least one image file first.");
      return;
    }
    if (!API_KEY) {
      setError("API Key is not set. Add your key.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = [];

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
          const detail = await res.json();
          throw new Error(
            `API error for ${file.name}: ${
              detail?.error?.message || res.status
            }`,
          );
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
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Extraction failed");
    } finally {
      setIsLoading(false);
    }
  };

  const onDragEnd = useCallback(
    (evt: DragEndEvent) => {
      if (!evt.over || !evt.active) return;
      const overId = String(evt.over.id);
      const activeId = String(evt.active.id);

      const locFrom = findLocationByDishNodeId(activeId, categories);
      const locTo = resolveTarget(overId, categories);
      if (!locFrom || !locTo) return;

      const targetIndex = isDishNode(overId) ? locTo.index : locTo.index;

      if (locFrom.catId === locTo.catId && locFrom.subId === locTo.subId) {
        if (locFrom.index === targetIndex) return;
        const cats = structuredClone(categories);
        const cat = cats.find((c) => c.id === locFrom.catId)!;
        const sub = cat.subcategories.find((s) => s.id === locFrom.subId)!;
        sub.dishes = arrayMove(sub.dishes, locFrom.index, targetIndex);
        setCategories(cats);
      } else {
        useMenuStore
          .getState()
          .moveDish(locFrom.dishId, locFrom, { ...locTo, index: targetIndex });
      }
    },
    [categories, setCategories],
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              AI Menu Extractor
            </h1>
            <p className="text-gray-600">
              Upload up to 3 images to extract categories → subcategories →
              dishes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditing(!isEditing)}
              className={`px-4 py-2 rounded-lg font-medium border ${
                isEditing
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-gray-100 text-gray-800 border-gray-300"
              }`}
            >
              {isEditing ? "Done" : "Edit"}
            </button>
            <button
              onClick={handleExtract}
              disabled={isLoading || files.length === 0}
              className="px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white disabled:bg-blue-400"
            >
              {isLoading ? "Extracting…" : "Extract Menu"}
            </button>
          </div>
        </div>

        <FileUpload files={files} onFileChange={handleFileChange} />

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <DndContext
          sensors={sensors}
          onDragEnd={onDragEnd}
          collisionDetection={closestCorners}
        >
          <MenuPreview categories={categories} isEditing={isEditing} />
        </DndContext>
      </div>
    </div>
  );
};
const AIMenuExtractor = memo(MemoAIMenuExtractor);
export default AIMenuExtractor;
