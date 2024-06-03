import QuantityPickerNonOutline from "@/components/atoms/quantityPicker/quantityPickerNonOutline";
import Section from "@/components/molecules/section";
import { useBottomPanel } from "@/components/store/useBottomPanel";
import { useCart } from "@/components/store/useCart";
import type { IDish, IExtraItem } from "@/components/types/hiTableData";
import { getPrice } from "@/components/utils/helpers";
import { camelCase, isEmpty } from "lodash-es";
import { useRouter } from "next/router";
import { memo, useEffect, useState } from "react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";

function ExtraWithDishWithSelect({ dishData }: { dishData: IDish }) {
  // setValidationRef validates the compulsory items
  const setValidationRef = useBottomPanel((s) => s.setValidationRef);
  // count of extras selected
  const [selectedItemsCount, setSelectedItemsCount] = useState<
    Record<string, any>
  >({});
  const validationExtras = useBottomPanel((s) => s.validationExtras);
  // displaying alert if crosses more numSelections
  const displayAlert = useBottomPanel((s) => s.displayAlert);
  const setDisplayAlert = useBottomPanel((s) => s.setDisplayAlert);
  const setValidationExtras = useBottomPanel((s) => s.setValidationExtras);
  // array of boolean values indicating
  const [activeIndex, setActiveIndex] = useState(0);
  const [toggleUp, setToggleUp] = useState(false);
  const cartItem = useCart((s) => s.cart);
  const setCartItem = useCart((s) => s.setCart);
  const bounceButton = useBottomPanel((s) => s.bounceButton);
  const setVariantType = useBottomPanel((s) => s.setVariantType);
  const router = useRouter();
  let { tableId } = router.query as { tableId: string };
  if (!tableId) {
    tableId = "012345";
  }
  // items selected inside extras to click add to dish cart
  const [selectedItems, setSelectedItems] = useState({});
  useEffect(() => {
    validateCompulsoryExtras();
  }, [cartItem]);

  useEffect(() => {
    const extra = dishData?.extras;
    const portion = dishData?.portions;
    if (extra?.length > 0 && portion?.length === 0) {
      setVariantType("extra");
    } else if (portion?.length > 0 && extra?.length === 0) {
      setVariantType("portion");
    } else if (extra?.length > 0 && portion?.length > 0) {
      setVariantType("all");
    }
  }, [cartItem]);
  const extras = dishData?.extras?.[0]?.items || [];
  useEffect(() => {
    console.log(cartItem)
  }, [cartItem]);
  const handleQuantityChange = (
    newQuantity,
    item: IExtraItem,
    itemId: string
  ) => {
    const tableCart = structuredClone(cartItem[tableId]) || {}; // Access the cart for the specific table
    const dishCart = tableCart[dishData.id] || {
      dishData: dishData,
      variants: [],
    };
    const lastIndex = dishCart.variants.length - 1;
    if (lastIndex >= 0) {
      const variant = dishCart.variants[lastIndex];
      variant.extra = variant.extra || {};
      if (newQuantity === 0) {
        delete variant.extra[itemId];
      } else {
        variant.extra[itemId] = {
          ...item,
          quantity: newQuantity,
        };
      }
    }
    setCartItem(tableId, dishData.id, dishCart);
  };

  const getQuantity = (itemId: string) => {
    const tableCart = cartItem[tableId] || {};
    const dishCart = tableCart[dishData?.id] || {};
    const lastIndex = dishCart.variants?.length - 1 || 0;
    return dishCart.variants?.[lastIndex]?.extra?.[itemId]?.quantity || 0;
  };
  if (isEmpty(extras)) {
    return null;
  }
  const handleAccordionClick = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
    setToggleUp(!toggleUp);
  };
  function validateCompulsoryExtras() {
    const tableCart = cartItem[tableId] || {};
    const dishCart = tableCart?.[dishData?.id] || {};
    const lastIndex = dishCart.variants?.length
      ? dishCart.variants.length - 1
      : 0;
    const variantsExtra = dishCart.variants?.[lastIndex]?.extra || {};
    let newValidationResults = [...validationExtras]
    let newSelectedItemsCount = { ...selectedItemsCount }
    let newSelectionsCount: any = []
    let selectedCount: number = 0
    dishData.extras.forEach((extra, index) => {
      let selectedItemsSet: { [key: string]: number } = {}
      extra.items.forEach((item) => {
        Object.values(variantsExtra).forEach((variantExtra: any) => {
          if (variantExtra?.id === item?.id) {
            selectedItemsSet[variantExtra?.id] = variantExtra?.quantity
            return setSelectedItems(selectedItemsSet)
          }
        })
      })
      selectedCount = Object.values(selectedItemsSet).reduce((a, b) => a + b, 0)
      newSelectionsCount[index] = selectedCount === extra?.maxQuantity
      newSelectedItemsCount[extra?.id] = selectedCount
      newValidationResults[index] = selectedCount >= extra.compulsory
    })
    setSelectedItemsCount(newSelectedItemsCount)
    setValidationExtras(newValidationResults)
    const isValid = newValidationResults.every((result) => result)
    setValidationRef(isValid)
    return isValid
  }

  const disableExtra = (extra, item) => {
    if (selectedItemsCount[extra?.id] === undefined) return
    let itemIsSelected = false
    Object.keys(selectedItems).forEach((itemKey: any) => {
      if (itemKey === item?.id || itemKey === item?.name) {
        itemIsSelected = true
      } else {
        itemIsSelected = true
      }
    })
    if (extra?.id !== '') {
      return selectedItemsCount[extra?.id] >= extra?.maxQuantity && !itemIsSelected
    }
  }
  function displayAlertPopUp() {
    if (displayAlert) {
      return;
    }
    setDisplayAlert(true);
    setTimeout(() => {
      return setDisplayAlert(false);
    }, 5000);
  }
  return (
    <>
      {/* Toggle Extra */}
      <div className="">
        <Section
          title={"Extras"}
          tag="h5"
          tagClassName="mx-2 font-semibold text-base-content !text-xl"
        >
          {" "}
        </Section>
      </div>

      {/* Extra description */}
      <div className="overflow-x-auto">
        {dishData.extras
          .sort((a, b) => b.compulsory - a.compulsory)
          .map((extra, extraIndex) => (
            <div
              key={extraIndex}
              className="extra-section bg-base-300/10 mb-[2rem]"
            >
              <div
                onClick={() => handleAccordionClick(extraIndex)}
                className="flex justify-between py-3 mx-6 prose cursor-pointer"
              >
                <div
                  className={`${bounceButton && !validationExtras[extraIndex]
                    ? "animation-bounce"
                    : ""
                    }`}
                >
                  <h5 className="w-[12rem] text-sm font-medium capitalize text-base-content">
                    {extra?.name || ""}
                  </h5>
                  {extra?.compulsory >= 0 && (
                    <span
                      className={`text-xs font-normal ${extra?.compulsory === 0 ? "" : "!text-primary "
                        }`}
                    >
                      Select up to {extra?.maxQuantity} (
                      {extra?.compulsory > 0 ? " " + extra?.compulsory : ""}{" "}
                      {extra?.compulsory > 0 ? "Required " : " Optional"} )
                    </span>
                  )}
                </div>
                <div className="flex">
                  {extra?.compulsory > 0 && (
                    <div className="w-8 text-sm ">
                      {Object.values(selectedItemsCount)[extraIndex]}/{extra?.id ? extra.maxQuantity : extra?.numSelections}
                    </div>
                  )}
                  <div className="flex justify-self-end">
                    {activeIndex === extraIndex ? (
                      <BsChevronUp className="stroke-1" />
                    ) : (
                      <BsChevronDown className="stroke-1" />
                    )}
                  </div>
                </div>
              </div>
              {activeIndex === extraIndex && (
                <div className="pb-4">
                  <div className="max-h-screen mx-6 overflow-auto transition-all duration-500 ease-in-out border opacity-100 rounded-xl border-primary">
                    <table className="table w-full table-compact table-zebra ">
                      <tbody>
                        {(extra?.items || []).map((item, index) => {
                          let itemId: string = '';
                          if (item?.id !== undefined) {
                            itemId = item?.id
                          } else if (item?.name) {
                            itemId = camelCase(item?.name + extraIndex)
                          }
                          const isDisabled = disableExtra(extra, item);
                          return (
                            <tr
                              className={`flex flex-row transition-all  ${(getQuantity(itemId) === item?.maxQuantity || selectedItemsCount[extra?.id] === extra?.maxQuantity) &&
                                getQuantity(itemId) === 0 &&
                                extra?.name
                                ? "opacity-50"
                                : "opacity-100"
                                }`}
                              key={index}
                            >
                              <td className='min-h-16 max-h-20 !pl-3 !text-xs w-1/3 flex flex-col flex-wrap'>
                                <span className='w-full my-auto capitalize whitespace-pre-wrap'>
                                  {item?.name || ''}
                                </span>
                                <sub className='pb-2 text-[0.65rem]'>
                                  Max:{item?.maxQuantity}
                                </sub>
                              </td>
                              <td className=" !text-xs w-1/3 text-center font-semibold flex flex-row">
                                <span className="mx-auto my-auto ">
                                  {getPrice(item?.price || 0)}
                                </span>
                              </td>
                              <td className=" !text-xs w-1/3 text-center font-semibold flex flex-row">
                                <span className="pr-2 my-auto ml-auto">
                                  <QuantityPickerNonOutline
                                    quantity={getQuantity(itemId)}
                                    setQuantity={(q) =>
                                      handleQuantityChange(q, item, itemId)
                                    }
                                    minQuantity={0}
                                    extra={extra}
                                    item={item}
                                    selectedItemsCount={selectedItemsCount}
                                    isDisabled={isDisabled}
                                    displayAlertPopUp={displayAlertPopUp}
                                  />
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </>
  );
}

export default memo(ExtraWithDishWithSelect);
