import MemoizedHeader from "@/components/molecules/header";
import { lazy, memo, startTransition, Suspense, useCallback } from "react";
import { FaArrowLeft, FaChevronRight } from "react-icons/fa";
import Hi from "@/assets/svg/hi.svg";
import { useNavigate, useParams } from "react-router-dom";
import { useLoyalty } from "@/components/store/useLoyalty";
import SelectCardFromBottom from "./bottomSelectionPanel";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import useBusinessData from "@/components/store/useBusinessData";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import PopUp from "@/components/atom/popUp";
import BottomButton from "@/components/atom/bottomButton";
import { apiRpc } from "@hi/common";
import toast from "react-hot-toast";

const CardOneLayout = lazy(() => import("./cardOne"));
const CardTwoLayout = lazy(() => import("./cardTwo"));
const CardThreeLayout = lazy(() => import("./cardThree"));
const CardFourLayout = lazy(() => import("./cardFour"));
const CardFiveLayout = lazy(() => import("./cardFive"));
const CardSixLayout = lazy(() => import("./cardSix"));
const SignupBonus = lazy(() => import("./signupBonus"));
const CoinzBack = lazy(() => import("./coinzBack"));
const MaxRedemption = lazy(() => import("./maximumRedeem"));
const ResetExpiry = lazy(() => import("./reset&Expiry"));

const calculateDaysRemaining = (timestamp: number) => {
  const today = new Date();
  const expiryDate = new Date(timestamp);
  const timeDiff = expiryDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return daysRemaining;
};

