import { useState, useEffect, useCallback } from "react";
import { IphoneCategory, IphoneExplore } from "@/components/atom/svgtheme";
import useBusinessCtrl from "@/components/store/useBusinessCtrl";
import { colors } from "./businessCtrlStore";
import { CgArrowsHAlt } from "react-icons/cg";
import PopUp from "@/components/atom/popUp";
import ColorWheel from "@/components/atom/colorWheel";
import { apiRpc } from "@hi/common";
import { useUserToken } from "@/components/store/useUserToken";
import useBusinessData from "@/components/store/useBusinessData";

const Setting = () => {
  const {
    primaryColor,
    secondaryColor,
    exploreLayout,
    menuLayout,
    setPrimaryColor,
    setSecondaryColor,
    setStep,
  } = useBusinessCtrl((s) => ({
    primaryColor: s.primaryColor,
    secondaryColor: s.secondaryColor,
    setPrimaryColor: s.setPrimaryColor,
    setSecondaryColor: s.setSecondaryColor,
    setStep: s.setStep,
    exploreLayout:s.exploreLayout,
    menuLayout:s.menuLayout
  }));

  const businessData = useBusinessData(s=>s.businessData)

  const [selectedPrimaryColor, setSelectedPrimaryColor] =
    useState(primaryColor);
  const [selectedSecondaryColor, setSelectedSecondaryColor] =
    useState(secondaryColor);

    const {accessToken, refreshToken} = useUserToken(s=>({
      refreshToken:s.refreshToken,
      accessToken:s.accessToken
    }))

  const [open, setOpen] = useState(false);
  const [colorType, setColorType] = useState<"primary" | "secondary">(
    "primary",
  );

  const handleOpen = useCallback((type: "primary" | "secondary") => {
    setColorType(type);
    setOpen(true);
  }, []);
  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  useEffect(() => {
    setSelectedPrimaryColor(primaryColor);
    setSelectedSecondaryColor(secondaryColor);
  }, [primaryColor, secondaryColor]);

  const handlePrimaryColorChange = (color: string) => {
    setSelectedPrimaryColor(color);
    setPrimaryColor(color);
  };

  const handleSecondaryColorChange = (color: string) => {
    setSelectedSecondaryColor(color);
    setSecondaryColor(color);
  };

  const swapColors = () => {
    const [primary, secondary] = [selectedPrimaryColor, selectedSecondaryColor];
    setSelectedPrimaryColor(secondary);
    setSelectedSecondaryColor(primary);
    setPrimaryColor(secondary);
    setSecondaryColor(primary);
  };

  const apiCall = async() => {
    
    const res = await apiRpc.businesses[":businessId"].$put({
      header:{
        x_access_token:accessToken,
        x_refresh_token:refreshToken
      },
      json:{
        exploreLayout:exploreLayout,
        menuLayout:menuLayout,
        primaryColor:primaryColor,
        secondaryColor:secondaryColor,
        businessType:businessData?.businessType || "FOOD"
      },
      param:{
        businessId:businessData?._id
      }
    })
    if(res.status===200 || res.status ===201 ){
    setStep(4);
    }
  };

  return (
    <>
      <section className="explore_page_container">
        <article className="flex justify-center gap-4 m-4">
          <IphoneExplore
            key={`${selectedPrimaryColor}${selectedSecondaryColor}1`}
            width={200}
            height={400}
            primary={selectedPrimaryColor}
            secondary={selectedSecondaryColor}
          />
          <IphoneCategory
            key={`${selectedPrimaryColor}${selectedSecondaryColor}2`}
            width={200}
            height={400}
            primary={selectedPrimaryColor}
            secondary={selectedSecondaryColor}
          />
        </article>
        <article className="!px-4 pt-0 space-y-4 explore_page_selection md:pt-4 lg:pt-4 h-[70vh]">
          <h3 className="pt-4 opacity-50">Primary / button color </h3>
          <div className="flex gap-4">
            {colors.map((color, index) => (
              <button
                type="button"
                key={`${color.primaryColor}${index}`}
                style={{
                  backgroundColor: color.primaryColor,
                  width: "35px",
                  height: "35px",
                  cursor: "pointer",
                }}
                className="rounded-full"
                onClick={() => handlePrimaryColorChange(color.primaryColor)}
              />
            ))}
          </div>
          <h3 className="pt-4 opacity-50">Best paired backgrounds </h3>

          {selectedPrimaryColor && (
            <section>
              {colors
                .filter((color) => color.primaryColor === selectedPrimaryColor)
                .map((color, index) => (
                  <div
                    className="flex space-x-4"
                    key={`${color.primaryColor}${index}`}
                  >
                    {color.subColors.map((subColor) => (
                      <button
                        type="button"
                        key={subColor.id}
                        className="rounded-full"
                        style={{
                          background: `linear-gradient(to right, ${selectedPrimaryColor} 50%, ${subColor.secondaryColor} 50%)`,
                          width: "50px",
                          height: "50px",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          handleSecondaryColorChange(subColor.secondaryColor)
                        }
                      />
                    ))}
                  </div>
                ))}
            </section>
          )}
          <h3 className="pt-4 opacity-50">Final pair</h3>
          {selectedSecondaryColor && (
            <section>
              <div className="flex items-center justify-center gap-4 pb-4">
                <button
                  type="button"
                  onClick={() => handleOpen("primary")}
                  value={selectedPrimaryColor}
                  className="p-6 rounded-xl"
                  style={{
                    backgroundColor: selectedPrimaryColor,
                    color: selectedSecondaryColor,
                  }}
                >
                  {primaryColor}{" "}
                </button>
                <button
                  type="button"
                  onClick={swapColors}
                  className="h-10 px-4 rounded-xl outline"
                >
                  <CgArrowsHAlt />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpen("secondary")}
                  value={selectedSecondaryColor}
                  style={{
                    backgroundColor: selectedSecondaryColor,
                    color: selectedPrimaryColor,
                  }}
                  className="p-6 rounded-xl"
                >
                  {" "}
                  {secondaryColor}
                </button>
              </div>
            </section>
          )}
        </article>
      </section>
      {open && (
        <PopUp show={open} onClose={handleClose}>
          <ColorWheel close={handleClose} colorType={colorType} />
        </PopUp>
      )}
      <button
        type="button"
        className="bottom_btn"
        onClick={apiCall}
      >
        Save Colors
      </button>
    </>
  );
};

export default Setting;
