const transformData = (data) => {
  const nowIST = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  );
  // helper: map JS getDay() to your schedule_day strings
  const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = dayMap[nowIST.getDay()];

  // parse the categorytimings JSON or return empty array
  const safeParseTimings = (raw) => {
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      console.warn("Failed to parse timings:", e);
      return [];
    }
  };

  // check if a category is active right now
  const isActiveNow = (timings) => {
    for (const schedule of timings) {
      // match either today’s day or “All”
      if (schedule.schedule_day !== "All" && schedule.schedule_day !== today)
        continue;
      for (const slot of schedule.schedule_time_slots || []) {
        const [sh, sm] = slot.start_time.split(":").map(Number);
        const [eh, em] = slot.end_time.split(":").map(Number);

        // build Date objects for this slot on IST
        const start = new Date(nowIST);
        start.setHours(sh, sm, 0, 0);
        const end = new Date(nowIST);
        end.setHours(eh, em, 0, 0);

        // handle overnight spans (e.g. 22:00–06:00)
        if (end <= start) {
          // if now ≥ start OR now ≤ end (past midnight)
          if (nowIST >= start || nowIST <= end) return true;
        } else {
          if (nowIST >= start && nowIST <= end) return true;
        }
      }
    }
    return false;
  };

  const transformedCategories = data.categories
    .map((category) => {
      // Parse and check timings
      const timings = safeParseTimings(category.categorytimings);
      if (timings.length > 0 && !isActiveNow(timings)) {
        return null; // exclude this category
      }

      // Filter items belonging to this category
      const items = data.items.filter(
        (item) => item.item_categoryid === category.categoryid,
      );

      const transformedItems =
        items?.map((item) => {
          let addOnIds =
            item?.addon?.map((addOn) => {
              const addOnGroup = data?.addongroups?.find(
                (group) => group?.addongroupid === addOn?.addon_group_id,
              );
              return {
                _id: addOn?.addon_group_id,
                name: addOnGroup?.addongroup_name,
                addon_item_selection: addOn?.addon_item_selection,
                compulsory: 0,
                addOnMaxQuantity: Number(addOn?.addon_item_selection_max),
                choiceType: "NUMBER",
                addon_item_selection_min: addOn?.addon_item_selection_min,
                addon_item_selection_max: addOn?.addon_item_selection_max,
                choices:
                  addOnGroup?.addongroupitems?.map((choice) => ({
                    name: choice?.addonitem_name,
                    price: Number(choice?.addonitem_price),
                    visibility: true,
                    availability: true,
                    choiceMaxQuantity: 2,
                    choiceDishType: ["VEG"],
                    uuid: choice?.addonitemid,
                    _id: choice?.addonitemid,
                  })) || [],
              };
            }) || [];

          const portions =
            item?.variation?.map((variation) => ({
              name: variation?.name,
              price: Number(variation?.price),
              default: variation?.name === "Medium",
              portionTypes: ["VEG"],
              _id: variation?.id,
            })) || [];

          for (let i = 0; i < item?.variation?.length; i++) {
            const variation = item?.variation[i];

            if (
              variation?.variationallowaddon === "1" &&
              variation?.addon?.length > 0
            ) {
              addOnIds =
                variation?.addon?.map((addOn) => {
                  const addOnGroup = data?.addongroups?.find(
                    (group) => group?.addongroupid === addOn?.addon_group_id,
                  );
                  return {
                    _id: addOn?.addon_group_id,
                    name: addOnGroup?.addongroup_name,
                    addon_item_selection: addOn?.addon_item_selection,
                    compulsory: 0,
                    addOnMaxQuantity: Number(addOn?.addon_item_selection_max),
                    choiceType: "NUMBER",
                    addon_item_selection_min: addOn?.addon_item_selection_min,
                    addon_item_selection_max: addOn?.addon_item_selection_max,
                    choices:
                      addOnGroup?.addongroupitems?.map((choice) => ({
                        name: choice?.addonitem_name,
                        price: Number(choice?.addonitem_price),
                        visibility: true,
                        availability: true,
                        choiceMaxQuantity: 2,
                        choiceDishType: ["VEG"],
                        uuid: choice?.addonitemid,
                        _id: choice?.addonitemid,
                      })) || [],
                  };
                }) || [];
            }
          }

          const returnItemType = (item) => {
            if (item?.item_attributeid === "1") {
              return ["VEG"];
            }
            if (item?.item_attributeid === "2") {
              return ["NON_VEG"];
            }
            if (item?.item_attributeid === "24") {
              return ["EGG"];
            }
          };

          return {
            _id: item?.itemid,
            name: item?.itemname,
            categoryIds: [item?.item_categoryid],
            price: Number(item?.price),
            visibility: true,
            availability: true,
            dishTypes: returnItemType(item),
            addOnIds: addOnIds,
            images: [item.item_image_url],
            portions: portions,
            description: item?.itemdescription,
          };
        }) || [];

      return {
        _id: category?.categoryid,
        name: category?.categoryname,
        active: category?.active,
        categoryrank: category?.categoryrank,
        visibility: true,
        businessId: category?.restarant_ids,
        hierarchy: "CHILD",
        category_image_url: category?.category_image_url,
        parentCategoryIds: [category?.group_category_id],
        subCategoryIds: [],
        coverImage: "",
        dishIds: transformedItems,
      };
    })
    .filter((category) => category !== null);

  return transformedCategories;
};