const MemoCardSelection = () => {
  const {
    setSelectedPage,
    selectedCardType,
    openModal,
    setOpenModal,
    changeModalLayout,
    setChangeModalLayout,
    signupBonus,
    coinzBack,
    resetExpiry,
    selectedCardLayout,
    maxRedemption,
    resetFields,
    loyaltyID,
    loyaltyStartDate,
    cardColor,
  } = useLoyalty((state) => ({
    setSelectedPage: state.setSelectedPage,
    selectedCardType: state.selectedCardType,
    openModal: state.openModal,
    setOpenModal: state.setOpenModal,
    setChangeModalLayout: state.setChangeModalLayout,
    changeModalLayout: state.changeModalLayout,
    signupBonus: state.signupBonus,
    coinzBack: state.coinzBack,
    resetExpiry: state.resetExpiry,
    selectedCardLayout: state.selectedCardLayout,
    maxRedemption: state.maxRedemption,
    resetFields: state.resetFields,
    loyaltyID: state.loyaltyID,
    loyaltyStartDate: state.loyaltyStartDate,
    cardColor: state.cardColor,
  }));

  const logo = useBusinessData((state) => state?.businessData?.logo);
  const name = useOwnerLogin((state) => state?.user?.name);
  const businessId = useParams()?.businessId;
  const navigate = useNavigate();

  const goBack = useCallback(() => {
    startTransition(() => {
      navigate(`/app/business/${businessId}`);
    });
  }, [setSelectedPage]);

  const LoyaltyToggleArray = [
    {
      heading: "Signup bonus",
      subHeading:
        "How much coinz do your customers get at the very first time How much coinz do your ",
      navigate: () => setChangeModalLayout("SIGNUP_BONUS"),
      key: `₹ ${signupBonus}`,
    },
    {
      heading: "Coinz back after payments ",
      subHeading: "How much will your customers get back after ",
      navigate: () => setChangeModalLayout("COINZ_BACK"),
      key: `${coinzBack} %`,
    },
    {
      heading: "Maximum Redemption",
      subHeading:
        "User can redeem maximum of this percentage of coinz in a single transaction",
      navigate: () => setChangeModalLayout("MAXIMUM_REDEMPTION"),
      key: `${maxRedemption} %`,
    },
    {
      heading: "Reset & Expiry ",
      subHeading:
        "The card would reset all its coinz for all users within this time frame",
      navigate: () => setChangeModalLayout("RESET_EXPIRY"),
      key: `${calculateDaysRemaining(resetExpiry)} days`,
    },
    // {
    //   heading: "Terms & Conditions",
    //   subHeading:
    //     "The card would reset all its coinz for all users within this time frame",
    //   navigate: () => setChangeModalLayout("TERMS&CONDITION"),
    // },
  ];

  const letsStartTheLoyalty = useCallback(() => {
    setChangeModalLayout("SIGNUP_BONUS");
    setOpenModal(true);
  }, []);

  const closeModalFunc = useCallback(() => {
    setOpenModal(false);
    setChangeModalLayout("");
    if (loyaltyID === "") {
      resetFields();
    }
  }, []);

  const dynamicHeadingForModal = useCallback(() => {
    switch (changeModalLayout) {
      case "SIGNUP_BONUS":
        return "Signup Bonus";
      case "COINZ_BACK":
        return "Coinz Back";
      case "RESET_EXPIRY":
        return "Reset & Expiry";
      case "MAXIMUM_REDEMPTION":
        return "Maximum Redemption";
      case "TERMS&CONDITION":
        return "Terms & Conditions";
      default:
        return "Loyalty Card";
    }
  }, [changeModalLayout]);

  const step = useCallback(() => {
    switch (changeModalLayout) {
      case "SIGNUP_BONUS":
        return "1/4";
      case "COINZ_BACK":
        return "2/4";
      case "MAXIMUM_REDEMPTION":
        return "3/4";
      case "RESET_EXPIRY":
        return "4/4";
      default:
        return "0/4";
    }
  }, [changeModalLayout]);

  const goToPreviousPage = useCallback(() => {
    switch (changeModalLayout) {
      case "SIGNUP_BONUS":
        setOpenModal(false);
        break;
      case "COINZ_BACK":
        setChangeModalLayout("SIGNUP_BONUS");
        break;
      case "MAXIMUM_REDEMPTION":
        setChangeModalLayout("COINZ_BACK");
        break;
      case "RESET_EXPIRY":
        setChangeModalLayout("MAXIMUM_REDEMPTION");
        break;
      case "TERMS&CONDITION":
        setChangeModalLayout("RESET_EXPIRY");
        break;
      default:
        break;
    }
  }, [changeModalLayout]);

  const goToNextStep = useCallback(() => {
    switch (changeModalLayout) {
      case "SIGNUP_BONUS":
        setChangeModalLayout("COINZ_BACK");
        break;
      case "COINZ_BACK":
        setChangeModalLayout("MAXIMUM_REDEMPTION");
        break;
      case "MAXIMUM_REDEMPTION":
        setChangeModalLayout("RESET_EXPIRY");
        break;
      case "RESET_EXPIRY":
        setChangeModalLayout("TERMS&CONDITION");
        break;
      case "TERMS&CONDITION":
        setOpenModal(false);
        break;
      default:
        break;
    }
  }, [changeModalLayout]);

  const saveLoyalty = useCallback(async () => {
    if (!selectedCardType) {
      return toast.error("Please select a card type");
    }
    const payload = {
      businessId: businessId ?? "",
      loyaltyId: businessId ?? "",
      setCashBackPercentage: coinzBack,
      setClaimedPercentage: maxRedemption,
      loyaltyExpiryDate: resetExpiry,
      signUpBonus: signupBonus,
      rewardLimit: 4999,
      cardType: selectedCardType || "CARD_ONE",
      cardLayout: selectedCardLayout || "LAYOUT_THREE",
      loyaltyStartDate: loyaltyStartDate,
      cardColor: cardColor,
    };

    try {
      const response = await apiRpc.businesses[":businessId"].loyalty.$post({
        param: {
          businessId: businessId,
        },
        json: payload,
      });

      if (response.ok) {
        toast.success("Loyalty settings saved successfully!");
        resetFields();
        setOpenModal(false);
        startTransition(() => {
          navigate(`/app/business/${businessId}`);
        });
      } else {
        toast.error("Failed to save loyalty settings.");
      }
    } catch (error) {
      console.error("An error occurred while saving loyalty settings:", error);
    }
  }, [
    businessId,
    selectedCardType,
    selectedCardLayout,
    signupBonus,
    coinzBack,
    resetExpiry,
    maxRedemption,
  ]);

  const updateLoyalty = useCallback(async () => {
    const payload = {
      setCashBackPercentage: coinzBack,
      setClaimedPercentage: maxRedemption,
      loyaltyExpiryDate: resetExpiry,
      signUpBonus: signupBonus,
      cardType: selectedCardType,
      cardLayout: selectedCardLayout,
      loyaltyStartDate: loyaltyStartDate,
      cardColor: cardColor,
    };

    try {
      const response = await apiRpc.businesses[":loyaltyId"].loyalty.$put({
        param: {
          loyaltyId: loyaltyID,
        },
        json: payload,
      });

      if (response.ok) {
        toast.success("Loyalty settings updated successfully!");
        resetFields();
        setOpenModal(false);
        startTransition(() => {
          navigate(`/app/business/${businessId}`);
        });
      } else {
        toast.error("Failed to update loyalty settings.");
      }
    } catch (error) {
      console.error(
        "An error occurred while updating loyalty settings:",
        error,
      );
    }
  }, [
    businessId,
    selectedCardType,
    selectedCardLayout,
    signupBonus,
    coinzBack,
    resetExpiry,
    maxRedemption,
    loyaltyID,
  ]);

  return (
    <center>
      <article className="sticky top-0 z-50 bg-white md:bg-transparent lg:bg-transparent">
        <MemoizedHeader
          title="Loyalty CardZ"
          onBack={goBack}
          leftIcon={<FaArrowLeft />}
          isIconBusinessShow={false}
        />
      </article>
      <section className="bg-white md:bg-transparent lg:mt-[2rem] lg:bg-transparent h-[18rem] items-center lg:justify-center flex flex-col lg:flex-row gap-4 lg:gap-[4rem] lg:mx-[6rem]">
        <article className="w-[23.5rem] lg:h-[18rem] bg-white rounded-2xl md:scale-125 lg:scale-125 md:mt-[3rem]">
          <Suspense
            fallback={
              <div>
                <LoadingSpinner />
              </div>
            }
          >
            {selectedCardType === "CARD_ONE" && (
              <CardOneLayout name={name} logo={logo} />
            )}
            {selectedCardType === "CARD_TWO" && (
              <CardTwoLayout name={name} logo={logo} />
            )}
            {selectedCardType === "CARD_THREE" && (
              <CardThreeLayout name={name} logo={logo} />
            )}
            {selectedCardType === "CARD_FOUR" && (
              <CardFourLayout name={name} logo={logo} />
            )}
            {selectedCardType === "CARD_FIVE" && (
              <CardFiveLayout name={name} logo={logo} />
            )}
            {selectedCardType === "CARD_SIX" && (
              <CardSixLayout name={name} logo={logo} />
            )}
          </Suspense>

          <SelectCardFromBottom />
        </article>
        {loyaltyID && (
          <section className="m-4 w-[92%] max-w-[26rem] mt-0 md:mt-4 pb-[7rem] lg:mt-[11.5rem]">
            {LoyaltyToggleArray.map((item) => (
              <button
                type="button"
                key={item.heading.length}
                onClick={() => {
                  setOpenModal(true);
                  item.navigate();
                }}
                className="relative w-full bg-[#ffffff] rounded-xl text-left p-4 mt-4"
              >
                <h3 className="font-[600]">
                  {item.heading}{" "}
                  <span className="text-[#8C63FF]">{item.key}</span>
                </h3>
                <h6 className="mt-2 text-xs leading-4 opacity-50">
                  {item.subHeading}
                </h6>
                <FaChevronRight
                  size={20}
                  className="absolute font-thin top-3 right-3"
                />
              </button>
            ))}
          </section>
        )}
      </section>
      {openModal && (
        <PopUp
          width="w-[30rem]"
          height="h-[20rem]"
          show={openModal}
          onClose={closeModalFunc}
        >
          <section>
            <MemoizedHeader
              title={dynamicHeadingForModal()}
              onBack={goToPreviousPage}
              leftIcon={<FaArrowLeft />}
              isIconBusinessShow={false}
              rightButton={<div className="font-semibold">{step()}</div>}
            />
            <Suspense fallback={<LoadingSpinner />}>
              {changeModalLayout === "SIGNUP_BONUS" && <SignupBonus />}
              {changeModalLayout === "COINZ_BACK" && <CoinzBack />}
              {changeModalLayout === "MAXIMUM_REDEMPTION" && <MaxRedemption />}
              {changeModalLayout === "RESET_EXPIRY" && <ResetExpiry />}
            </Suspense>
            {changeModalLayout === "RESET_EXPIRY" ? (
              <BottomButton
                buttons={[
                  {
                    text: loyaltyID ? "update" : "save",
                    onClick: loyaltyID ? updateLoyalty : saveLoyalty,
                    type: "button",
                  },
                ]}
              />
            ) : (
              <BottomButton
                buttons={[
                  {
                    text: "back",
                    onClick: goToPreviousPage,
                    type: "button",
                  },
                  {
                    text: "Next",
                    onClick: goToNextStep,
                    type: "button",
                  },
                ]}
              />
            )}
          </section>
        </PopUp>
      )}

      <button
        onClick={letsStartTheLoyalty}
        type="button"
        className="bottom_btn"
      >
        Set Parameter to save card
      </button>
    </center>
  );
};

const CardSelection = memo(MemoCardSelection);
export default CardSelection;
