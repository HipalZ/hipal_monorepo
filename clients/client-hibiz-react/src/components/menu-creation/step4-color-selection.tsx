import { memo, useCallback, useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import type { Category, Dish } from "@/components/store/useMenuCreationStore";
import { useMenuCreationStore } from "../store/useMenuCreationStore";
import useBusinessCtrl from "../store/useBusinessCtrl.ts";

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

    console.log(businessPrimaryColor, businessSecondaryColor);

    const [activePrimary, setActivePrimary] = useState(primaryColor);
    const [activeSecondary, setActiveSecondary] = useState(secondaryColor);
    const [activeColorPicker, setActiveColorPicker] = useState<
      "primary" | "secondary" | null
    >(null);

    // Input field states for manual color entry
    const [primaryInput, setPrimaryInput] = useState(primaryColor);
    const [secondaryInput, setSecondaryInput] = useState(secondaryColor);

    // Sync input fields with active colors
    useEffect(() => {
      setPrimaryInput(activePrimary);
      setSecondaryInput(activeSecondary);
    }, [activePrimary, activeSecondary]);

    // Apply colors when user finishes selecting
    useEffect(() => {
      const timer = setTimeout(() => {
        if (
          activePrimary !== primaryColor ||
          activeSecondary !== secondaryColor
        ) {
          setColors(activePrimary, activeSecondary);
        }
      }, 500);

      return () => clearTimeout(timer);
    }, [
      activePrimary,
      activeSecondary,
      primaryColor,
      secondaryColor,
      setColors,
    ]);

    // Validate hex color format
    const isValidHexColor = (color: string): boolean => {
      return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    };

    // Handle manual color input changes
    const handlePrimaryInputChange = useCallback(
      (value: string) => {
        setPrimaryInput(value);
        if (isValidHexColor(value)) {
          setActivePrimary(value);
        }
      },
      [setActivePrimary, setPrimaryInput],
    );

    const handleSecondaryInputChange = useCallback(
      (value: string) => {
        setSecondaryInput(value);
        if (isValidHexColor(value)) {
          setActiveSecondary(value);
        }
      },
      [setActiveSecondary, setSecondaryInput],
    );

    const colorPresets = [
      { primary: "#3b82f6", secondary: "#dbeafe" },
      { primary: "#10b981", secondary: "#d1fae5" },
      { primary: "#f59e0b", secondary: "#fef3c7" },
      { primary: "#ef4444", secondary: "#fee2e2" },
      { primary: "#8b5cf6", secondary: "#ede9fe" },
      { primary: "#641626", secondary: "#F9E9C7" },
    ];

    const handlePresetSelect = useCallback(
      (primary: string, secondary: string) => {
        setActivePrimary(primary);
        setActiveSecondary(secondary);
        setColors(primary, secondary);
      },
      [setColors],
    );

    // Handle copying business theme colors
    const handleCopyThemeColors = useCallback(() => {
      if (businessPrimaryColor && businessSecondaryColor) {
        setActivePrimary(businessPrimaryColor);
        setActiveSecondary(businessSecondaryColor);
        setColors(businessPrimaryColor, businessSecondaryColor);
      }
    }, [businessPrimaryColor, businessSecondaryColor, setColors]);

    // Get first category and dish for preview
    const previewCategory = sampleCategories[0];
    const previewDish = sampleDishes[0];

    return (
      <div className="flex flex-col gap-6 p-4">
        <h2 className="text-xl font-semibold text-center">
          Choose Color Scheme
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-medium">Select Colors</h3>

            {/* Copy Theme Colors Button */}
            {businessPrimaryColor && businessSecondaryColor && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleCopyThemeColors}
                  className="flex items-center justify-center w-full p-3 text-sm font-medium text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex overflow-hidden rounded-sm">
                      <div
                        className="w-4 h-4"
                        style={{ backgroundColor: businessPrimaryColor }}
                      />
                      <div
                        className="w-4 h-4"
                        style={{ backgroundColor: businessSecondaryColor }}
                      />
                    </div>
                    Copy Theme Colors
                  </div>
                </button>
              </div>
            )}

            {/* Color presets */}
            <div className="grid grid-cols-3 gap-2">
              {colorPresets.map((preset, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() =>
                    handlePresetSelect(preset.primary, preset.secondary)
                  }
                  className="flex flex-col items-center p-2 border rounded-md hover:border-gray-400"
                >
                  <div className="flex w-full h-8 overflow-hidden rounded-md">
                    <div
                      className="w-1/2 h-full"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div
                      className="w-1/2 h-full"
                      style={{ backgroundColor: preset.secondary }}
                    />
                  </div>
                  <span className="mt-1 text-xs">Preset {index + 1}</span>
                </button>
              ))}
            </div>

            {/* Manual color input fields */}
            <div className="flex gap-4 mt-4">
              <div className="flex-1">
                <label className="block mb-1 text-sm font-medium">
                  Primary Color (Hex)
                </label>
                <input
                  type="text"
                  value={primaryInput}
                  onChange={(e) => handlePrimaryInputChange(e.target.value)}
                  placeholder="#3b82f6"
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isValidHexColor(primaryInput)
                      ? "border-gray-300"
                      : "border-red-300 bg-red-50"
                  }`}
                />
                {!isValidHexColor(primaryInput) && (
                  <p className="mt-1 text-xs text-red-500">
                    Please enter a valid hex color (e.g., #3b82f6)
                  </p>
                )}
              </div>
              <div className="flex-1">
                <label className="block mb-1 text-sm font-medium">
                  Secondary Color (Hex)
                </label>
                <input
                  type="text"
                  value={secondaryInput}
                  onChange={(e) => handleSecondaryInputChange(e.target.value)}
                  placeholder="#dbeafe"
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isValidHexColor(secondaryInput)
                      ? "border-gray-300"
                      : "border-red-300 bg-red-50"
                  }`}
                />
                {!isValidHexColor(secondaryInput) && (
                  <p className="mt-1 text-xs text-red-500">
                    Please enter a valid hex color (e.g., #dbeafe)
                  </p>
                )}
              </div>
            </div>

            {/* Custom color pickers */}
            <div className="flex gap-4 mt-2">
              <div className="flex-1">
                <label className="block mb-1 text-sm font-medium">
                  Primary Color
                </label>
                <div
                  className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                  style={{ backgroundColor: activePrimary }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setActiveColorPicker(
                        activeColorPicker === "primary" ? null : "primary",
                      );
                    }
                  }}
                  onClick={() =>
                    setActiveColorPicker(
                      activeColorPicker === "primary" ? null : "primary",
                    )
                  }
                />
                {activeColorPicker === "primary" && (
                  <div className="relative z-10 mt-2">
                    <HexColorPicker
                      color={activePrimary}
                      onChange={setActivePrimary}
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
                  style={{ backgroundColor: activeSecondary }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setActiveColorPicker(
                        activeColorPicker === "secondary" ? null : "secondary",
                      );
                    }
                  }}
                  onClick={() =>
                    setActiveColorPicker(
                      activeColorPicker === "secondary" ? null : "secondary",
                    )
                  }
                />
                {activeColorPicker === "secondary" && (
                  <div className="relative z-10 mt-2">
                    <HexColorPicker
                      color={activeSecondary}
                      onChange={setActiveSecondary}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-medium">Preview</h3>
            <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
              {/* Category preview */}
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-full"
                    style={{ backgroundColor: activePrimary }}
                  >
                    {previewCategory?.coverImage ? (
                      <img
                        src={previewCategory.coverImage || "/placeholder.svg"}
                        alt={previewCategory.name}
                        className="object-cover w-full h-full rounded-full"
                      />
                    ) : (
                      <span className="font-medium text-white">
                        {previewCategory?.name.charAt(0) || "C"}
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
              {/* Dish preview based on selected layout */}
              <div className="p-3">
                {cardLayout === 1 ? (
                  // Grid layout preview
                  <div className="overflow-hidden border border-gray-200 rounded-md">
                    {/* Image area */}
                    <div
                      className="flex items-center justify-center w-full bg-gray-100 aspect-square"
                      style={{ backgroundColor: activeSecondary }}
                    >
                      {previewDish?.images && previewDish.images.length > 0 ? (
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
                    {/* Info area */}
                    <div className="p-2">
                      <h4
                        className="font-medium"
                        style={{ color: activePrimary }}
                      >
                        {previewDish?.name || "Dish Name"}
                      </h4>
                      <p className="text-sm" style={{ color: activePrimary }}>
                        ${previewDish?.price.toFixed(2) || "0.00"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                        {previewDish?.description ||
                          "Dish description would appear here"}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Horizontal layout preview
                  <div className="flex overflow-hidden border border-gray-200 rounded-md">
                    {/* Info area */}
                    <div className="flex-1 p-2">
                      <h4
                        className="font-medium"
                        style={{ color: activePrimary }}
                      >
                        {previewDish?.name || "Dish Name"}
                      </h4>
                      <p className="text-sm" style={{ color: activePrimary }}>
                        ${previewDish?.price.toFixed(2) || "0.00"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                        {previewDish?.description ||
                          "Dish description would appear here"}
                      </p>
                    </div>
                    {/* Image area */}
                    <div
                      className="flex items-center justify-center w-20 h-20"
                      style={{ backgroundColor: activeSecondary }}
                    >
                      {previewDish?.images && previewDish.images.length > 0 ? (
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