const transformParentCategories = (
  parentCategories,
  subcategories,
  businessId: string,
) => {
  try {
    // Basic input validation
    if (
      !Array.isArray(parentCategories) ||
      !Array.isArray(subcategories) ||
      typeof businessId !== "string"
    ) {
      return [];
    }

    // Sort parent categories by rank (ascending)
    const sortedParents = [...parentCategories].sort(
      (a, b) => Number(a.rank) - Number(b.rank),
    );

    return sortedParents
      .map((parent) => {
        // Defensive: check required fields
        if (!parent || !parent.id || !parent.name) return null;

        // Find and sort subcategories for this parent by categoryrank
        const subCats = subcategories
          .filter((cat) => cat.group_category_id === parent.id)
          .sort((a, b) => Number(a.categoryrank) - Number(b.categoryrank));

        return {
          _id: parent.id,
          businessId: businessId,
          name: parent.name,
          visibility: true,
          parentCategoryIds: [],
          subCategoryIds: subCats.map((cat) => cat.categoryid),
          dishIds: [],
          availability: parent.status === "1",

          coverImage: "",
        };
      })
      .filter(Boolean); // Remove any nulls
  } catch (e) {
    return [];
  }
};

const getCurrentISTTime = (): string => {
  const date = new Date();
  const options = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  // Format the date to IST
  const istDate = new Intl.DateTimeFormat("en-GB", options).format(date);

  // Reformat the date to match the desired output format
  const [day, month, year, time] = istDate
    .match(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}:\d{2}:\d{2})/)!
    .slice(1);
  return `${year}-${month}-${day} ${time}`;
};

function convertToPetpoojaCart(
  internalCart,
  restID,
  customerName,
  customerPhone,
  tableName,
  app_key,
  app_secret,
  access_token,
) {
  try {
    const currentISTTime = getCurrentISTTime();

    const kot = {
      app_key: app_key,
      app_secret: app_secret,
      access_token: access_token,
      restID: restID,
      kotinfo: {
        Restaurant: {
          restID: restID,
        },
        Customer: {
          name: customerName || "datta", // Placeholder for customer name
          mobile: customerPhone || "9588411111", // Placeholder for customer mobile
          address: "",
        },
        Kot: {
          uniqueID: generateUniqueID(), // Generate a unique ID for the order
          order_type: "D", // Default to dine-in
          table_no: tableName, // Default table number
          no_of_persons: "",
          created_on: currentISTTime,
          callback_url: "",
        },
        KotItem: [],
      },
    };

    // Process internalCart and convert each item
    internalCart.forEach((cartItem) => {
      try {
        // Validate required fields
        if (
          !cartItem.dish ||
          !cartItem.dish._id ||
          !cartItem.dish.name ||
          cartItem.quantity == null
        ) {
          console.error("Invalid cart item:", cartItem);
          return; // Skip this item
        }

        // Use portion ID if available, otherwise use dish ID
        const itemId = cartItem.portion
          ? cartItem.portion._id
          : cartItem.dish._id;

        // Create KOTItem
        const kotItem = {
          name:
            cartItem.dish.name +
            (cartItem.portion ? ` (${cartItem.portion.name})` : ""),
          quantity: cartItem.quantity,
          specialnotes: cartItem.dish.instruction || "",
          id: itemId, // Use portion ID or dish ID
          AddonItem: "",
          fixed_per: "0",
        };

        // Add special notes if available
        if (cartItem.extras && cartItem.extras.length > 0) {
          kotItem.specialnotes = cartItem.extras
            .map((e) => `${e.name}: ${e.quantity}`)
            .join(", ");
          kotItem.AddonItem = JSON.stringify(
            cartItem.extras.map((extra) => ({
              group_id: "", // Group ID if available
              group_name: "Add-ons", // Default group name
              id: extra.id,
              name: extra.name,
              price: extra.price,
              quantity: extra.quantity,
            })),
          );
        }

        // Add the item to KOT
        kot.kotinfo.KotItem.push(kotItem);
      } catch (itemError) {
        console.error("Error processing cart item:", cartItem, itemError);
      }
    });

    return kot;
  } catch (error) {
    console.error("Error converting cart:", error);
    return null;
  }
}

// Utility function to generate unique IDs
function generateUniqueID() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

function calculateCartBill(cart: unknown) {
  let totalBill = 0;

  cart.forEach((item: unknown) => {
    // Base dish price
    let dishPrice = item.dish.price * item.quantity;

    // Portion price if applicable
    let portionPrice = item.portion ? item.portion.price * item.quantity : 0;

    // Extras price
    let extrasPrice = item.extras.reduce(
      (sum, extra) => sum + extra.price * extra.quantity,
      0,
    );

    // Calculate total for the item
    let itemTotal = dishPrice + portionPrice + extrasPrice;

    // Add to total bill
    totalBill += itemTotal;
  });

  return totalBill;
}

function transformItemsToSimpleArray(itemsData) {
  return itemsData
    .filter((item) => item.name !== "CGST" && item.name !== "SGST")
    .map((item) => {
      // Extract basic dish details
      const dishDetails = {
        name: item.name || "",
        price: item.price || 0,
        quantity: item.quantity || 1,
      };

      // Extract extras (addons) if available and transform them into a list of objects
      let extras = [];
      if (item.addons) {
        try {
          const extrasList = JSON.parse(item.addons);
          extras = extrasList.map((addon) => ({
            name: addon.name || "",
            price: addon.price || 0,
            quantity: addon.quantity || 1,
          }));
        } catch (e) {
          extras = [];
        }
      }

      return { dish: dishDetails, extras: extras };
    });
}

export {
  calculateCartBill,
  convertToPetpoojaCart,
  transformData,
  transformItemsToSimpleArray,
  transformParentCategories,
};
