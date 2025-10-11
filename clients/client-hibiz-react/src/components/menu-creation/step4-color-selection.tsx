import { memo, useCallback, useEffect, useState } from "react";
import type { Category, Dish } from "@/components/store/useMenuCreationStore";
import { useMenuCreationStore } from "../store/useMenuCreationStore";
import useBusinessCtrl from "../store/useBusinessCtrl";
import { ColorPicker } from "../ui/color-picker";

interface Step4ColorSelectionProps {
  sampleCategories: Category[];
  sampleDishes: Dish[];
}

const Step4ColorSelection = memo(
  ({ sampleCategories, sampleDishes }: Step4ColorSelectionProps) => {
    const { primaryColor, secondaryColor, setColors, cardLayout } =
      useMenuCreationStore((state) => ({
        primaryColor: state.primaryColor,
        secondaryColor: state.secondaryColor,
        setColors: state.setColors,
        cardLayout: state.cardLayout,
      }));

    const {
      primaryColor: businessPrimaryColor,
      secondaryColor: businessSecondaryColor,
    } = useBusinessCtrl((s) => ({
      primaryColor: s.primaryColor,
      secondaryColor: s.secondaryColor,
    }));

    const [activePrimary, setActivePrimary] = useState(primaryColor);
    const [activeSecondary, setActiveSecondary] = useState(secondaryColor);
    const [activeColorPicker, setActiveColorPicker] = useState<
      "primary" | "secondary" | null
    >(null);

    // Manual input fields
    const [primaryInput, setPrimaryInput] = useState(primaryColor);
    const [secondaryInput, setSecondaryInput] = useState(secondaryColor);

    useEffect(() => {
      setPrimaryInput(activePrimary);
      setSecondaryInput(activeSecondary);
    }, [activePrimary, activeSecondary]);

    // Auto-sync to Zustand store
    useEffect(() => {
      const timer = setTimeout(() => {
        if (
          activePrimary !== primaryColor ||
          activeSecondary !== secondaryColor
        ) {
          setColors(activePrimary, activeSecondary);
        }
      }, 400);
      return () => clearTimeout(timer);
    }, [
      activePrimary,
      activeSecondary,
      primaryColor,
      secondaryColor,
      setColors,
    ]);

    // Validation
    const isValidHex = (color: string) =>
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);

    // Handlers
    const handlePrimaryChange = useCallback(
      (value: string) => {
        setPrimaryInput(value);
        if (isValidHex(value)) setActivePrimary(value);
      },
      [setActivePrimary],
    );

    const handleSecondaryChange = useCallback(
      (value: string) => {
        setSecondaryInput(value);
        if (isValidHex(value)) setActiveSecondary(value);
      },
      [setActiveSecondary],
    );

    const colorPresets = [
      { primary: "#3b82f6", secondary: "#dbeafe" },
      { primary: "#10b981", secondary: "#d1fae5" },
      { primary: "#f59e0b", secondary: "#fef3c7" },
      { primary: "#ef4444", secondary: "#fee2e2" },
      { primary: "#8b5cf6", secondary: "#ede9fe" },
      { primary: "#ec4899", secondary: "#fce7f3" },
    ];

    const handlePreset = useCallback(
      (p: string, s: string) => {
        setActivePrimary(p);
        setActiveSecondary(s);
        setColors(p, s);
      },
      [setColors],
    );

    const handleCopyBusiness = useCallback(() => {
      if (businessPrimaryColor && businessSecondaryColor) {
        setActivePrimary(businessPrimaryColor);
        setActiveSecondary(businessSecondaryColor);
        setColors(businessPrimaryColor, businessSecondaryColor);
      }
    }, [businessPrimaryColor, businessSecondaryColor, setColors]);

    const previewCategory = sampleCategories?.[0];
    const previewDish = sampleDishes?.[0];

    return (
      <div className="flex flex-col gap-6 p-4">
        <h2 className="text-xl font-semibold text-center">
          Choose Color Scheme
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* LEFT: Color selection */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-medium">Select Colors</h3>

            {businessPrimaryColor && businessSecondaryColor && (
              <button
                type="button"
                onClick={handleCopyBusiness}
                className="flex items-center justify-center w-full p-3 mb-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-400"
              >
                <div className="flex items-center gap-2">
                  <div className="flex overflow-hidden rounded-sm">
                    <div
                      className="w-4 h-4"
                      style={{ background: businessPrimaryColor }}
                    />
                    <div
                      className="w-4 h-4"
                      style={{ background: businessSecondaryColor }}
                    />
                  </div>
                  Copy Business Theme
                </div>
              </button>
            )}

            {/* Presets */}
            <div className="grid grid-cols-3 gap-2">
              {colorPresets.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handlePreset(p.primary, p.secondary)}
                  className="flex flex-col items-center p-2 border rounded-md hover:border-gray-400"
                >
                  <div className="flex w-full h-8 overflow-hidden rounded-md">
                    <div className="w-1/2" style={{ background: p.primary }} />
                    <div
                      className="w-1/2"
                      style={{ background: p.secondary }}
                    />
                  </div>
                  <span className="mt-1 text-xs">Preset {i + 1}</span>
                </button>
              ))}
            </div>

            {/* Manual input */}
            <div className="flex gap-4 mt-4">
              <div className="flex-1">
                <label className="block mb-1 text-sm font-medium">
                  Primary Color (Hex)
                </label>
                <input
                  value={primaryInput}
                  onChange={(e) => handlePrimaryChange(e.target.value)}
                  placeholder="#3b82f6"
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 ${
                    isValidHex(primaryInput)
                      ? "border-gray-300"
                      : "border-red-300 bg-red-50 text-red-700"
                  }`}
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 text-sm font-medium">
                  Secondary Color (Hex)
                </label>
                <input
                  value={secondaryInput}
                  onChange={(e) => handleSecondaryChange(e.target.value)}
                  placeholder="#dbeafe"
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 ${
                    isValidHex(secondaryInput)
                      ? "border-gray-300"
                      : "border-red-300 bg-red-50 text-red-700"
                  }`}
                />
              </div>
            </div>

            {/* Shadcn Color Pickers */}
            <div className="flex gap-4 mt-3">
              <div className="flex-1">
                <label className="block mb-1 text-sm font-medium">
                  Primary Color
                </label>
                <div
                  className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                  style={{ background: activePrimary }}
                  onClick={() =>
                    setActiveColorPicker(
                      activeColorPicker === "primary" ? null : "primary",
                    )
                  }
                />
                {activeColorPicker === "primary" && (
                  <div className="mt-2">
                    <ColorPicker
                      color={activePrimary}
                      onChange={setActivePrimary}
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <label className="block mb-1 text-sm font-medium">
                  Secondary Color
                </label>
                <div
                  className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                  style={{ background: activeSecondary }}
                  onClick={() =>
                    setActiveColorPicker(
                      activeColorPicker === "secondary" ? null : "secondary",
                    )
                  }
                />
                {activeColorPicker === "secondary" && (
                  <div className="mt-2">
                    <ColorPicker
                      color={activeSecondary}
                      onChange={setActiveSecondary}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Preview */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-medium">Preview</h3>
            <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-full"
                    style={{ background: activePrimary }}
                  >
                    {previewCategory?.coverImage ? (
                      <img
                        src={previewCategory.coverImage || "/placeholder.svg"}
                        alt={previewCategory.name}
                        className="object-cover w-full h-full rounded-full"
                      />
                    ) : (
                      <span className="font-medium text-white">
                        {previewCategory?.name?.charAt(0) || "C"}
                      </span>
                    )}
                  </div>
                  <span
                    className="font-medium"
                    style={{ color: activePrimary }}
                  >
                    {previewCategory?.name || "Category Name"}
                  </span>
                </div>
              </div>

              <div className="p-3">
                {cardLayout === 1 ? (
                  <div className="overflow-hidden border border-gray-200 rounded-md">
                    <div
                      className="flex items-center justify-center w-full aspect-square"
                      style={{ background: activeSecondary }}
                    >
                      {previewDish?.images?.[0] ? (
                        <img
                          src={previewDish.images[0] || "/placeholder.svg"}
                          alt={previewDish.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div
                          className="text-2xl"
                          style={{ color: activePrimary }}
                        >
                          🍽️
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <h4
                        className="font-medium"
                        style={{ color: activePrimary }}
                      >
                        {previewDish?.name || "Dish Name"}
                      </h4>
                      <p className="text-sm" style={{ color: activePrimary }}>
                        ${previewDish?.price?.toFixed(2) || "0.00"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                        {previewDish?.description ||
                          "Dish description would appear here"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex overflow-hidden border border-gray-200 rounded-md">
                    <div className="flex-1 p-2">
                      <h4
                        className="font-medium"
                        style={{ color: activePrimary }}
                      >
                        {previewDish?.name || "Dish Name"}
                      </h4>
                      <p className="text-sm" style={{ color: activePrimary }}>
                        ${previewDish?.price?.toFixed(2) || "0.00"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                        {previewDish?.description ||
                          "Dish description would appear here"}
                      </p>
                    </div>
                    <div
                      className="flex items-center justify-center w-20 h-20"
                      style={{ background: activeSecondary }}
                    >
                      {previewDish?.images?.[0] ? (
                        <img
                          src={previewDish.images[0] || "/placeholder.svg"}
                          alt={previewDish.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div
                          className="text-2xl"
                          style={{ color: activePrimary }}
                        >
                          🍽️
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

Step4ColorSelection.displayName = "Step4ColorSelection";
export default Step4ColorSelection;
