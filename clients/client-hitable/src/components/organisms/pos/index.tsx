import axios from '@/axios';
import LoaderComponent from '@/components/atoms/coolLoader';
import DayOutPopup from '@/components/atoms/dayoutPopup';
import FoodType, { type FOOD_TYPES } from '@/components/atoms/foodType';
import InstructionInput from '@/components/atoms/instruction';
import InstructionItem from '@/components/atoms/instructionItem';
import MenuPopup from '@/components/molecules/menuPopup';
import NewDishMenu from '@/components/molecules/newDishMenu';
import { useBusinessStore } from '@/components/store/useBusinessData';
import { useCart } from '@/components/store/useCart';
import { useLogin } from '@/components/store/useLogin';
import { useSearch } from '@/components/store/useSearch';
import { useTable } from '@/components/store/useTable';
import type { IDish } from '@/components/types/hiTableData';
import { addInstruction, deleteInstruction } from '@/components/utils/helpers';
import { PAGE_TYPES, routePaths } from '@/components/utils/routes';
import { useRouter } from 'next/router';
import type React from 'react';
import { memo, useCallback, useEffect, useState } from 'react';
import { HiOutlineClipboardList, HiX } from 'react-icons/hi';
import { MdOutlineKeyboardArrowUp, MdOutlineWidgets } from 'react-icons/md';
import { RiShoppingBagLine } from 'react-icons/ri';
import { toast } from 'react-toastify';
import ChildCategory from '../category/childCategory';
import ParentCategory from '../category/parentCategory';

interface POSProps {
  activeButton: string;
  data: any;
  search: string;
}

