import { MenuTempChnages } from "@hi/db-models";

const addInTempMenuChanges = async (
  changesType: string,
  id: string,
  businessId: string,
) => {
  if (changesType === "category") {
    await MenuTempChnages.findOneAndUpdate(
      {
        businessId: businessId,
      },
      {
        $addToSet: {
          changedCategoryIds: id,
        },
      },
      { upsert: true, new: true },
    );
  }
  if (changesType === "addOn") {
    await MenuTempChnages.findOneAndUpdate(
      {
        businessId: businessId,
      },
      {
        $addToSet: {
          changedAddOnIds: id,
        },
      },
      { upsert: true, new: true },
    );
  }
  if (changesType === "tax") {
    await MenuTempChnages.findOneAndUpdate(
      {
        businessId: businessId,
      },
      {
        $addToSet: {
          changedTaxIds: id,
        },
      },
      { upsert: true, new: true },
    );
  }
  if (changesType === "kitchen") {
    await MenuTempChnages.findOneAndUpdate(
      {
        businessId: businessId,
      },
      {
        $addToSet: {
          changedKitchenIds: id,
        },
      },
      { upsert: true, new: true },
    );
  }
  if (changesType === "dish") {
    await MenuTempChnages.findOneAndUpdate(
      {
        businessId: businessId,
      },
      {
        $addToSet: {
          changedDishIds: id,
        },
      },
      { upsert: true, new: true },
    );
  }
  return true;
};

const clearTempMenuChanges = async (
  changesType: string,
  id: string,
  businessId: string,
) => {
  await MenuTempChnages.findOneAndUpdate(
    {
      businessId: businessId,
    },
    {
      changedCategoryIds: [],
      changedAddOnIds: [],
      changedTaxIds: [],
      changedKitchenIds: [],
      changedDishIds: [],
    },
    {
      upsert: true,
      new: true,
    },
  );
  return true;
};

export { addInTempMenuChanges, clearTempMenuChanges };
