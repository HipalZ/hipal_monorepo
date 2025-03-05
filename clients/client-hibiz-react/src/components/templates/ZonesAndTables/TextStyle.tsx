import { useState } from "react"
import { useQr } from "@/components/store/useQr"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Check, Plus, Minus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton"
import { TbCircleLetterAFilled } from "react-icons/tb"
import { BsTypeItalic, BsTypeUnderline } from "react-icons/bs"

// Font options with 6 additional restaurant-themed fonts
const fontOptions = [
  { name: "Sans Serif", value: "font-sans" },
  { name: "Serif", value: "font-serif" },
  { name: "Mono", value: "font-mono" },
  { name: "Poppins", value: "font-poppins" },
  { name: "Roboto", value: "font-roboto" },
  { name: "Open Sans", value: "font-opensans" },
  { name: "Montserrat", value: "font-montserrat" },
  { name: "Playfair", value: "font-playfair" },
  { name: "Lato", value: "font-lato" },
  { name: "Oswald", value: "font-oswald" },
  { name: "Merriweather", value: "font-merriweather" },
  { name: "Ubuntu", value: "font-ubuntu" },
  // New restaurant-themed fonts
  { name: "Cormorant", value: "font-cormorant" },
  { name: "Cinzel", value: "font-cinzel" },
  { name: "Parisienne", value: "font-parisienne" },
  { name: "Baskerville", value: "font-baskerville" },
  { name: "Garamond", value: "font-garamond" },
  { name: "Great Vibes", value: "font-greatvibes" },
]

// Font weight options
const fontWeightOptions = [
  { name: "Light", value: "font-light" },
  { name: "Normal", value: "font-normal" },
  { name: "Medium", value: "font-medium" },
  { name: "Semibold", value: "font-semibold" },
  { name: "Bold", value: "font-bold" },
  { name: "Extrabold", value: "font-extrabold" },
]

// Color options (30 colors)
const colorOptions = [
  // Blacks & Whites
  { name: "Black", value: "#000000", isDark: true },
  { name: "White", value: "#FFFFFF", isDark: false },
  { name: "Gray", value: "#808080", isDark: true },

  // Reds
  { name: "Red", value: "#FF0000", isDark: true },
  { name: "Crimson", value: "#DC143C", isDark: true },
  { name: "Coral", value: "#FF7F50", isDark: false },

  // Oranges
  { name: "Orange", value: "#FFA500", isDark: false },
  { name: "Gold", value: "#FFD700", isDark: false },
  { name: "Amber", value: "#FFBF00", isDark: false },

  // Yellows
  { name: "Yellow", value: "#FFFF00", isDark: false },
  { name: "Khaki", value: "#F0E68C", isDark: false },
  { name: "Lemon", value: "#FFFACD", isDark: false },

  // Greens
  { name: "Green", value: "#008000", isDark: true },
  { name: "Lime", value: "#00FF00", isDark: false },
  { name: "Olive", value: "#808000", isDark: true },

  // Blues
  { name: "Blue", value: "#0000FF", isDark: true },
  { name: "SkyBlue", value: "#87CEEB", isDark: false },
  { name: "Navy", value: "#000080", isDark: true },

  // Purples
  { name: "Purple", value: "#800080", isDark: true },
  { name: "Lavender", value: "#E6E6FA", isDark: false },
  { name: "Magenta", value: "#FF00FF", isDark: true },

  // Pinks
  { name: "Pink", value: "#FFC0CB", isDark: false },
  { name: "HotPink", value: "#FF69B4", isDark: false },
  { name: "DeepPink", value: "#FF1493", isDark: true },

  // Browns
  { name: "Brown", value: "#A52A2A", isDark: true },
  { name: "Chocolate", value: "#D2691E", isDark: true },
  { name: "Tan", value: "#D2B48C", isDark: false },

  // Teals & Cyans
  { name: "Teal", value: "#008080", isDark: true },
  { name: "Cyan", value: "#00FFFF", isDark: false },
  { name: "Turquoise", value: "#40E0D0", isDark: false },
]

// Function to get contrasting color
const getContrastColor = (color: string): string => {
  // Convert hex to RGB
  const r = Number.parseInt(color.slice(1, 3), 16)
  const g = Number.parseInt(color.slice(3, 5), 16)
  const b = Number.parseInt(color.slice(5, 7), 16)

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Return black for light colors and white for dark colors
  return luminance > 0.5 ? "#000000" : "#FFFFFF"
}

