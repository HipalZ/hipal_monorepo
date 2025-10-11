import type { ExtractResponse } from "./types";
import { fileToBase64 } from "../utils";

const API_KEY = "AIzaSyC8UMDIXpTc4-CNSUL0k_tdQP1b1EROWz4";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

export async function extractMenuFromFiles(
  files: File[],
): Promise<ExtractResponse> {
  const filesText: string[] = [];

  for (const file of files) {
    if (file.type.startsWith("image/")) {
      const base64 = await fileToBase64(file);
      filesText.push(`[IMAGE:${file.name}:${base64}]`);
    } else {
      // For CSV/Excel/PDF, you'd extract text here
      const text = await file.text();
      filesText.push(text);
    }
  }

  const prompt = `You are "Hipalz Menu Builder". Extract menu data from the provided files and return ONLY valid JSON matching this exact structure (no markdown, no comments):

{
  "status": "ok",
  "ui": {
    "sections": [
      { "key": "categories", "label": "Categories (rename only)" },
      { "key": "dishes", "label": "Dishes (name, price, types, portions, linking)" }
    ],
    "loaders": {
      "extract": { "label": "Reading your file and structuring menu…", "icon": "Scan" },
      "createCategories": { "label": "Setting up your menu structure…", "icon": "Folders" },
      "linkDishes": { "label": "Saving dishes and attaching them to categories…", "icon": "UtensilsCrossed" }
    },
    "refreshGuard": {
      "title": "Leave this page?",
      "message": "Your extracted menu isn't saved yet. If you refresh or close now, you'll lose your changes.",
      "primary": "Stay on page",
      "secondary": "Discard & leave"
    },
    "successModal": {
      "title": "All done! 🎉",
      "bodyTemplate": "Created {categoriesCount} categories and {dishesCount} dishes.",
      "primaryCta": "Go to Menu",
      "secondaryCta": "Add more now"
    }
  },
  "review": {
    "notes": [],
    "stats": {
      "categories": 0,
      "dishes": 0,
      "dishesWithPortions": 0,
      "missingPrices": 0
    }
  },
  "categoriesDraft": [
    { "tempId": "cat_uuid", "name": "Category Name" }
  ],
  "dishesDraft": [
    {
      "tempId": "dish_uuid",
      "name": "Dish Name",
      "dishTypes": ["VEG"],
      "price": 199.00,
      "description": "50-100 character description",
      "portions": [
        { "name": "Regular", "price": 199.00, "default": true, "portionTypes": ["VEG"] }
      ],
      "categoryRefs": ["cat_uuid"],
      "visibility": true,
      "availability": true
    }
  ]
}

Rules:
- Dish types must be: VEG, NON_VEG, EGG, VEGAN, ALCOHOL, NON_ALCOHOL, GLUTEN_FREE, or MIX
- Descriptions must be 50-100 characters
- Each dish must have at least one portion with exactly one default=true
- Prices must be numbers (no currency symbols)
- Category and dish names in Title Case

Files: ${filesText.join("\n\n")}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      topP: 0.95,
      topK: 40,
    },
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.error?.message || "AI extraction failed");
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("No response from AI");
  }

  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Invalid JSON response from AI");
  }

  return JSON.parse(jsonMatch[0]);
}
