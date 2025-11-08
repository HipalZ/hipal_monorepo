import ColorWheel from '@/components/atom/colorWheel';
import MotionButton from '@/components/atom/motionButton';
import PopUp from '@/components/atom/popUp';
import { IphoneCategory, IphoneExplore } from '@/components/atom/svgtheme';
import useBusinessCtrl from '@/components/store/useBusinessCtrl';
import useBusinessData from '@/components/store/useBusinessData';
import { useLayoutThemes } from '@/hooks/useLayoutThemes';
import { motion } from 'framer-motion';
import { ArrowLeftRight } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { colors } from './businessCtrlStore';

const MemoSetting = () => {
  const primaryColor = useBusinessCtrl((s) => s.primaryColor);
  const secondaryColor = useBusinessCtrl((s) => s.secondaryColor);
  const exploreLayout = useBusinessCtrl((s) => s.exploreLayout);
  const menuLayout = useBusinessCtrl((s) => s.menuLayout);
  const setPrimaryColor = useBusinessCtrl((s) => s.setPrimaryColor);
  const setSecondaryColor = useBusinessCtrl((s) => s.setSecondaryColor);

  const { mutate } = useLayoutThemes();

  const businessData = useBusinessData((s) => s.businessData);
  const updateThemeData = useBusinessData((s) => s.updateThemeData);

  const [open, setOpen] = useState(false);
  const [colorType, setColorType] = useState<'primary' | 'secondary'>('primary');

  const handleOpen = useCallback((type: 'primary' | 'secondary') => {
    setColorType(type);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handlePrimaryColorChange = useCallback(
    (color: string) => {
      setPrimaryColor(color);
    },
    [setPrimaryColor],
  );

  const handleSecondaryColorChange = useCallback(
    (color: string) => {
      setSecondaryColor(color);
    },
    [setSecondaryColor],
  );

  const swapColors = useCallback(() => {
    setPrimaryColor(secondaryColor);
    setSecondaryColor(primaryColor);
  }, [primaryColor, secondaryColor, setPrimaryColor, setSecondaryColor]);

  const apiCall = async () => {
    const payload = {
      exploreLayout: exploreLayout,
      menuLayout: menuLayout,
      primaryColor: primaryColor,
      secondaryColor: secondaryColor,
      businessType: businessData?.businessType || 'FOOD',
    };
    mutate(payload);
    updateThemeData({
      exploreLayout: exploreLayout,
      menuLayout: menuLayout,
      primaryColor: primaryColor,
      secondaryColor: secondaryColor,
    });
  };

  return (
    <div className="min-h-screen rounded-t-3xl bg-gradient-to-b from-purple-50 to-white">
      <main className="mx-auto max-w-7xl px-4 py-8 pb-[7rem]">
        {/* Phone Previews */}
        <section className="scrollbar-hide flex justify-items-center space-x-4 overflow-x-auto px-4 pb-12 md:grid md:grid-cols-2 md:gap-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative min-w-[280px]" // Ensures items remain the correct size while scrolling
          >
            <IphoneExplore key={`${primaryColor}${secondaryColor}1`} width={280} height={560} primary={primaryColor} secondary={secondaryColor} />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-sm font-medium shadow-md">
              Explore View
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative min-w-[280px]" // Ensures items remain the correct size while scrolling
          >
            <IphoneCategory key={`${primaryColor}${secondaryColor}2`} width={280} height={560} primary={primaryColor} secondary={secondaryColor} />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-sm font-medium shadow-md">
              Category View
            </div>
          </motion.div>
        </section>

        {/* Color Selection */}
        <section className="mx-auto max-w-2xl space-y-8 md:max-w-full">
          <article className="space-y-8 md:flex md:items-center md:justify-center md:space-x-8 md:space-y-0">
            <div>
              <h3 className="mb-4 text-lg font-medium text-gray-900">Primary / Button Color</h3>
              <div className="grid grid-cols-4 gap-4 sm:grid-cols-6">
                {colors.map((color, index) => (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    key={`${color.primaryColor}${index}`}
                    style={{
                      backgroundColor: color.primaryColor,
                    }}
                    className={`h-12 w-12 rounded-full shadow-lg transition-shadow hover:shadow-xl ${
                      primaryColor === color.primaryColor ? 'ring-4 ring-blue-500 ring-offset-2' : ''
                    }`}
                    onClick={() => handlePrimaryColorChange(color.primaryColor)}
                  />
                ))}
              </div>
            </div>
            {primaryColor && (
              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-900">Best Paired Backgrounds</h3>
                {colors
                  .filter((color) => color.primaryColor === primaryColor)
                  .map((color, index) => (
                    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4" key={`${color.primaryColor}${index}`}>
                      {color.subColors.map((subColor) => (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          key={subColor.id}
                          className={`h-16 w-16 rounded-full shadow-lg transition-shadow hover:shadow-xl ${
                            secondaryColor === subColor.secondaryColor ? 'ring-4 ring-blue-500 ring-offset-2' : ''
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
              <h3 className="mb-4 text-lg font-medium text-gray-900">Final Pair</h3>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleOpen('primary')}
                  className="flex h-20 w-full items-center justify-center rounded-2xl font-mono text-sm shadow-lg transition-shadow hover:shadow-xl sm:w-40"
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
                  className="rounded-full bg-white p-3 shadow-lg transition-all hover:shadow-xl"
                >
                  <ArrowLeftRight className="h-6 w-6" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleOpen('secondary')}
                  className="flex h-20 w-full items-center justify-center rounded-2xl font-mono text-sm shadow-lg transition-shadow hover:shadow-xl sm:w-40"
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
  );
};

const Setting = memo(MemoSetting);
export default Setting;
