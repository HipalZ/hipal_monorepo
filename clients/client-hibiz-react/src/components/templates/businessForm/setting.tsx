import { useState, useCallback, memo } from "react"
import { IphoneCategory, IphoneExplore } from "@/components/atom/svgtheme"
import useBusinessCtrl from "@/components/store/useBusinessCtrl"
import { colors } from "./businessCtrlStore"
import { ArrowLeftRight } from "lucide-react"
import PopUp from "@/components/atom/popUp"
import ColorWheel from "@/components/atom/colorWheel"
import useBusinessData from "@/components/store/useBusinessData"
import { useLayoutThemes } from "@/hooks/useLayoutThemes"
import { motion } from "framer-motion"
import MotionButton from "@/components/atom/motionButton"

const MemoSetting = () => {
  const { primaryColor, secondaryColor, exploreLayout, menuLayout, setPrimaryColor, setSecondaryColor } =
    useBusinessCtrl((s) => ({
      primaryColor: s.primaryColor,
      secondaryColor: s.secondaryColor,
      setPrimaryColor: s.setPrimaryColor,
      setSecondaryColor: s.setSecondaryColor,
      exploreLayout: s.exploreLayout,
      menuLayout: s.menuLayout,
    }))

  const { mutate } = useLayoutThemes()
  const { businessData, updateThemeData } = useBusinessData((s) => ({
    businessData: s.businessData,
    updateThemeData: s.updateThemeData,
  }))

  const [open, setOpen] = useState(false)
  const [colorType, setColorType] = useState<"primary" | "secondary">("primary")

  const handleOpen = useCallback((type: "primary" | "secondary") => {
    setColorType(type)
    setOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  const handlePrimaryColorChange = useCallback((color: string) => {
    setPrimaryColor(color)
  }, [setPrimaryColor])

  const handleSecondaryColorChange = useCallback((color: string) => {
    setSecondaryColor(color)
  }, [setSecondaryColor])

  const swapColors = useCallback(() => {
    setPrimaryColor(secondaryColor)
    setSecondaryColor(primaryColor)
  }, [primaryColor, secondaryColor, setPrimaryColor, setSecondaryColor])

  const apiCall = async () => {
    const payload = {
      exploreLayout: exploreLayout,
      menuLayout: menuLayout,
      primaryColor: primaryColor,
      secondaryColor: secondaryColor,
      businessType: businessData?.businessType || "FOOD",
    }
    mutate(payload)
    updateThemeData({
      exploreLayout: exploreLayout,
      menuLayout: menuLayout,
      primaryColor: primaryColor,
      secondaryColor: secondaryColor,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 rounded-t-3xl to-white">

      <main className="max-w-7xl mx-auto px-4 py-8 pb-[7rem]">
        {/* Phone Previews */}
        <section className="md:grid md:grid-cols-2 md:gap-0 justify-items-center pb-12 flex overflow-x-auto space-x-4 px-4 scrollbar-hide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative min-w-[280px]" // Ensures items remain the correct size while scrolling
          >
            <IphoneExplore
              key={`${primaryColor}${secondaryColor}1`}
              width={280}
              height={560}
              primary={primaryColor}
              secondary={secondaryColor}
            />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-md text-sm font-medium">
              Explore View
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative min-w-[280px]" // Ensures items remain the correct size while scrolling
          >
            <IphoneCategory
              key={`${primaryColor}${secondaryColor}2`}
              width={280}
              height={560}
              primary={primaryColor}
              secondary={secondaryColor}
            />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-md text-sm font-medium">
              Category View
            </div>
          </motion.div>
        </section>

        {/* Color Selection */}
        <section className="space-y-8 max-w-2xl md:max-w-full mx-auto">
          <article className="md:flex md:justify-center md:items-center space-y-8 md:space-y-0 md:space-x-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Primary / Button Color</h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                {colors.map((color, index) => (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    key={`${color.primaryColor}${index}`}
                    style={{
                      backgroundColor: color.primaryColor,
                    }}
                    className={`w-12 h-12 rounded-full shadow-lg transition-shadow hover:shadow-xl ${primaryColor === color.primaryColor ? "ring-4 ring-offset-2 ring-blue-500" : ""
                      }`}
                    onClick={() => handlePrimaryColorChange(color.primaryColor)}
                  />
                ))}
              </div>
            </div>
            {primaryColor && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Best Paired Backgrounds</h3>
                {colors
                  .filter((color) => color.primaryColor === primaryColor)
                  .map((color, index) => (
                    <div
                      className="grid grid-cols-3 sm:grid-cols-4 gap-4"
                      key={`${color.primaryColor}${index}`}
                    >
                      {color.subColors.map((subColor) => (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          key={subColor.id}
                          className={`w-16 h-16 rounded-full shadow-lg transition-shadow hover:shadow-xl ${secondaryColor === subColor.secondaryColor ? "ring-4 ring-offset-2 ring-blue-500" : ""
                            }`}
                          style={{
                            background: `linear-gradient(45deg, ${primaryColor} 50%, ${subColor.secondaryColor} 50%)`,
                          }}
                          onClick={() => handleSecondaryColorChange(subColor.secondaryColor)}
                        />
                      ))}
                    </div>
                  ))}
              </div>
            )}
          </article>

          {secondaryColor && (
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Final Pair</h3>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleOpen("primary")}
                  className="w-full sm:w-40 h-20 rounded-2xl shadow-lg flex items-center justify-center font-mono text-sm transition-shadow hover:shadow-xl"
                  style={{
                    backgroundColor: primaryColor,
                    color: secondaryColor,
                  }}
                >
                  {primaryColor}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={swapColors}
                  className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all"
                >
                  <ArrowLeftRight className="w-6 h-6" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleOpen("secondary")}
                  className="w-full sm:w-40 h-20 rounded-2xl shadow-lg flex items-center justify-center font-mono text-sm transition-shadow hover:shadow-xl"
                  style={{
                    backgroundColor: secondaryColor,
                    color: primaryColor,
                  }}
                >
                  {secondaryColor}
                </motion.button>
              </div>
            </div>
          )}
        </section>

        {/* Save Button */}
        <MotionButton onClick={apiCall} buttonName="Save Colors" type="button" />
      </main>

      {open && (
        <PopUp show={open} onClose={handleClose}>
          <ColorWheel close={handleClose} colorType={colorType} />
        </PopUp>
      )}
    </div>
  )
}

const Setting = memo(MemoSetting)
export default Setting