const POSComponent: React.FC<POSProps> = ({ activeButton, data, search }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [menuModal, setMenuMOdal] = useState<boolean>(false);
  const cart = useCart((s) => s.cart);
  const setCart = useCart((s) => s.setCart);
  const clearCartForTable = useCart((s) => s.clearCartForTable);
  const deleteItem = useCart((s) => s.deleteItem);
  const tableData = useTable((s) => s.tableData);
  const { userDetails, phoneNumber } = useLogin();
  const [menu, setMenu] = useState('');
  const [instruction, setInstruction] = useState('');
  const [activeInputId, setActiveInputId] = useState(null);
  const [searchDishes, setSearchDishes] = useState<IDish[]>([]);
  const { searchHistory, setSearchHistory, isFocused } = useSearch();
  const router = useRouter();
  const businessData = useBusinessStore((s) => s.businessData);

  const [isSending, setIsSending] = useState(false);
  const { businessId, zoneId, tableId } = router.query as {
    businessId: string;
    zoneId: string;
    tableId: string;
  };
  const filteredCartItems = cart[tableId] ? Object.values(cart[tableId]) : [];

  const menuOpenModal = (str: string) => {
    setMenu(str);
    if (str === 'liveCart') {
      setIsModalOpen(true);
    }
    if (str === 'menubtn') {
      setMenuMOdal(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const closeMenuModal = () => {
    setMenuMOdal(false);
  };

  const childCategories = data?.categories ?? [];

  const organizeCategories = useCallback((categories) => {
    const parentChildrenMap = {};
    const parentDetailsMap = {};

    categories.map((category) => {
      if (category.hierarchy === 'PARENT') {
        parentDetailsMap[category._id] = {
          name: category.name,
          parentId: category._id,
        };
      }
    });

    categories.map((category) => {
      if (category.hierarchy === 'CHILD') {
        const { parentCategoryId, parentCategory } = category;
        if (!parentChildrenMap[parentCategoryId]) {
          parentChildrenMap[parentCategoryId] = {
            parentId: parentCategoryId,
            parentName: parentDetailsMap[parentCategoryId] ? parentDetailsMap[parentCategoryId].name : parentCategory,
            children: [],
          };
        }
        parentChildrenMap[parentCategoryId].children.push({
          name: category.name,
          id: category._id,
        });
      }
    });

    return Object.values(parentChildrenMap);
  }, []);

  const organizedData = organizeCategories(childCategories);

  const getDishPrice = (dishData: any, selectedPortion: any, selectedExtras: any) => {
    let price = 0;
    if (!selectedPortion) {
      price += dishData?.price || 0;
    } else {
      const flatPortions = dishData?.portions.flat();
      const portion = flatPortions?.find((portion) => portion?.name === selectedPortion);
      if (portion) {
        price += portion.price;
      }
    }

    // Add extra prices
    selectedExtras.forEach((extra: any) => {
      price += extra?.price * extra?.quantity;
    });

    return price?.toFixed(2);
  };

  const handleDeleteItem = (tableId: string, dishId: any, variantId: string) => {
    const tableCart = { ...cart[tableId] };

    const dishItem = tableCart[dishId];
    console.log(dishItem);
    if (dishItem) {
      const filteredVariants = dishItem.variants.filter((variant) => variant.id !== variantId);

      if (filteredVariants.length > 0) {
        const updatedDishItem = { ...dishItem, variants: filteredVariants };
        setCart(tableId, dishId, updatedDishItem);
      } else {
        deleteItem(tableId, dishId);
      }
    }
  };

  const sendCart = async () => {
    setIsSending(true);
    const time = new Date().toLocaleTimeString('it-IT');

    try {
      const config = {
        method: 'post',
        url: '/v1/kitchens/:id/waiter/kots',
        data: {
          businessId: businessId,
          zoneId: zoneId,
          tableId: tableId,
          tableName: tableData?.name,
          waiterName: userDetails?.name,
          waiterPhone: phoneNumber,
          timeWithSeconds: time,
          cart: cart[tableId],
        },
      };
      const res = await axios(config);
      if (businessData?.kotPrinter) {
        const config = {
          method: 'POST',
          url: 'https://ws.hipal.life',
          data: {
            businessId: businessId,
            payload: {
              tableName: tableData?.name,
              cart: cart[tableId],
              waiterName: userDetails?.name,
            },
          },
        };
        axios(config);
      }

      if (res.data.status) {
        closeModal();
        toast(`order placed successfully for ${tableData.name}`);
        clearCartForTable(tableId);
        router.push(routePaths[PAGE_TYPES.TABLES](businessId, zoneId));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    const tableCart = cart[tableId] || {};
    const isTableCartEmpty = Object.values(tableCart).filter((ele) => ele).length === 0;
    if (isTableCartEmpty) {
      closeModal();
    }
  }, [cart, tableId, closeModal]);

  useEffect(() => {
    const newSearchDishes: IDish[] = [];
    const dishIds = new Set<string>();

    if (search) {
      for (const category of childCategories) {
        for (const dish of category?.dishes) {
          const dishLower = dish?.name?.toLowerCase();
          if (dishLower.includes(search.toLowerCase()) && !dishIds.has(dish?._id)) {
            const dishWithParent = {
              ...dish,
              parentCategoryName: category.parentCategory ? category.parentCategory : category.name,
            };
            newSearchDishes.push(dishWithParent);
            dishIds.add(dish?._id);
          }
        }
      }
      setSearchDishes(newSearchDishes);

      // Call setSearchHistory for each new dish
      for (const dish of newSearchDishes) {
        if (!searchHistory.some((historyDish) => historyDish._id === dish._id)) {
          setSearchHistory(dish);
        }
      }
    }
  }, [search, childCategories]);

  return (
    <div>
      {activeButton.toLowerCase() === 'pos' && (
        <div>
          {search.length > 0 ? (
            <NewDishMenu category={searchDishes} show={true} />
          ) : isFocused && search?.length === 0 ? (
            <>
              <NewDishMenu category={searchHistory} show={true} />
            </>
          ) : (
            <ChildCategory childCategories={childCategories} show={false} />
          )}
          {organizedData.length > 0 && (
            <div
              className={`${
                Object.keys(cart).length === 0 ? 'bottom-6' : 'bottom-[5rem]'
              } bg-primary z-1000 text-base-100 fixed left-1/2 flex -translate-x-1/2 transform items-center justify-center rounded-2xl px-6 py-2 transition-all duration-500`}
            >
              <MdOutlineWidgets className="mr-2 text-2xl" />
              <div onClick={() => menuOpenModal('menubtn')} className="text-lg font-medium">
                Menu
              </div>
            </div>
          )}

          {menu === 'menubtn' && (
            <>
              <MenuPopup show={menuModal} onClose={closeMenuModal}>
                <div className="relative min-h-[50vh]">
                  <div className="text-base-content fixed left-0 right-0 top-0 ml-2 mt-2 px-4 py-2 font-medium capitalize">Category</div>
                  <div className="bg-base-100 absolute right-0 mr-2 mt-2 rounded-full p-1">
                    <HiX className="text-primary text-2xl" onClick={closeMenuModal} />
                  </div>
                  <div className="hide-scrollbar absolute inset-0 top-12 max-h-[30rem] overflow-y-auto pb-4">
                    <ParentCategory closeModal={closeMenuModal} parentCategory={organizedData} />
                  </div>
                </div>
              </MenuPopup>
            </>
          )}

          {menu.toLowerCase() === 'livecart' && (
            <DayOutPopup show={isModalOpen} onClose={closeModal}>
              <div className="relative max-h-[80vh] overflow-y-auto">
                <div className="bg-base-100 text-base-content fixed left-0 right-0 top-0 z-10 rounded-t-2xl border-b px-4 py-4 font-medium capitalize">
                  {tableData?.name}
                </div>
                {isSending ? (
                  <div className="flex h-[60vh] items-start justify-center">
                    <LoaderComponent />
                  </div>
                ) : (
                  <div className="hide-scrollbar overflow-y-auto px-6 pb-[7rem] pt-16">
                    {filteredCartItems
                      .filter((ele) => ele)
                      .map((cartItem, index) => {
                        const { dishData, variants } = cartItem;
                        const name = dishData?.name;
                        return variants?.map((variant, variantIndex) => {
                          const { portion, extra, id, quantity } = variant;
                          console.log(variant);
                          const selectedPortion = portion?.name;
                          const selectedExtra = extra ? Object.values(extra)?.filter((item: any) => item?.quantity > 0) : [];
                          return (
                            <div key={`${dishData?._id}-${index}-${variantIndex}`}>
                              <div className="relative mt-4 flex justify-between">
                                <div className="mr-4">{dishData?.dishType && <FoodType type={dishData?.dishType as FOOD_TYPES} />}</div>
                                <div className="-ml-12 w-[70%]">
                                  <div className="text-base-content font-medium">
                                    {name?.length && name.length < 35 ? name : name?.slice(0, 35) + '...'}
                                  </div>

                                  <div className="text-base-content/50 mt-1 font-medium">
                                    <div>{selectedPortion}</div>
                                    <div>
                                      {selectedExtra.map((extraItem: any, extraIndex) => (
                                        <div key={`${dishData?._id}-${index}-${variantIndex}-${extraIndex}`}>
                                          <span className="mr-2 text-sm">{extraItem?.quantity}</span>x
                                          <span className="ml-2 text-sm">{extraItem?.name}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex justify-between">
                                    <div className="text-base-content/50 mt-4 font-medium">
                                      ₹{getDishPrice(dishData, selectedPortion, selectedExtra)}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteItem(tableId, dishData?._id, id)}
                                      className="text-primary on_active_bounce border-primary bg-base-100 -mr-[6rem] mt-1 rounded-2xl border px-6 py-2 font-medium"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                                <div className="text-base-content/ mr-4 text-right font-medium">x 1</div>
                              </div>
                              {activeInputId === id ? (
                                <InstructionInput
                                  instruction={instruction}
                                  setInstruction={setInstruction}
                                  activeInputId={activeInputId}
                                  setActiveInputId={setActiveInputId}
                                  addInstruction={addInstruction}
                                  cart={cart}
                                  dishId={dishData?._id}
                                  variantId={id}
                                  tableId={tableId}
                                />
                              ) : (
                                <>
                                  {!variant?.instruction && (
                                    <div onClick={() => setActiveInputId(id)} className="-ml-1 mt-4 flex text-orange-600">
                                      <HiOutlineClipboardList className="text-2xl" /> Cooking Instruction
                                    </div>
                                  )}

                                  {variant?.instruction && (
                                    <InstructionItem
                                      deleteInstruction={deleteInstruction}
                                      setActiveInputId={setActiveInputId}
                                      variant={variant}
                                      cart={cart}
                                      dishId={dishData?._id}
                                      variantId={id}
                                      tableId={tableId}
                                    />
                                  )}
                                </>
                              )}
                              <div className="mt-6 border border-dashed" />
                            </div>
                          );
                        });
                      })}
                  </div>
                )}
              </div>
              <div className="bg-primary fixed bottom-0 h-[4rem] w-full pb-4 pt-4">
                <div className="mx-[3rem] flex justify-between">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="text-base-100 bg-primary absolute bottom-3 left-6 mr-2 flex rounded-full px-4 py-2 text-sm"
                  >
                    <RiShoppingBagLine className="-ml-4 mr-2 mt-[0.125rem] " />
                    Items Added
                    <MdOutlineKeyboardArrowUp className="ml-3 text-xl" />
                  </button>

                  <button
                    type="button"
                    onClick={sendCart}
                    disabled={isSending}
                    className={`on_active_bounce text-primary bg-base-100 absolute bottom-3 right-6 mr-2 rounded-full px-4 py-2 text-sm font-medium ${
                      isSending ? 'opacity-50' : ''
                    }`}
                  >
                    {isSending ? 'Loading...' : 'Continue'}
                  </button>
                </div>
              </div>
            </DayOutPopup>
          )}

          <div
            onClick={() => menuOpenModal('liveCart')}
            className={`${activeButton.toLowerCase() === 'pos' ? '' : 'hidden'} ${
              filteredCartItems.filter((ele) => ele).length > 0 ? '' : 'hidden'
            } bg-primary fixed bottom-0 h-[4rem] w-full`}
          >
            <button type="button" className="text-base-100 bg-primary absolute bottom-3 left-6 mr-2 flex rounded-full px-4 py-2 text-sm">
              <RiShoppingBagLine className="-ml-4 mr-2 mt-[0.125rem] " />
              Items Added
              <MdOutlineKeyboardArrowUp className="ml-3 text-xl" />
            </button>

            <button type="button" className="text-primary bg-base-100 absolute bottom-3 right-6 mr-2 rounded-full px-4 py-2 text-sm font-medium">
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(POSComponent);