const TextStyle = () => {
  // Get state from store
  const {
    textColor,
    setTextColor,
    textFont,
    setTextFont,
    hasBackground,
    setHasBackground,
    backgroundColor,
    setBackgroundColor,
    image,
    toggleEditTextModal,
    textSize,
    setTextSize,
    fontWeight,
    setFontWeight,
    isItalic,
    setIsItalic,
    isUnderlined,
    setIsUnderlined,
  } = useQr((state) => ({
    textColor: state.textColor || "#000000",
    setTextColor: state.setTextColor,
    textFont: state.textFont || "font-sans",
    setTextFont: state.setTextFont,
    hasBackground: state.hasBackground || false,
    setHasBackground: state.setHasBackground,
    backgroundColor: state.backgroundColor || "#FFFFFF",
    setBackgroundColor: state.setBackgroundColor,
    image: state.image,
    toggleEditTextModal: state.toggleEditTextModal,
    textSize: state.textSize || 16,
    setTextSize: state.setTextSize,
    fontWeight: state.fontWeight || "font-normal",
    setFontWeight: state.setFontWeight,
    isItalic: state.isItalic || false,
    setIsItalic: state.setIsItalic,
    isUnderlined: state.isUnderlined || false,
    setIsUnderlined: state.setIsUnderlined,
  }))

  // Local state
  const [colorPage, setColorPage] = useState(0)
  const [fontPage, setFontPage] = useState(0)
  const [fontWeightPage, setFontWeightPage] = useState(0)

  // Constants
  const colorsPerPage = 10
  const fontsPerPage = 6
    const fontWeightsPerPage = 3
  const totalColorPages = Math.ceil(colorOptions.length / colorsPerPage)
  const totalFontPages = Math.ceil(fontOptions.length / fontsPerPage)
    const totalFontWeightPages = Math.ceil(fontWeightOptions.length / fontWeightsPerPage)

  // Get current colors and fonts
  const currentColors = colorOptions.slice(colorPage * colorsPerPage, (colorPage + 1) * colorsPerPage)
  const currentFonts = fontOptions.slice(fontPage * fontsPerPage, (fontPage + 1) * fontsPerPage)

  // Handle color selection
  const handleColorSelect = (color: string) => {
    setTextColor(color)

    // If background is enabled, set a contrasting background color
    if (hasBackground) {
      const colorObj = colorOptions.find((c) => c.value === color)
      if (colorObj) {
        // Set background to opposite lightness
        const contrastingColors = colorOptions.filter((c) => c.isDark !== colorObj.isDark)
        const randomIndex = Math.floor(Math.random() * contrastingColors.length)
        setBackgroundColor(contrastingColors[randomIndex].value)
      }
    }
  }

  // Toggle background
  const toggleBackground = () => {
    if (!hasBackground) {
      // Enable background with contrasting color
      const colorObj = colorOptions.find((c) => c.value === textColor)
      if (colorObj) {
        const contrastingColors = colorOptions.filter((c) => c.isDark !== colorObj.isDark)
        const randomIndex = Math.floor(Math.random() * contrastingColors.length)
        setBackgroundColor(contrastingColors[randomIndex].value)
      }
      setHasBackground(true)
    } else {
      // Disable background
      setHasBackground(false)
    }
  }

  // Handle font size changes
  const increaseFontSize = () => {
    setTextSize(Math.min(36, textSize + 2))
  }

  const decreaseFontSize = () => {
    setTextSize(Math.max(8, textSize - 2))
  }

  return (
    <div className="px-6 relative space-y-6 h-[90dvh] lg:h-[40rem] hide-scrollbar overflow-y-auto">
      <div className="sticky z-10 shadow-md top-2 dark:bg-gray-800">
        <div className="relative flex items-center justify-center mt-2 overflow-hidden border rounded-md">
          <div className="w-full h-[7rem] bg-slate-100">
            {image ? (
              <img src={image || "/placeholder.svg"} alt="Background" className="object-cover w-full h-full" />
            ) : null}
          </div>
          <div className="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center">
            <span
              className={`${textFont} ${fontWeight}`}
              style={{
                color: textColor,
                backgroundColor: hasBackground ? backgroundColor : "transparent",
                padding: hasBackground ? "0.5rem 1rem" : "0",
                borderRadius: hasBackground ? "0.25rem" : "0",
                fontSize: `${textSize}px`,
                fontStyle: isItalic ? "italic" : "normal",
                textDecoration: isUnderlined ? "underline" : "none",
              }}
            >
              Table Name
            </span>
          </div>
        </div>
      </div>

      {/* Font Size Controls */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Font Size: {textSize}px</Label>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={decreaseFontSize} disabled={textSize <= 8}>
              <Minus className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={increaseFontSize} disabled={textSize >= 36}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Font Weight and Style Controls */}

    <div className="space-y-2">
        <div className="flex items-center justify-between">
            <Label>Font Weight</Label>
            <div className="flex space-x-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setFontWeightPage((prev) => Math.max(0, prev - 1))}
                    disabled={fontWeightPage === 0}
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-2">
                    {fontWeightPage + 1}/{totalFontWeightPages}
                </span>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setFontWeightPage((prev) => Math.min(totalFontWeightPages - 1, prev + 1))}
                    disabled={fontWeightPage === totalFontWeightPages - 1}
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
        <AnimatePresence mode="wait">
            <motion.div
                key={fontWeightPage}
                className="grid grid-cols-3 gap-2 mt-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
            >
                {fontWeightOptions
                    .slice(fontWeightPage * fontWeightsPerPage, (fontWeightPage + 1) * fontWeightsPerPage)
                    .map((weight) => (
                        <Button
                            key={weight.value}
                            variant={fontWeight === weight.value ? "default" : "outline"}
                            className={weight.value}
                            onClick={() => setFontWeight(weight.value)}
                        >
                            {weight.name}
                        </Button>
                    ))}
            </motion.div>
        </AnimatePresence>
    </div>

      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={isItalic ? "default" : "outline"}
            onClick={() => setIsItalic(!isItalic)}
            className="col-span-1"
          >
            <BsTypeItalic className="w-4 h-4 mr-2" />
            Italic
          </Button>
          <Button
            variant={isUnderlined ? "default" : "outline"}
            onClick={() => setIsUnderlined(!isUnderlined)}
            className="col-span-2"
          >
            <BsTypeUnderline className="w-4 h-4 mr-2" />
            Underline
          </Button>
        </div>
      </div>

      {/* Font Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Font</Label>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setFontPage((prev) => Math.max(0, prev - 1))}
              disabled={fontPage === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="flex items-center px-2">
              {fontPage + 1}/{totalFontPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setFontPage((prev) => Math.min(totalFontPages - 1, prev + 1))}
              disabled={fontPage === totalFontPages - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={fontPage}
              className="grid grid-cols-2 col-span-2 gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentFonts.map((font) => (
                <Button
                  key={font.value}
                  variant={textFont === font.value ? "default" : "outline"}
                  className={`justify-start ${font.value} h-auto py-2`}
                  onClick={() => setTextFont(font.value)}
                >
                  <span className="truncate">{font.name}</span>
                  {textFont === font.value && <Check className="w-4 h-4 ml-auto" />}
                </Button>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Color Selection */}
      <div className="space-y-2 pb-[5rem]">
        <div className="flex items-center justify-between">
          <Label>Text Color</Label>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setColorPage((prev) => Math.max(0, prev - 1))}
              disabled={colorPage === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="flex items-center px-2">
              {colorPage + 1}/{totalColorPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setColorPage((prev) => Math.min(totalColorPages - 1, prev + 1))}
              disabled={colorPage === totalColorPages - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 mt-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={colorPage}
              className="grid grid-cols-10 col-span-5 gap-2 mt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentColors.map((color) => (
                <motion.button
                  key={color.value}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full aspect-square rounded-full border-2 ${textColor === color.value ? "border-black dark:border-white" : "border-transparent"}`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => handleColorSelect(color.value)}
                  title={color.name}
                >
                  {textColor === color.value && (
                    <Check className="w-4 h-4 mx-auto" style={{ color: getContrastColor(color.value) }} />
                  )}
                </motion.button>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AdvancedBottomButton
        fixed={true}
        maxWidth="30rem"
        buttons={[
          {
            text: "Cancel",
            onClick: toggleEditTextModal,
            isBackButton: true,
            className: "rounded-md pl-3",
          },
          {
            text: "",
            icon: <TbCircleLetterAFilled size={24} />,
            onClick: toggleBackground,
            color: "purple",
            className: "rounded-md",
          },
          {
            text: "Save",
            onClick: toggleEditTextModal,
            className: "rounded-md md:px-[6rem] px-12",
          },
        ]}
      />
    </div>
  )
}

export default TextStyle

