const transformData = (data) => {
  const transformedCategories = data.categories.map((category) => {
    const items = data.items.filter(
      (item) => item.item_categoryid === category.categoryid,
    );

    const transformedItems = items.map((item) => {
      const addOnIds = item.addon.map((addOn) => {
        const addOnGroup = data.addongroups.find(
          (group) => group.addongroupid === addOn.addon_group_id,
        );
        return {
          _id: addOn.addon_group_id,
          name: addOnGroup.addongroup_name,
          addon_item_selection: addOn.addon_item_selection,
          compulsory: 0,
          addOnMaxQuantity: Number(addOn.addon_item_selection_max),
          choiceType: "NUMBER",
          addon_item_selection_min: addOn.addon_item_selection_min,
          addon_item_selection_max: addOn.addon_item_selection_max,
          choices: addOnGroup.addongroupitems.map((choice) => ({
            name: choice.addonitem_name,
            price: Number(choice.addonitem_price),
            visibility: true,
            availability: true,
            choiceMaxQuantity: 2,
            choiceDishType: ["VEG"],
            uuid: choice.addonitemid,
            _id: choice.addonitemid,
          })),
        };
      });

      const portions = item.variation.map((variation) => ({
        name: variation.name,
        price: Number(variation.price),
        default: variation.name === "Medium",
        portionTypes: ["VEG"],
        _id: variation.id,
      }));
      const returnItemType = (item) => {
        if (item.item_attributeid === "1") {
          return ["VEG"];
        }
        if (item.item_attributeid === "2") {
          return ["NON_VEG"];
        }
        if (item.item_attributeid === "24") {
          return ["EGG"];
        }
      };

      return {
        _id: item.itemid,
        name: item.itemname,
        categoryIds: [item.item_categoryid],
        price: Number(item.price),
        visibility: true,
        availability: true,
        dishTypes: returnItemType(item),
        addOnIds: addOnIds,
        images: [],
        portions: portions,
        description: item.itemdescription,
      };
    });

    return {
      _id: category.categoryid,
      name: category.categoryname,
      active: category.active,
      categoryrank: category.categoryrank,
      visibility: true,
      businessId: category.restarant_ids,
      hierarchy: "CHILD",
      category_image_url: category.category_image_url,
      parentCategoryIds: [],
      subCategoryIds: [],
      coverImage: "",
      dishIds: transformedItems,
    };
  });

  return transformedCategories;
};

const petPoojaCateAndDish = {
  success: "1",
  message: "Menu items are successfully listed.",
  categories: [
    {
      categoryid: "395971",
      categoryname: "Pannini Sandwiches",
      active: "1",
      categoryrank: "3",
      restarant_ids: "10249",
      category_image_url: "",
    },
    {
      categoryid: "395961",
      categoryname: "Burger",
      active: "1",
      categoryrank: "5",
      restarant_ids: "19349",
      category_image_url: "",
    },
  ],
  items: [
    {
      itemid: "59000970",
      itemallowvariation: "0",
      itemname: "Way Free Way Pancakes",
      itemrank: "1",
      item_categoryid: "395971",
      price: "149",
      active: "1",
      item_favorite: "0",
      itemallowaddon: "1",
      itemaddonbasedon: "0",
      instock: "2",
      attributes: "1",
      days: "-1",
      variation: [],
      addon: [
        {
          addon_group_id: "70650",
          addon_item_selection: "M",
          addon_item_selection_min: "0",
          addon_item_selection_max: "3",
        },
      ],
      item_attributeid: "1",
      itemdescription: "",
      minimumpreparationtime: "",
      item_image_url: "",
    },
    {
      itemid: "6242592",
      itemallowvariation: "0",
      itemname: '8" Cheese Shot Nacho Pizza',
      itemrank: "1",
      item_categoryid: "395961",
      price: "209",
      active: "1",
      item_favorite: "0",
      itemallowaddon: "0",
      itemaddonbasedon: "0",
      instock: "2",
      attributes: "1",
      days: "-1",
      variation: [],
      addon: [],
      item_attributeid: "1",
      itemdescription: "Cheese shots loaded with crisps cheese and sauces.",
      minimumpreparationtime: "",
      item_image_url: "",
    },
    {
      itemid: "5941846",
      itemallowvariation: "1",
      itemname: "Americana Corn Pizza",
      itemrank: "1",
      item_categoryid: "395961",
      price: 166,
      active: "1",
      item_favorite: "0",
      itemallowaddon: "1",
      itemaddonbasedon: "1",
      instock: "2",
      attributes: "1",
      days: "-1",
      variation: [
        {
          id: "5942006",
          variationid: "67788",
          name: "Medium",
          price: "159",
          active: "1",
          addon: [
            {
              addon_group_id: "70650",
              addon_item_selection: "M",
              addon_item_selection_min: "0",
              addon_item_selection_max: "3",
            },
            {
              addon_group_id: "70653",
              addon_item_selection: "M",
              addon_item_selection_min: "0",
              addon_item_selection_max: "1",
            },
          ],
          variationallowaddon: "1",
        },
        {
          id: "5942007",
          variationid: "67789",
          name: "Large",
          price: "239",
          active: "1",
          addon: [
            {
              addon_group_id: "70650",
              addon_item_selection: "M",
              addon_item_selection_min: "0",
              addon_item_selection_max: "3",
            },
            {
              addon_group_id: "70653",
              addon_item_selection: "M",
              addon_item_selection_min: "0",
              addon_item_selection_max: "1",
            },
          ],
          variationallowaddon: "1",
        },
      ],
      addon: [],
      item_attributeid: "1",
      itemdescription: "",
      minimumpreparationtime: "",
      item_image_url: "",
    },
  ],
  addongroups: [
    {
      addongroupid: "70650",
      addongroup_restaurantid: "366",
      addongroup_name: "Pizza Addons",
      addongroup_rank: "2",
      active: "1",
      addongroupitems: [
        {
          addonitemid: "11",
          addonitem_name: "Onion",
          addonitem_price: "20",
          active: "1",
        },
        {
          addonitemid: "12",
          addonitem_name: "Paneer",
          addonitem_price: "35",
          active: "1",
        },
        {
          addonitemid: "13",
          addonitem_name: "Tomato",
          addonitem_price: "30",
          active: "1",
        },
        {
          addonitemid: "14",
          addonitem_name: "Capsicum",
          addonitem_price: "35",
          active: "1",
        },
        {
          addonitemid: "15",
          addonitem_name: "Corn",
          addonitem_price: "33",
          active: "1",
        },
      ],
    },
  ],
  itemspecialnotes: [],
  serverdatetime: "2019-11-12 18:24:03",
};

export { petPoojaCateAndDish, transformData };
