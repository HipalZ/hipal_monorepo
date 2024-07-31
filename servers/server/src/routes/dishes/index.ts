// books.ts
import { AddOn, Business, Category, Dish, UniquelyYours } from "@hi/db-models";
import {
  dishSchema,
  uniquelyYoursSchema,
  updateDishSchema,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { ClientSession } from "mongoose";
import { z } from "zod";
import {
  ClientRoles,
  requireAuthorization,
} from "../../../middleware/authorization";
import { authTokenValidator } from "../../../middleware/tokenValidator";
import { respond } from "../../utils/response";

const dishesRouter = new Hono()
  .get(
    "/",

    zValidator(
      "query",
      z.object({
        businessId: z.string(),
        UniquelyYours: z.string().optional(),
        menu: z.string().optional(),
      }),
    ),
    async (c) => {
      const { businessId, UniquelyYours, menu } = c.req.query();
      if (UniquelyYours) {
        const existingDishes = await Dish.find({
          businessId,
          "categoryIds.0": { $exists: true },
        }).select(
          "_id businessId name availability tags images dishTypes visibility price categoryIds addOnIds recommendationIds",
        );
        return respond(
          c,
          "Dishes fetched successfully",
          false,
          200,
          existingDishes,
        );
      }

      if (menu) {
        const existingDishes = await Dish.find({
          businessId,
          isDeleted: false,
        }).select(
          " _id businessId name images availability tags dishTypes visibility price categoryIds addOnIds recommendationIds",
        );
        return respond(
          c,
          "Dishes fetched successfully",
          false,
          200,
          existingDishes,
        );
      }

      const existingDishes = await Dish.find({
        businessId,
        isDeleted: false,
      });

      return respond(
        c,
        "Dishes fetched successfully",
        false,
        200,
        existingDishes,
      );
    },
  )
  .put(
    "/:id",
    authTokenValidator,
    requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),
    zValidator("param", z.object({ id: z.string() })),
    zValidator("json", updateDishSchema),
    async (c) => {
      //@ts-ignore
      return await runInTransaction(async (session: ClientSession) => {
        const { id } = c.req.param();
        const dish = await c.req.json();
        const {
          name,
          dishTypes,
          availability,
          visibility,
          portions,
          price,
          images,
          description,
          tags,
          categoryIds = [],
          addOnIds = [],
          recommendationIds = [],
          removeCategoryIds = [],
          removeAddOnIds = [],
          removeRecommendationIds = [],
        } = dish;
        const existingDish = await Dish.findOne({
          name,
          isDeleted: false,
          businessId: dish.businessId,
          _id: { $ne: id },
        });
        if (existingDish)
          return respond(c, "Dish Already exist", true, 409, {});
        const updatedDish = await Dish.findByIdAndUpdate(
          id,
          {
            name,
            dishTypes,
            availability,
            visibility,
            portions,
            price,
            images,
            description,
            tags,
          },
          {
            new: true,
            session: session,
          },
        );
        if (!updatedDish)
          return respond(c, "Error in updating dish", true, 400, {});

        if (removeCategoryIds.length) {
          await Category.updateMany(
            { _id: { $in: removeCategoryIds } },
            { $pull: { dishIds: id } },
            { session },
          );

          await Dish.findByIdAndUpdate(
            id,
            {
              $pull: { categoryIds: { $in: removeCategoryIds } },
            },
            { session },
          );
        }

        if (removeAddOnIds.length) {
          await AddOn.updateMany(
            { _id: { $in: removeAddOnIds } },
            { $pull: { dishIds: id } },
            { session },
          );

          await Dish.findByIdAndUpdate(
            id,
            {
              $pull: { addOnIds: { $in: removeAddOnIds } },
            },
            { session },
          );
        }

        if (removeRecommendationIds.length) {
          await Dish.findByIdAndUpdate(
            id,
            {
              $pull: { recommendationIds: { $in: removeRecommendationIds } },
            },
            { session },
          );
        }

        if (categoryIds.length) {
          await Category.updateMany(
            { _id: { $in: categoryIds } },
            { $addToSet: { dishIds: id } },
            { session },
          );

          await Dish.findByIdAndUpdate(
            id,
            { $addToSet: { categoryIds: { $each: categoryIds } } },
            { session },
          );
        }

        if (addOnIds.length) {
          await AddOn.updateMany(
            { _id: { $in: addOnIds } },
            { $addToSet: { dishIds: id } },
            { session },
          );

          await Dish.findByIdAndUpdate(
            id,
            { $addToSet: { addOnIds: { $each: addOnIds } } },
            { session },
          );
        }

        if (recommendationIds.length) {
          await Dish.findByIdAndUpdate(
            id,
            { $addToSet: { recommendationIds: { $each: recommendationIds } } },
            { session },
          );
        }

        return respond(c, "Dish updated successfully", false, 200, updatedDish);
      });
    },
  )
  .delete(
    "/:id",
    authTokenValidator,
    requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { id } = c.req.param();

        const existingDish = await Dish.findByIdAndUpdate(id, {
          isDeleted: true,
        });
        if (!existingDish) return respond(c, "Dish not found", true, 404, {});

        await Category.updateMany(
          { _id: { $in: existingDish.categoryIds ?? [] } },
          { $pull: { dishIds: id } },
        );

        await AddOn.updateMany(
          { _id: { $in: existingDish.addOnIds ?? [] } },
          { $pull: { dishIds: id } },
        );

        return respond(c, "Dish deleted successfully", false, 200, {});
      });
    },
  )
  .post(
    "/",
    authTokenValidator,
    requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),
    zValidator("json", dishSchema),
    async (c) => {
      //@ts-ignore
      return await runInTransaction(async (session: ClientSession) => {
        const dish = await c.req.json();

        const dishAlreadyExists = await Dish.findOne({
          businessId: dish.businessId,
          name: dish.name,
          isDeleted: false,
        });
        if (dishAlreadyExists)
          return respond(c, "Dish already exists", true, 400, {});
        const menuLayout = await Business.findOne({
          businessId: dish.businessId,
        });
        if (!menuLayout) return respond(c, "Business not found", true, 404, {});
        const createDish = await Dish.create([dish], { session });
        if (!createDish)
          return respond(c, "Error in creating dish", true, 400, {});

        await Category.updateMany(
          { _id: { $in: dish.categoryIds ?? [] } },
          { $push: { dishIds: createDish[0]._id } },
          { session },
        );

        await AddOn.updateMany(
          { _id: { $in: dish.addOnIds ?? [] } },
          { $push: { dishIds: createDish[0]._id } },
          { session },
        );

        return respond(c, "Dish created successfully", false, 201, createDish);
      });
    },
  )
  .post(
    "/uniquelyYours",
    authTokenValidator,
    requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),
    zValidator(
      "json",
      z.object({
        dishArray: z.array(uniquelyYoursSchema),
      }),
    ),

    async (c) => {
      const { dishArray } = await c.req.json();
      const businessId = dishArray[0]?.businessId;
      const removeOldDishes = await UniquelyYours.updateMany(
        { businessId },
        { isDeleted: true },
      );
      if (!removeOldDishes)
        return respond(c, "Error in updating dishes", true, 400, {});
      const createUniquelyYours = await UniquelyYours.insertMany(dishArray);
      if (!createUniquelyYours)
        return respond(c, "Error in updating dishes", true, 400, {});

      return respond(
        c,
        "Dishes updated successfully",
        false,
        201,
        createUniquelyYours,
      );
    },
  )
  .get(
    "/uniquelyDishes/:businessId",
    // authTokenValidator,
    // requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),
    zValidator("param", z.object({ businessId: z.string() })),

    async (c) => {
      const { businessId } = c.req.param();

      const dishes = await UniquelyYours.find({ businessId, isDeleted: false });

      return respond(c, "Dishes fetched successfully", false, 200, dishes);
    },
  )
  .get(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string(),
      }),
    ),
    async (c) => {
      const { id } = c.req.param();
      const existingDish = await Dish.findOne({ _id: id, isDeleted: false });
      if (!existingDish) return respond(c, "Dish not found", true, 404, {});
      return respond(c, "Dish fetched successfully", false, 200, existingDish);
    },
  )
  .post(
    "/:businessId/bulkUpload",
    authTokenValidator,
    requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),
    zValidator("param", z.object({ businessId: z.string() })),
    zValidator("json", z.array(dishSchema)),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const dishes = await c.req.json();

        for (const dish of dishes) {
          const dishAlreadyExists = await Dish.findOne({
            businessId: dish.businessId,
            name: dish.name,
            isDeleted: false,
          });
          if (!dishAlreadyExists) {
            const createDish = await Dish.create([dish], { session });
            if (!createDish) {
              return c.json(
                { err: true, message: "Error in creating dishes", data: {} },
                400,
              );
            }
          }
        }
        return c.json({
          err: false,
          message: "Dishes created successfully",
          data: {},
        });
      });
    },
  )
  .post(
    "/:businessId/bulkUpload/dishes",

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const dishes = [
          {
            name: "Mutton Soup",
            price: 350,
            description:
              "Slow cooked mutton bone marrow soup served with bread.",
            images: [
              "https://storage.hipal.life/minio/assets/292c5e20-0ee8-4d4a-bcf5-dd25b568f50a.jpeg",
              "https://storage.hipal.life/minio/assets/1bacd9d2-6189-42fc-ad01-1f360cf6665d.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Italian Tiramisu",
            price: 240,
            description:
              "One of the signature desserts from Italy made up of sabayon mascarpone cheese cream black coffee & ladyfinger biscuit.",
            images: [
              "https://storage.hipal.life/minio/assets/5f9cf7c0-d2b4-4f66-ab17-d41f6f2c1c90.jpeg",
              "https://storage.hipal.life/minio/assets/139789b0-531f-4d5a-840c-383268f36a6a.jpeg",
              "https://storage.hipal.life/minio/assets/29a857f4-d7ab-446d-a108-a5b5c645a0ee.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Apple Pie",
            price: 250,
            description:
              "Classic apple pie sprinkled with cinnamon dust served with ice-cream and homemade caramel sauce.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Cheese Cakes",
            price: 250,
            description: "Mascarpone cream cheese homemade crumble & cream.",
            images: [
              "https://storage.hipal.life/minio/assets/95ee55bc-2668-4517-90af-bbac8fbcf0ab.jpeg",
              "https://storage.hipal.life/minio/assets/8b2fdd57-9ee3-49a3-a94e-0ae7f425342a.jpeg",
              "https://storage.hipal.life/minio/assets/79a1b4f6-25ea-4e7d-9d48-494a59901cbd.jpeg",
              "https://storage.hipal.life/minio/assets/2f24fa34-989a-4906-a7bc-67a7d3a7eeed.jpeg",
              "https://storage.hipal.life/minio/assets/d76e43dd-fca7-4e75-929f-af7cd872eccc.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Sizzling Brownie",
            price: 260,
            description:
              "Chocolate & walnut brownie sizzled on an iron platter; topped with ice-cream & chocolate sauce.",
            images: [
              "https://storage.hipal.life/minio/assets/c78d168a-2378-41fb-91d5-7284d41a9047.jpeg",
              "https://storage.hipal.life/minio/assets/c84c3722-cd64-4269-852f-73f7bb97253f.jpeg",
            ],
            dishTypes: ["EGG"],
          },
          {
            name: "Sizzling Fantasy",
            price: 260,
            description:
              "Chocolate cake sizzled on an iron platter topped with ice-cream & chocolate sauce.",
            images: [
              "https://storage.hipal.life/minio/assets/adb89e79-25bd-4488-8562-0848c56854a8.jpeg",
              "https://storage.hipal.life/minio/assets/f1589d3c-f21c-4837-9cb3-66011400e2b4.jpeg",
              "https://storage.hipal.life/minio/assets/f2301d10-3033-47bc-8767-61ac1c220088.jpeg",
            ],
            dishTypes: ["EGG"],
          },
          {
            name: "Sinful Choco Heaven In a Jar",
            price: 330,
            description:
              "A heavenly temptation chocolate cake chocolate brownie & dark chocolate ice-cream all topped with chocolate sauce.",
            images: [
              "https://storage.hipal.life/minio/assets/e081867f-2a01-4480-a8fe-fba8a0ea65e8.jpeg",
              "https://storage.hipal.life/minio/assets/e1d5571d-b2e8-4d30-b97b-12afc2e202c3.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Doughnuts",
            price: 140,
            description:
              "Freshly baked doughnuts glazed with sugar or chocolate.",
            images: [
              "https://storage.hipal.life/minio/assets/1300ab0c-f018-4d7c-b41b-33fe1abab916.jpeg",
              "https://storage.hipal.life/minio/assets/22e0369a-6af4-439b-8b06-8918c29f2e5f.jpeg",
              "https://storage.hipal.life/minio/assets/321ef44e-ccbf-4e8a-93e9-c2db3182e662.jpeg",
              "https://storage.hipal.life/minio/assets/f16f4c23-4c51-440a-9549-f6bac967ff62.jpeg",
            ],
            dishTypes: ["EGG"],
          },
          {
            name: "Chocolate Passion",
            price: 240,
            description:
              "Chocolate ice-cream & Brownie - a sinful combination.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Brownie Sundae",
            price: 250,
            description:
              "Chocolate brownie layered with vanilla ice-cream & chocolate sauce.",
            images: [
              "https://storage.hipal.life/minio/assets/1668cf0e-9073-46a5-9af6-4aac6f37346f.jpeg",
              "https://storage.hipal.life/minio/assets/37424c98-75c5-43fb-8770-df932001b72e.jpeg",
            ],
            dishTypes: ["EGG"],
          },
          {
            name: "Fruit Bowl",
            price: 300,
            description:
              "Seasonal variants of freshly cut fruits and berries (subject to availability) served with Greek yogurt crunchy millet muesli nuts & seeds topped with a dollop of virgin honey.",
            images: [
              "https://storage.hipal.life/minio/assets/abe5b7c4-3001-427d-bb70-4e57b1a361cb.jpeg",
              "https://storage.hipal.life/minio/assets/a942769e-c1a4-46c9-8c16-1d72070160da.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Grilled Chicken",
            price: 330,
            description:
              "Salad in Mediterranean vinaigrette Grilled Paneer or Chicken served with fresh garden lettuce plum cherry tomatoes green olives spiced chickpeas zucchini baked croutons cheese and drizzled with a zesty fresh Mediterranean vinaigrette.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Chaat Platter",
            price: 350,
            description:
              "Our signature Chaat platter brings together a mix of popular indian street food savory snacks and chutneys – Gol gappa Aloo tikki chaat &  dahi papdi chaat.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Guacamole & Spiced Lavash",
            price: 180,
            description:
              "Avocado guacamole served with spiced oven baked Lavash triangles.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Poached Eggs on Garlic Tzatziki Toast",
            price: 220,
            description:
              "Poached eggs with soft and runny yolk and tender whites served over butter garlic rubbed toast our house-made tzatziki & a dash of spicy olive oil.",
            images: [
              "https://storage.hipal.life/minio/assets/bd3e0cf6-b59d-42e2-a34c-dfa122a7448b",
            ],
            dishTypes: ["EGG"],
          },
          {
            name: "Mushrooms & Zucchini on Tzatziki Toast",
            price: 220,
            description:
              "Sautéed mushrooms & zucchini tendered and lightly browned served over butter garlic rubbed toast our house-made tzatziki & a dash of spicy olive oil.",
            images: [
              "https://storage.hipal.life/minio/assets/61739355-7695-4a89-b62a-f67a6d9cc9cf",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "American Buffalo Wings",
            price: 370,
            description:
              "Chicken wings batter fried & coated in authentic American style BBQ sauce.",
            images: [
              "https://storage.hipal.life/minio/assets/78498cd5-3ae4-4aa4-a059-971fc503337e.jpeg",
              "https://storage.hipal.life/minio/assets/4e639001-530d-4b3f-880e-85cd529c34f0.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Bombay Bhel Puri",
            price: 190,
            description:
              "A savory mixture of puffed rice sev potatoes onion tamarind & mint chutney from Juhu Beach.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Veg Rainbow Roll",
            price: 350,
            description:
              "Sushi rice noori sheet kaki-age (leeks onion & carrot ) piri-piri mayo tomato salsa & tanuki.",
            images: [
              "https://storage.hipal.life/minio/assets/7f87a409-b97d-4263-836f-177d85546211.jpeg",
              "https://storage.hipal.life/minio/assets/9e2ea038-2578-41a8-9ff9-943df1e336f1.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Green California Roll",
            price: 350,
            description:
              "Sushi rice noori sheet carrot piri-piri mayo & cucumber. ",
            images: [
              "https://storage.hipal.life/minio/assets/291ce5dd-71bb-434e-8077-8d6140b655d6.jpeg",
              "https://storage.hipal.life/minio/assets/1f37b9d0-71cf-4849-b6c5-530b116c4042.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Avocado Sushi Roll",
            price: 380,
            description:
              "Sushi rice noori sheet carrot avocado piri-piri mayo & cucumber.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Shrimp Tempura Roll",
            price: 400,
            description:
              "Sushi rice noori sheet tempura prawns cucumber carrot & piri-piri mayo.",
            images: [
              "https://storage.hipal.life/minio/assets/a5a3152f-d2bc-42af-9b59-173826db2398.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Baked Shrimp Roll",
            price: 400,
            description:
              "Sushi rice noori sheet cucumber carrot piri-piri mayo & shrimp salsa.",
            images: [
              "https://storage.hipal.life/minio/assets/05f58e3d-9506-4cd9-9174-55bd63255519.jpeg",
              "https://storage.hipal.life/minio/assets/8bc361d5-6596-4626-84dd-8051ee44c510.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Summer Roll",
            price: 180,
            description:
              "Rice paper sheet cucumber carrot wasabi pickled gherkins onions with add-on chicken/prawns.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Garlic Bread",
            price: 150,
            description:
              "Sliced bread spread with garlic butter fresh herbs toasted crisp in an oven.",
            images: [
              "https://storage.hipal.life/minio/assets/da0e6c32-3547-4f2d-bb53-cf4b0ecd54b7",
              "https://storage.hipal.life/minio/assets/d0873cde-ee0b-4f19-af86-a0b8b740a564",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Spicy Spinach Feta Sandwich",
            price: 260,
            description:
              "Sautéed spinach & corn burnt garlic spiced with hot Thai chili in olive oil & grill toasted with feta & soft cheese.",
            images: [
              "https://storage.hipal.life/minio/assets/0692700e-5104-496e-a9f7-1ff790b5c7c3.jpeg",
              "https://storage.hipal.life/minio/assets/db937fda-914f-472d-a607-4a2c03b6ec76.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Egg & Cheese Sandwich",
            price: 260,
            description:
              "Shredded boiled eggs in a cheese butter & mustard mayo dressing.",
            images: [
              "https://storage.hipal.life/minio/assets/28f16783-15a2-4a27-b5c8-925a03619a0b.jpeg",
            ],
            dishTypes: ["EGG"],
          },
          {
            name: "Bombay Sandwich",
            price: 210,
            description:
              "Mumbai zesty street food. Freshly sliced potatoes onions tomatoes & cucumber in a green mint & coriander chutney grill toasted in sandwich bread with cheese.",
            images: [
              "https://storage.hipal.life/minio/assets/210f30b1-6083-4a3b-a775-bbbb1b6a9701.jpeg",
              "https://storage.hipal.life/minio/assets/6bb11010-cffe-4736-8867-3a2cd4c36ccb.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Chicken & Olive Sandwich",
            price: 240,
            description:
              "Poached chicken mixed with olives in a light mayonnaise dressing with lettuce cherry tomatoes & cheese.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Bun Aloo & Tikki",
            price: 230,
            description:
              "Aloo Tikki flavored with coriander/mint & sweet tamarind chutney.",
            images: [
              "https://storage.hipal.life/minio/assets/82ec5f6f-f431-42b7-8a25-daa2ccc518dd.jpeg",
              "https://storage.hipal.life/minio/assets/9c9bcfc6-202c-4a77-9cc1-0d1db6f099ae.jpeg",
              "https://storage.hipal.life/minio/assets/98cf8fab-8e21-4964-bf91-c0ec06f37233.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Mumbai Vada Pav",
            price: 230,
            description:
              "Mumbai street food; batter fried aloo vada in a mini bun served with tamarind and mint chutneys.",
            images: [
              "https://storage.hipal.life/minio/assets/4a259add-7a8d-4c56-982c-e96fb9a26472.jpeg",
              "https://storage.hipal.life/minio/assets/83bc44e5-71e8-4b0b-9cd7-0e3819415ae5.jpeg",
              "https://storage.hipal.life/minio/assets/9f6ae38e-e577-4e98-9de8-1d06f84ba75c.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Smoked BBQ Chicken Burger",
            price: 340,
            description:
              "Tender chicken breast grilled on a skillet served with caramelized onions & cheddar cheese with a smoked barbeque sauce.",
            images: [
              "https://storage.hipal.life/minio/assets/9e61b616-5369-4ede-a175-3ae66481a3a1.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Spicy Chicken Fillet Burger",
            price: 350,
            description:
              "Chicken chili fillet marinated in buttermilk & batter fried golden brown served with an omelette egg fresh lettuce tomatoes & cheese.",
            images: [
              "https://storage.hipal.life/minio/assets/ed6ba517-0951-4066-b6c4-a7e18ab0025d.jpeg",
              "https://storage.hipal.life/minio/assets/09fc49a2-949c-4f56-960b-f588e807d9ea.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Gourmet Mutton Burger",
            price: 360,
            description:
              "Marinated mutton grilled on a ribbed skillet served with sautéed onions and melted cheese.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Japanese Katsu Curry",
            price: 430,
            description:
              "Sticky rice Japanese roux tempura fried katsu eggplant or chicken bok choy roasted sesame tempura seaweed & shitake.",
            images: [
              "https://storage.hipal.life/minio/assets/a1a3649d-a0ba-40dd-9e2d-2e14d2f2a333",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Nasi Goreng",
            price: 290,
            description:
              "Indonesian rice bowl flavored with spicy sambal olek and kecap manis (sweet soy sauce) with wok stir-fried chicken prawns and shredded egg omelet or a tasty vegetarian option with mushrooms & baby corn.",
            images: [
              "https://storage.hipal.life/minio/assets/468ca272-dc60-4136-aa2d-7e29c0fc30eb.jpeg",
              "https://storage.hipal.life/minio/assets/2410f903-9f35-494b-a808-de67872a38c9.jpeg",
              "https://storage.hipal.life/minio/assets/3783aa4e-73bb-4ba5-959a-9c2e5c02c824.jpeg",
              "https://storage.hipal.life/minio/assets/36c2afec-a62e-4da7-a910-6f570bb828b7.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Thai curry",
            price: 400,
            description:
              "Seasonal greens / chicken cooked with aromatic red homemade Thai curry paste and full-fat coconut milk. Served over Jasmine Rice.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Goan prawn Curry",
            price: 460,
            description:
              "Prawns marinated in spicy Goan masalas cooked with Coconut milk tamarind Kokum & served with boiled Jasmine rice.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Makhani Rice Bowl",
            price: 350,
            description:
              "Tandoori marinade chicken or paneer sautéed in butter chicken inspired gravy served with Jasmine rice.",
            images: [
              "https://storage.hipal.life/minio/assets/908624da-a354-44e3-92bf-038c3aea57e7.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Spicy Ramen Bowls",
            price: 350,
            description:
              "Baby bok choy shitake mushrooms fresh ginger garlic pods and delectable soft-boiled egg with a jammy yolk & soft ramen noodles swimming in a spicy rich broth & sprinkled with fried corn scallions and jalapeños.",
            images: [
              "https://storage.hipal.life/minio/assets/77deca8d-36b1-4e8f-98a2-4c645af937e7.jpeg",
              "https://storage.hipal.life/minio/assets/f3d1b68d-1053-41fa-b51a-6255c7bd6a99.jpeg",
              "https://storage.hipal.life/minio/assets/f69b3c62-8a49-4d1a-b660-961bad0b0243.jpeg",
              "https://storage.hipal.life/minio/assets/c42226bd-ddda-4262-8b5e-83f1ff9d62b3.jpeg",
              "https://storage.hipal.life/minio/assets/6aa96bb7-e8a1-4662-a7cd-b1da29274f9b.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Khow Suey",
            price: 360,
            description:
              "A Burmese noodle delicacy broth. Vegetable / Chicken simmered in a ginger-garlic coconut milk soup garnished with crispy fried shallots garlic pods boiled eggs fresh coriander leaves spring onions and roasted crushed peanuts.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Chow-Mein Noodles",
            price: 280,
            description:
              "Served with Veg/Egg/Chicken soft noodles & chili garlic vegetables / chicken.",
            images: [
              "https://storage.hipal.life/minio/assets/01d2a670-c028-42ec-af10-cab240fada4f.jpeg",
              "https://storage.hipal.life/minio/assets/ab9dc814-125a-4341-ae88-61ca994b6c2e.jpeg",
              "https://storage.hipal.life/minio/assets/782650c4-5ca0-475c-86ed-7746e2ba54f0.jpeg",
              "https://storage.hipal.life/minio/assets/c7aed953-1f21-4834-a784-3c2a53d9626a.jpeg",
              "https://storage.hipal.life/minio/assets/3a881fbe-809e-40b4-9d87-5eaeba9205c0.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Chicken & Quatro Formaggie Lasagna",
            price: 450,
            description:
              "Handcrafted pasta with gratinated chicken & four cheese.",
            images: [
              "https://storage.hipal.life/minio/assets/38f832f6-bb12-48ea-8626-f820e3388ebf.jpeg",
              "https://storage.hipal.life/minio/assets/e8bd1c48-9036-4000-99b0-6feb64b14436.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Verdure Formaggio Lasagna",
            price: 420,
            description:
              "Handcrafted pasta sheet cottage cheese exotic seasonal veggies napoleon sauce four cheese.",
            images: [
              "https://storage.hipal.life/minio/assets/1e47d3cf-de53-4d5b-881e-a12a824ad568.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Spanish Omelette",
            price: 300,
            description:
              "Classic Spanish omelette baked with baby potatoes, cilantro, green chilies, chicken salami & sausages, mushroom, tomatoes, spring onions & cheese.",
            images: [
              "https://storage.hipal.life/minio/assets/af26f687-f301-488c-a803-5f31ed5e8ac0",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Fish & Chips",
            price: 370,
            description:
              "Basa fish fillet marinated with garlic salt & lime dipping batter fried golden brown. Served with a portion of fries.",
            images: [
              "https://storage.hipal.life/minio/assets/c89d3abd-654d-4014-8ed9-fc763e837c60.jpeg",
              "https://storage.hipal.life/minio/assets/58e51f9e-e178-47ca-8a12-3e3a50a87d54.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Pav Bhaji",
            price: 220,
            description:
              "Authentic Bombay street food - mixed veg (bhaji) served with loads of butter & bread pav.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Spicy Fried Chicken Fillet",
            price: 350,
            description:
              "Chicken fillet marinated in buttermilk & spices filled with soft cheese batter fried crispy golden brown.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Baked Chicken in White Sauce",
            price: 410,
            description:
              "Marinated tender chicken baked with freshly chopped garden greens; seasoned with balsamic salad oil crushed garlic pods in an alfredo white sauce.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Chicken Stroganoff",
            price: 370,
            description:
              "Marinated chicken cooked with mushroom onions & sour cream. Served over rice.",
            images: [
              "https://storage.hipal.life/minio/assets/a0006476-e98b-4608-a3d7-b7f123f202bd.jpeg",
              "https://storage.hipal.life/minio/assets/3b73420b-97f5-4127-b918-85f6064307a7.jpeg",
              "https://storage.hipal.life/minio/assets/d4f098d3-e13d-4462-8b7b-5911aab50215.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Sicilian Grilled Chicken",
            price: 420,
            description:
              "Fresh chicken spilled in herb butter marinade & muddled basil pesto; fire-grilled with a dash of parsley cheddar & garlic oil. Served with salad and wedges.",
            images: [
              "https://storage.hipal.life/minio/assets/f1af03a7-8a15-441a-8f2f-5d21770b1a08.jpeg",
              "https://storage.hipal.life/minio/assets/5449657c-e929-4e50-aeb8-6343f0f4c8b1.jpeg",
              "https://storage.hipal.life/minio/assets/3fb977c1-bef1-4c2c-a27d-1c81cf0322c0.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Grilled Parmesan Chicken",
            price: 440,
            description:
              "Chicken breast grilled in a cheesy Parmesan marinade. Served over sautéed vegetables & home-style potato wedges.",
            images: [
              "https://storage.hipal.life/minio/assets/73727aa7-9aa3-42a8-a84b-4f77abdf6c8c.jpeg",
              "https://storage.hipal.life/minio/assets/8430bbaf-8001-43ce-962b-929dad2084cd.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Charcoal Roast Grilled Chicken",
            price: 390,
            description:
              "Mouth-watering charcoal-roasted chicken breast served with Yakimshi fried rice.",
            images: [
              "https://storage.hipal.life/minio/assets/b67987bb-db85-47d9-b32a-cf3faa3ffdc5.jpeg",
              "https://storage.hipal.life/minio/assets/83d80f2d-f25a-4409-bb00-4cea0d07f7a7.jpeg",
              "https://storage.hipal.life/minio/assets/464e315d-29dc-4f09-9907-7d18952e6c5c.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Moroccan Grill Chicken",
            price: 360,
            description:
              "Tender Moroccan harissa-grilled chicken breast roasted tender with garlic and onions. Served over Yakimshi fried rice.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Butter Garlic Prawns",
            price: 550,
            description:
              "Succulent prawns seasoned with chili oil char-grilled on a ribbed skillet and served with butter garlic dipping & potato mash.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Cajun Grilled Fish Fillet",
            price: 430,
            description:
              "Fish fillet marinated with Cajun Spices steak roasted on a skillet grill and served with zesty lemon butter aioli & mashed potatoes.",
            images: [
              "https://storage.hipal.life/minio/assets/4663d2c7-f6c6-4479-98f8-0eef9693eaf2.jpeg",
              "https://storage.hipal.life/minio/assets/9d8875a0-7397-423c-b24c-99ec118c1b32.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Charcoal Grilled Paneer Sizzler",
            price: 410,
            description:
              "Skewered pieces of cottage cheese grilled with chunky bell peppers zucchini brinjal garlic & onions.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Chicken Fillet Sizzler Platter",
            price: 400,
            description:
              "Tender chicken breast fillet seasoned with freshly crushed garlic & basil flavored with aromatic seasoning and grilled to perfection stuffed with an omelette egg.",
            images: [
              "https://storage.hipal.life/minio/assets/2701bf4d-10b2-4a7e-8ec9-64b3f305838a.jpeg",
              "https://storage.hipal.life/minio/assets/fbb73771-6e84-4368-b15d-8f988909c5f4.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Pan Cakes & Cream",
            price: 300,
            description:
              "Fluffy pancakes served with fresh cream fruits and choice of Honey, Chocolate sauce (or) Maple Syrup.",
            images: [
              "https://storage.hipal.life/minio/assets/7ca4b177-05c9-46ad-b39b-d3c22b12aa60",
            ],
            dishTypes: ["EGG"],
          },
          {
            name: "My Big English Breakfast",
            price: 370,
            description:
              "Choice of eggs, grilled chicken sausages served with baked beans, grilled tomatoes, potato fries, sauté mushrooms, potato cutlet, toasted bread & butter and Fresh Fruit juice.\n(Note – Available only till 12 Noon)",
            images: [
              "https://storage.hipal.life/minio/assets/169b361d-a0c9-4d03-9f0e-7f3a4b592cd7",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "The Continental Veg Breakfast",
            price: 370,
            description:
              "Sauté Cottage cheese, baked beans, grilled tomatoes, potato fries, sauté mushrooms, potato cutlet, toasted bread & butter and Fresh Fruit juice.\n(Note – Available only till 12 Noon)\n",
            images: [
              "https://storage.hipal.life/minio/assets/7763f9ed-c51f-4a7c-9417-bf6572f4c25d",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Pizza Pesto Verde",
            price: 400,
            description:
              "Home-made pesto salad leaves cherry tomatoes pickled olives fresh feta shaved parmesan & drizzled with olive oil dressing.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Farmhouse Pizza",
            price: 420,
            description:
              "Marinara sauce fresh mozzarella zucchini broccoli shallots sweet corn mushroom & olives.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Chicken Overload Pizza",
            price: 520,
            description:
              "Marinara sauce mozzarella cheese shredded chicken meatballs chicken pepperoni grilled chicken chunks & chicken ham.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Spiced BBQ Chicken Pizza",
            price: 500,
            description:
              "Marinara sauce mozzarella cheese BBQ chicken fresh bird eye chili & balsamic onion.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Big Fat Pork Pizza",
            price: 620,
            description:
              "Marinara sauce mozzarella cheese pork bacon pork pepperoni & fried egg.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Melted Hot Chocolate",
            price: 180,
            description:
              "Melted chocolate blended with steamed milk and garnished with froth.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Cinnamon Hot Chocolate",
            price: 210,
            description: "Rejuvenating cinnamon flavoured hot chocolate.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Brownie Hot Chocolate",
            price: 240,
            description:
              "Delicious chocolate brownie crumbled in hot Chocolate.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Caramel Hot Chocolate",
            price: 230,
            description:
              "Home made caramel blended with steamed milk and garnished with froth.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Nutella Hot Chocolate",
            price: 230,
            description:
              "Nutella chocolate blended with steamed milk & garnished with froth.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Regular Chai",
            price: 170,
            description: "Your ghar wala chai with milk.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Assam Tea",
            price: 170,
            description:
              "Choose an add on– Freshly ground cardamom & ginger. Freshly brewed strong Assam tea served with milk.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Hot Lemon Tea",
            price: 170,
            description:
              "Choose an add on – Freshly ground ginger & dollop of honey. Freshly brewed Lemon flavoured tea served with fresh lemon juice.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Lemon Ice Tea",
            price: 200,
            description: "Refreshing Lemon flavoured ice tea.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Chamomile Ice Tea",
            price: 230,
            description: "Sweet chamomile flowers infused with ice tea.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Hibiscus Ice Tea",
            price: 210,
            description: "Tangy hibiscus flavoured ice tea.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Fruit Shakes",
            price: 270,
            description:
              "Rich creamy shakes with chunks of fresh fruits. Seasonal Variants basis availability.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Dark Chocolate Chip Shake",
            price: 270,
            description:
              "A rich gooey dark chocolate chip milk shake just like - the good old times.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Creamy Oreo Chocolate Shake",
            price: 280,
            description: "Creamy chocolate oreo blended in milk shake.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Ferrero Rocher Chocolate Shake",
            price: 370,
            description: "Ferrero Roche blended in chocolate milk shake.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Kit-Kat Chocolate Shake",
            price: 250,
            description: "Kit-Kaat chocolate blended in chocolate shake.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Brownie Shake",
            price: 280,
            description: "Gooey Chocolate brownie blended in milk shake.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Biscoff Shake",
            price: 300,
            description:
              "An irresistible treat of Belgian Biscoff biscuts crumbled in a thick shake.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Fantasy Shake",
            price: 290,
            description: "Rich chocolate cake blended in milk shake.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Salted Caramel & Cookie Crumble Oreo Shake",
            price: 300,
            description:
              "A perfect blend of cookie crumble oreos and rich caramel shake.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Blue Mojito",
            price: 200,
            description:
              "Curacao & fresh lime iced with sugar syrup & club soda.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Cappuccino",
            price: 180,
            description:
              "In traditional Italian style - a freshly brewed espresso shot topped with equal parts steamed & frothed warm milk.",
            images: [
              "https://storage.hipal.life/minio/assets/2ad10140-9fe0-4bdb-ac8c-8553efe7aeb5.jpeg",
              "https://storage.hipal.life/minio/assets/7faa3903-6a1c-4849-9363-455d8342875f.jpeg",
              "https://storage.hipal.life/minio/assets/404b7566-3764-4f6e-adcb-efb19b801efc.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Cappuccino Double Shot",
            price: 210,
            description:
              "In traditional Italian style - a freshly brewed espresso shot topped with equal parts steamed & frothed warm milk.",
            images: [
              "https://storage.hipal.life/minio/assets/c3139780-e424-4e0c-814f-b4e8c363d446.jpeg",
              "https://storage.hipal.life/minio/assets/7405f496-0873-41dd-a0b4-1846536ac41a.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Flat White",
            price: 200,
            description:
              "Micro-foamed milk poured over a double shot of espresso creating a smooth velvety texture and creamy taste.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Cinnamon Latte",
            price: 205,
            description:
              "Fresh cinnamon stick dipped in an Espresso with steamed milk & topped with whipped cream.",
            images: [
              "https://storage.hipal.life/minio/assets/e9610055-9a79-4a1e-b5ce-bb8cb5f1b76c.jpeg",
              "https://storage.hipal.life/minio/assets/d5d0d4ff-8d5e-49bb-8b1e-473eba9be66d.jpeg",
              "https://storage.hipal.life/minio/assets/f56b1c03-0e10-46f4-90b1-f22c5eca5f74.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Pistachio Latte",
            price: 200,
            description:
              "Muddled pistachio steeped in Espresso with steamed milk & topped with whipped cream.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Caramel Machiatto",
            price: 205,
            description:
              "Freshly steamed milk marked with espresso & finished with caramel sauce.",
            images: [
              "https://storage.hipal.life/minio/assets/ed206c19-3292-4daf-8ab8-24d722889c71.jpeg",
              "https://storage.hipal.life/minio/assets/056ebb12-9274-469d-9bc5-6ea2039c53e1.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Hazelnut Latte",
            price: 210,
            description:
              "Espresso topped with steamed milk to fill & garnished with sweet hazelnut syrup.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Cafe Noir",
            price: 150,
            description: "House coffee from our international variant.",
            images: [
              "https://storage.hipal.life/minio/assets/cfbbf9a5-6d62-42c8-98c2-aea50261a6bd.jpeg",
              "https://storage.hipal.life/minio/assets/12bcad05-26b3-497e-a93b-5f6b4825e26e.jpeg",
              "https://storage.hipal.life/minio/assets/05a95bee-9713-4f47-b148-075fa5427a1c.jpeg",
              "https://storage.hipal.life/minio/assets/7e605f36-12ff-40e2-9ce3-15dbbde366c8.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Irish Coffee",
            price: 200,
            description:
              "Black coffee flavored with Irish & topped with whipped cream.",
            images: [
              "https://storage.hipal.life/minio/assets/4a24edbf-c72c-4439-8741-a11995052f80.jpeg",
              "https://storage.hipal.life/minio/assets/4a17313e-7d78-47f1-8669-f26a53503ef2.jpeg",
              "https://storage.hipal.life/minio/assets/b61bda75-fac7-43b9-8202-3bfc8032adfd.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Hazelnut Coffee",
            price: 200,
            description:
              "Black coffee flavored with hazelnut & topped with whipped cream.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Classic Cold Brew Coffee",
            price: 200,
            description:
              "Our in-house Cold brew steeped with freshly ground Arabica beans.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Hazelnut Cold Brew Coffee",
            price: 230,
            description:
              "Cold brew steeped with freshly ground beans and Hazelnut flavour.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Pomegranate Cold Brew Coffee",
            price: 260,
            description:
              "Cold brew steeped with freshly ground beans and pomegranate fruit.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Oreo Frappe",
            price: 260,
            description:
              "Frappe blended with chocolate oreos crumble & melted chocolate. Simply delicious.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Fries",
            price: 240,
            description: "",
            images: [
              "https://storage.hipal.life/minio/assets/40fb8c15-9f5e-4cba-ab2d-c0b13495723b",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: " Arrabiata tomato red sauce Penne Pasta",
            price: 280,
            description:
              "Pasta penne tossed with succulent shredded chicken or sautéed exotic vegetables with your choice of sauce ",
            images: [
              "https://storage.hipal.life/minio/assets/d4b6afb2-eeaa-492a-b2bd-cab5be20e9e6.jpeg",
              "https://storage.hipal.life/minio/assets/b4b13c60-4491-4540-9e7f-a0926cedc5ff.jpeg",
              "https://storage.hipal.life/minio/assets/a425bd96-3a10-47b8-89ab-92179cfe62b1.jpeg",
              "https://storage.hipal.life/minio/assets/00d93c99-2c47-4eed-a91b-bfdc56b87e2e.jpeg",
              "https://storage.hipal.life/minio/assets/ef2523df-15c9-4e78-85a1-5ea2e59b0513.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: " Creamy Alfredo & Arrabiata Mix Penne Pasta",
            price: 360,
            description:
              "Pasta penne tossed with succulent shredded chicken or sautéed exotic vegetables with your choice of sauce ",
            images: [
              "https://storage.hipal.life/minio/assets/64cffb51-8f2c-4488-96cd-7a2cc4fd180b.jpeg",
              "https://storage.hipal.life/minio/assets/9e6cadf8-f74a-41ef-ac44-d769b62d4420.jpeg",
              "https://storage.hipal.life/minio/assets/6bb3f91a-8dde-4c7d-9e0f-27efcf8b4b04.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: " Pesto Sauce Penne Pasta",
            price: 280,
            description:
              "Pasta penne tossed with succulent shredded chicken or sautéed exotic vegetables with your choice of sauce ",
            images: [
              "https://storage.hipal.life/minio/assets/537d211f-477b-4442-a5c2-0468661c3693.jpeg",
              "https://storage.hipal.life/minio/assets/fa7bbb7d-a7db-4d81-89c7-cbed8de710a5.jpeg",
              "https://storage.hipal.life/minio/assets/b2ae2fdb-fb28-480a-b3c6-8c0097860db1.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Aam panna Mojito ",
            price: 200,
            description: "",
            images: [
              "https://storage.hipal.life/minio/assets/519282a9-be9f-401c-bfe6-41c7daabd3f8.jpeg",
              "https://storage.hipal.life/minio/assets/9411dd2e-779f-4d45-bd35-d3a581e92417.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Aloo Tikki Chaat",
            price: 190,
            description:
              "Fried Aloo tikkis, topped with yogurt, tamarind chutney, and mint chutney, sprinkled with chaat masala  onions.",
            images: [
              "https://storage.hipal.life/minio/assets/7e377cc9-bbb0-4e20-b3ea-aa73d20b8d75",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Apple Cinnamon",
            price: 240,
            description:
              "Apple Cinnamon Green Tea combines the natural goodness of green tea leaves with the comforting and aromatic flavors of apple and cinnamon. This delightful blend offers a unique twist on traditional green tea, infusing it with the cozy and nostalgic essence of apple and warm cinnamon spice.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Apple Juice",
            price: 270,
            description: "Freshly squeezed cold press fresh fruit Juices. ",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Baked Fish",
            price: 440,
            description:
              "Basa fish baked with fresh garden fresh vegetables & topped with Cheesy Cream White Alfredo sauce",
            images: [
              "https://storage.hipal.life/minio/assets/970f4a2d-3cda-49a5-b9e5-c1825988bb11.jpeg",
              "https://storage.hipal.life/minio/assets/32e3b07c-f163-46a4-90fa-21a209c9f0da.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Baked Fish Creamy Pesto Sauce ",
            price: 410,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Baked Omelet with Pork Bacon & Sausage",
            price: 420,
            description:
              "Omelette baked with baby potatoes, (pork) bacon, Pork sausages & cheese.",
            images: [
              "https://storage.hipal.life/minio/assets/f738a0a4-68f3-42b3-bf49-e1378520cf7a",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Baked Veg In Alfredo Sauce",
            price: 360,
            description:
              "Freshly chopped garden greens, seasoned with balsamic salad oil crushed garlic pods baked in an alfredo white sauce.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Belgian Chocolate doughnuts",
            price: 140,
            description:
              "Freshly baked doughnuts glazed with sugar or chocolate.",
            images: [],
            dishTypes: ["EGG"],
          },
          {
            name: "Blueberry Cheese Cake",
            price: 240,
            description: "Mascarpone cream cheese, home made crumble & cream.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Brownie Affogato Sundaes",
            price: 250,
            description:
              "Italian affogato with chocolate brownie & vanilla ice-cream downed with a shot of espresso.",
            images: [],
            dishTypes: ["EGG"],
          },
          {
            name: "Brownie Mocha ",
            price: 230,
            description:
              "Chocolate brownie swamped in an espresso shot served with chocolate melt, steamed milk.",
            images: [
              "https://storage.hipal.life/minio/assets/dda91066-86c2-402c-8ee8-5ed2a99902b3.jpeg",
              "https://storage.hipal.life/minio/assets/72264abc-c551-4ddf-97c0-00aea742edcf.jpeg",
              "https://storage.hipal.life/minio/assets/2f20329f-6362-4627-a5f3-2ba490963a60.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Butter Makhani Pizza - Chicken or Panner",
            price: 440,
            description:
              "Punjabi style makhani sauce, mozzarella cheese, chicken/paneer & chopped coriander leaves.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Cafe Choco mint",
            price: 250,
            description:
              "Frappe blended with chocolate mint & garnished with melted chocolate",
            images: [
              "https://storage.hipal.life/minio/assets/d3fd8897-aa12-4f99-9ab2-e8f5672551e3.jpeg",
              "https://storage.hipal.life/minio/assets/88531bb9-d25b-41af-9050-4cf8283d2cfd.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Cafe Frappe",
            price: 220,
            description: "Espresso blended with rich creamy ice-cream & milk.",
            images: [
              "https://storage.hipal.life/minio/assets/8e86517b-c307-4319-8afe-b9e7e86e4ebe.jpeg",
              "https://storage.hipal.life/minio/assets/862197da-bc1e-42f7-b00e-f3c722a9cf6e.jpeg",
              "https://storage.hipal.life/minio/assets/067fbd1a-4ecc-44cb-8613-ea809084de12.jpeg",
              "https://storage.hipal.life/minio/assets/3208e6c8-5edb-4ab3-ad39-d402ce683d5a.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Cafe Latte",
            price: 190,
            description:
              "Espresso topped with steamed milk to fill and garnished with froth.",
            images: [
              "https://storage.hipal.life/minio/assets/b2e730e9-b792-407a-b81e-3b70aba7b697.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Cafe Mocha ",
            price: 200,
            description:
              "Inspired by the Italian coffee Bicerin, a full-flavoured espresso shot served with chocolate melt, steamed milk and light foam froth.",
            images: [
              "https://storage.hipal.life/minio/assets/348a1a2c-2e72-4fb3-99fb-f2ae398e65ab.jpeg",
              "https://storage.hipal.life/minio/assets/3cbf2b4b-1cb3-436d-997e-3065b9174b5d.jpeg",
              "https://storage.hipal.life/minio/assets/bd19ceb8-fcbd-4eed-a3f6-cab98c3b3e19.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Caramel Chocolate Cheese Cake",
            price: 240,
            description: "Mascarpone cream cheese, home made crumble & cream.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Cheesy Cream White Alfredo Penne Pasta",
            price: 260,
            description:
              "Pasta penne tossed with succulent shredded chicken or sautéed exotic vegetables with your choice of sauce ",
            images: [
              "https://storage.hipal.life/minio/assets/af276589-583e-47ef-b4c0-2e503aa4dd16.jpeg",
              "https://storage.hipal.life/minio/assets/8513811c-db52-4599-b98b-94dd9c9cab6e.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Cheesy Jalapeno Balls",
            price: 210,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Chicken & Cheese Balls",
            price: 270,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Chicken & Fish Fillet Combo Burger",
            price: 350,
            description:
              "Chicken breast & basa fish fillet combo burgers served with lettuce, tomatoes & cheese.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Chicken Lollipops",
            price: 280,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Chicken Pepperoni Pizza",
            price: 490,
            description:
              "Marinara sauce, mozzarella cheese & choice of chicken pepperoni",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Chicken Soup",
            price: 280,
            description: "Light, hearty & delicious creamy chicken soup.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Choco Frappe",
            price: 250,
            description:
              "Coffee blended with ice cream, swirled with chocolate sauce & topped with ice cream. ",
            images: [
              "https://storage.hipal.life/minio/assets/dfd8aaa5-a9f5-4b82-b8f6-e1cf5ea79c60.jpeg",
              "https://storage.hipal.life/minio/assets/b1355dbf-6923-4b51-ac8e-955683a67d4b.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Choco vioc Sundaes",
            price: 260,
            description:
              "Vanilla Ice-cream and Chocolate cake muddled together",
            images: [],
            dishTypes: ["EGG"],
          },
          {
            name: "Chocolate 5Star Shake",
            price: 230,
            description: "Your favourite chocolate blended in milk shake.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Chocolate Brownie  Box of Two-200 gm",
            price: 230,
            description:
              "Our very own delicious Fudgy Chocolate Brownies. Mix them up and have a brownie-licious day",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Chocolate Brownie Box of Six-600 gm",
            price: 600,
            description:
              "Our very own delicious Fudgy Chocolate Brownies. Mix them up and have a brownie-licious day",
            images: [
              "https://storage.hipal.life/minio/assets/8d7cb379-70d4-4994-9038-8ddb223dade1.jpeg",
              "https://storage.hipal.life/minio/assets/ce0e05a6-e97a-454e-96c2-e7d8020ef0b0.jpeg",
              "https://storage.hipal.life/minio/assets/d7df83de-27d5-4a60-8a32-0e80c05b2809.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Chocolate Fantasy ",
            price: 140,
            description:
              "This delightful cake is a true masterpiece of rich and velvety chocolate flavors, combined with a symphony of complementary ingredients that create a heavenly taste experience.",
            images: [],
            dishTypes: ["EGG"],
          },
          {
            name: "Chocolate Kit-Kat Shake",
            price: 250,
            description: "Your favourite chocolate blended in milk shake.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Chocolate OreoCheese Cake",
            price: 240,
            description: "Mascarpone cream cheese, home made crumble & cream.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Chocolate Perk Shake",
            price: 230,
            description: "Your favourite chocolate blended in milk shake.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Chicken Clubhouse Sandwich",
            price: 350,
            description:
              "Chicken - The whole nine yards. Classic club toasted sandwich bread layered with juicy grilled chicken pieces, sliced chicken ham, egg, mayonnaise, salad & cheese",
            images: [
              "https://storage.hipal.life/minio/assets/b8215469-c213-45d3-a7c5-4f47d391142c",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Coconut Water ",
            price: 180,
            description: "Freshly squeezed cold press fresh fruit Juices.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Coffee Cup House Platter",
            price: 390,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Cream of Tomato Soup",
            price: 230,
            description:
              "Comforting classic, tangy & rich tomatoes cooked with cream. Served with Pav bun.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Crispy Onion Rings",
            price: 190,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Creamy Spinach Pasta ",
            price: 280,
            description:
              "Sautéed spinach & garlic mixed with rich creamy alfredo sauce, tossed with penne pasta & sprinkled parmesan.",
            images: [
              "https://storage.hipal.life/minio/assets/ff4852c7-382e-4b83-9d66-200e75408f25.jpeg",
              "https://storage.hipal.life/minio/assets/7765167d-1aef-4df9-a00d-26cdcffc5840.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Dangerous Devils",
            price: 310,
            description:
              "Coffee blended with ice-cream and chocolate cake, swirled with chocolate sauce & topped with whipped cream.",
            images: [
              "https://storage.hipal.life/minio/assets/55649a0c-fbd2-47e2-b6a6-c764ddcc3201.jpeg",
              "https://storage.hipal.life/minio/assets/21d0db9e-d593-4e6c-b2bb-106d03e63ce7.jpeg",
              "https://storage.hipal.life/minio/assets/74e2e6ec-1dcf-47b5-8e5c-0c7c31b79bcc.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Dark Chocolate Cheese Cake",
            price: 240,
            description: "Mascarpone cream cheese, home made crumble & cream.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Dessert Shot",
            price: 80,
            description:
              "Some popular flavors for dessert shots include Brownie,Choco fantasy,Biscoff,Mango..",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Devils White ",
            price: 270,
            description:
              "Coffee blended with ice-cream, swirled with chocolate sauce & topped with whipped cream..",
            images: [
              "https://storage.hipal.life/minio/assets/9f56a1de-719a-4b05-b993-e320241540c2.jpeg",
              "https://storage.hipal.life/minio/assets/fd1f2435-11b8-4605-8d7a-22bd39f40e27.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Doppio",
            price: 140,
            description:
              "A Double shot of full flavoured, concentrated freshly brewed pure Arabica Coffee.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Espresso",
            price: 100,
            description:
              "A shot of full flavoured, concentrated freshly brewed pure Arabica Coffee.",
            images: [
              "https://storage.hipal.life/minio/assets/65425d8d-9906-4a93-a6b4-dff3b5291c3d.jpeg",
              "https://storage.hipal.life/minio/assets/cef551cc-5105-49df-974a-5bf7912ae6f5.jpeg",
              "https://storage.hipal.life/minio/assets/93bcebd8-be49-4153-85c7-b3957072158a.jpeg",
              "https://storage.hipal.life/minio/assets/e7b396aa-893f-4a80-aa26-dbfcf2d1fef1.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Fire & Ice",
            price: 200,
            description:
              "A fiery chill - coconut water, sliced lime, fresh mint sprigs, green chili, salt, freshly ground black pepper, sweetener and soda.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Fish Fillet Burger",
            price: 330,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Fish Fingers ",
            price: 300,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "French Hot Chocolate",
            price: 210,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Ginger ale ",
            price: 200,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Gol Gappa",
            price: 190,
            description: "The Pani puris simply rocket it out there.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Green apple Mojito ",
            price: 200,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Jasmine Ice Tea",
            price: 210,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Keema Pav ",
            price: 380,
            description:
              "Minced mutton keema cooked with Indian spices & served with maska bun.",
            images: [
              "https://storage.hipal.life/minio/assets/b32b97b2-fc0e-49aa-827a-2a282019630e.jpeg",
              "https://storage.hipal.life/minio/assets/2bb002a2-13c0-453c-80e6-c14d34ba2607.jpeg",
              "https://storage.hipal.life/minio/assets/275c5bd3-2806-412b-b0a6-5ea68599dc5b.jpeg",
              "https://storage.hipal.life/minio/assets/8278411d-73ce-42da-aa4e-0aabc583e610.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Lemon Cold Brew Coffee",
            price: 220,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Lime Mojito",
            price: 200,
            description:
              "Fresh lime iced with green mint, sugar syrup & club soda (choice of sweet or salted)",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Mac n Cheese",
            price: 320,
            description:
              "Corallini pasta in a creamy béchamel sauce sprinkled with parmesan. Served with sautéed chicken / paneer fillet",
            images: [
              "https://storage.hipal.life/minio/assets/ff3bdf14-2577-4ad9-bfc2-0dcae7bb365d.jpeg",
              "https://storage.hipal.life/minio/assets/44848588-51b0-43a1-99b4-9936d448d70a.jpeg",
              "https://storage.hipal.life/minio/assets/c7403c34-8868-4518-b4dc-9d1d7fcc91e7.jpeg",
              "https://storage.hipal.life/minio/assets/c902c0ae-b676-4dc2-8789-0a7530938761.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Make Your Own Pizza ",
            price: 350,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Watermelon Juice ",
            price: 190,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Veg & Paneer Calzone",
            price: 350,
            description:
              "Fresh paneer, exotic vegetables, tomato sauce & mozzarella cheese.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Tzatziki & Spiced Lavash",
            price: 180,
            description:
              "Tzatziki dip served with spiced oven baked Lavash triangles",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Tandoori Sandwich",
            price: 290,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Sweet Lime Juice Orange Juice",
            price: 180,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Sugar doughnuts",
            price: 140,
            description:
              "Freshly baked doughnuts glazed with sugar or chocolate.",
            images: [],
            dishTypes: ["EGG"],
          },
          {
            name: "Strawberry Shake",
            price: 250,
            description:
              "Rich creamy shakes with chunks of fresh fruits. Seasonal Variants basis availability.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Spring Rolls Cheesy Corn",
            price: 220,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Spring Rolls Cheesy Chicken",
            price: 280,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Spicy Piri Piri Sauce Penne Pasta",
            price: 280,
            description:
              "Pasta penne tossed with succulent shredded chicken or sautéed exotic vegetables with your choice of sauce ",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Aglio e Olio ",
            price: 250,
            description:
              "A simple classic Penne pasta sauted in olive oil with minced garlic, basil chili flakes.",
            images: [
              "https://storage.hipal.life/minio/assets/2f2f39fa-994b-4754-ad42-6b098e1b5d54",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Spaghetti & Meat Bolognese",
            price: 290,
            description:
              "Minced mutton meat in bolognese sauce served over spaghetti pasta.",
            images: [
              "https://storage.hipal.life/minio/assets/870d3b1b-13ca-4bfe-a53a-20c768759396.jpeg",
              "https://storage.hipal.life/minio/assets/3778a285-8308-41ee-9cb9-9d2acc3f3728.jpeg",
              "https://storage.hipal.life/minio/assets/5c867716-f392-460c-89e2-6d91490bbea1.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Seasonal fruits Strawberry  Mango ",
            price: 240,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Seasonal fruits Cheese Cake Strawberry Mango",
            price: 240,
            description: "Mascarpone cream cheese, home made crumble & cream",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Pour Over",
            price: 180,
            description:
              "Brew our specialty coffee at your table.  Pour-over coffee brings out the unique flavours of our Chikmagalur, Arabica beans.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Potato Wedges",
            price: 240,
            description: "",
            images: [
              "https://storage.hipal.life/minio/assets/b4291a28-d992-4591-b9ab-3ad55aee2853",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Pork Sausages with Bacon & Cheese ",
            price: 490,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Pork Pepperoni Calzone",
            price: 550,
            description: "Tomato sauce, mozzarella cheese & pepperoni slices.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Pineapple Juice ",
            price: 230,
            description: "Freshly squeezed cold press fresh fruit Juices. ",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Peri Peri Wedges",
            price: 260,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Pepperoni Pizza pork",
            price: 590,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Peach Ice Tea",
            price: 230,
            description:
              "Peach Iced Tea is a delightful and refreshing beverage that combines the natural sweetness of juicy peaches with the cool and invigorating qualities of iced tea",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Organic Green Tea",
            price: 180,
            description: "Freshly steeped green tea, served mildly hot.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Orange Juice",
            price: 200,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "No Name Pizza ",
            price: 370,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "New Orleans Burger",
            price: 340,
            description:
              "Succulent grilled chicken/paneer fillet, caramelized mushrooms & onion, jalapeños, cheese & spicy smoked sauce",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Naughty Frappe",
            price: 290,
            description:
              "Frappé blended with chocolate brownie, swirled with chocolate sauce & topped with whipped cream.",
            images: [
              "https://storage.hipal.life/minio/assets/d001e593-5c63-424c-8ced-b2b2ca22faf3.jpeg",
              "https://storage.hipal.life/minio/assets/adc5c74d-8146-44b3-9b7d-b0f896271af1.jpeg",
              "https://storage.hipal.life/minio/assets/ee347bd5-e16a-4391-9640-d37942614778.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Mutton Burger",
            price: 380,
            description:
              "Marinated mutton steak, grilled on a ribbed skillet served with sautéed onions, garlic and melted cheese",
            images: [
              "https://storage.hipal.life/minio/assets/46bc2d6c-c23e-4091-87d7-6708dbccd260.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Mushroom Pasta ",
            price: 310,
            description:
              "Button mushrooms /grilled chicken, sautéed in creamy alfredo sauce and tossed with penne pasta & sprinkled with parmesan",
            images: [
              "https://storage.hipal.life/minio/assets/f976008e-4214-49ac-82fe-f25c3dd0ce0f.jpeg",
              "https://storage.hipal.life/minio/assets/3a7d3fd0-2fb9-4ca5-aab3-b743b39c8152.jpeg",
              "https://storage.hipal.life/minio/assets/a6eb37c8-cab9-4756-aa21-966b0f399235.jpeg",
              "https://storage.hipal.life/minio/assets/a96a0bf6-aa3c-4200-bbbd-61383e42075f.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Mixed Pork Grill Sizzler",
            price: 480,
            description:
              "Chicken breast, chicken sausages, Pork sausages, topped with bacon strips; grilled on an iron skillet",
            images: [
              "https://storage.hipal.life/minio/assets/02535f2b-d427-4ff4-8e58-a579e9fed163.jpeg",
              "https://storage.hipal.life/minio/assets/c7ccb7c6-1ee8-463a-8a2a-0c3a5bfbba67.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Makhani Rice Bowl ",
            price: 320,
            description:
              " Tandoori marinade  paneer  sauted in butter chicken inspired gravy served with Jasmine rice.",
            images: [
              "https://storage.hipal.life/minio/assets/908624da-a354-44e3-92bf-038c3aea57e7.jpeg",
              "https://storage.hipal.life/minio/assets/84d1653b-bf97-4239-8be9-f86e284b6f7e.jpeg",
              "https://storage.hipal.life/minio/assets/fc1d1e0b-5ea6-4864-a108-a7c5f69bca2c.jpeg",
              "https://storage.hipal.life/minio/assets/339d9a8d-7b04-4d0d-aa2e-df9339df8655.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Margherita Pizza",
            price: 370,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Vegetarian Club Sandwich",
            price: 310,
            description:
              "Fried Potato tikki,green bell peppers & Onion marinated in a mustard dressling with freshly cut greens & toasted in sandwich bread and cheese",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Cookie Chocolate Shake",
            price: 250,
            description:
              "Delicious home Baked cookies blended in chocolate sauce",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Cucumber Mojito",
            price: 200,
            description:
              "A summer breather - muddled cucumber,sliced lime,fresh mintsprigs,white sugar and Soda.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Mockingbird Mocktail",
            price: 240,
            description:
              "Watermelon Juice,Grenadines syrup,Crushed ice and Lime seasoning.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Benoffie Pie  Crumble",
            price: 240,
            description: "Banana,Toffee Sauce,Cookie Crumble and Cream",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Apple Cobbler",
            price: 270,
            description:
              "Baked Apple,Home made Crumble,Vanilla Ice cream & Raspberry Sauce",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Spring Roll Cheese Sticks",
            price: 220,
            description:
              "Cheese sticks rolled into spring roll and golden fried.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Spicy Chicken Fingers",
            price: 300,
            description:
              "Spicy Chicken strips batter fried golden brown & Served with Dip Sauce",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Spicy Paneer Fingers",
            price: 300,
            description:
              "Spicy Chicken strips batter fried golden brown & Served with Dip Sauce",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Golden Fried Prawns",
            price: 460,
            description:
              "Large Prawns marinated with garlic salt & Lime dipping,batter fried crispy golden brown.Served with a portion of fries",
            images: [
              "https://storage.hipal.life/minio/assets/9cbaf627-6723-4054-9f89-6b318ecd48c5",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Chocolate Love",
            price: 165,
            description:
              'In essence, "chocolate love" captures the enchanting allure and the irresistible allure of chocolate,Strawberry & Cream that transcends mere taste and becomes a symbol of joy, comfort, and indulgence in many people\'s lives.',
            images: [
              "https://storage.hipal.life/minio/assets/997e36e5-fde4-4228-8707-88d4dad890f5",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Kids Fries",
            price: 99,
            description:
              "Our Kids' French Fries are a deliciously crispy and golden treat that brings smiles with every bite\n",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Turkish Eggs with Greek Yogurt",
            price: 250,
            description:
              "Çilbir, is a delightful dish that combines par boiled eggs with creamy yogurt and a spiced drizzle.",
            images: [
              "https://storage.hipal.life/minio/assets/d81ea1a1-c270-4dfc-bcb4-c1a63cb8996f",
            ],
            dishTypes: ["EGG"],
          },
          {
            name: "Eggs with Pesto  Feta",
            price: 250,
            description:
              "Perfectly poached eggs served on toast with tangy greek yougurt and drizzled with cheesey feta & chili oil.",
            images: [
              "https://storage.hipal.life/minio/assets/4bc1c2fd-f525-496f-bce8-8480c2248962",
              "https://storage.hipal.life/minio/assets/725af982-adfd-4bb1-8851-048619a1849e",
              "https://storage.hipal.life/minio/assets/e9b96392-83f7-40bb-ae59-06efffebf643",
            ],
            dishTypes: ["EGG"],
          },
          {
            name: "Mediterranean Egg Skillet",
            price: 250,
            description:
              "Poached eggs with sauté mushroom & baby spinach garnished with fresh Feta.",
            images: [],
            dishTypes: ["EGG"],
          },
          {
            name: "Turkish Shakshuka",
            price: 250,
            description:
              "Fried eggs, cradled with peppers, onions, and succulent tomatoes sprinkling of fresh herbs. Served piping hot in a skillet with bread.",
            images: [],
            dishTypes: ["EGG"],
          },
          {
            name: "Sicilian Stracciatella Toast",
            price: 250,
            description:
              "Fresh creamy mozzarella shred, delicately blended with ripe plum tomatoes, salad leaves & aromatic garlic.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Caesar Salads",
            price: 310,
            description:
              "Crunchy lettuce, rocket leaves, bell peppers, grape tomato, cucumber, red onion, crotons, parmesan shavings & home made caesar dressing with worcestershire sauce, mayo, dijon mustard, garlic & lemon juice.",
            images: [
              "https://storage.hipal.life/minio/assets/fb05a1dc-1933-42f4-9c56-fc3f20e5c8b8",
              "https://storage.hipal.life/minio/assets/cbce696b-052c-4030-b440-4aa1f5f7b44b",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Mediterranean Salads",
            price: 310,
            description:
              "Fresh garden lettuce, rocket leaves, plum cherry tomatoes, green olives, spiced chickpeas, sautéed zucchini, baked croutons, cheese and drizzled with a zesty fresh Mediterranean vinaigrette.",
            images: [
              "https://storage.hipal.life/minio/assets/c9b62eb4-fbe0-4a04-9120-6c8883f8df65",
              "https://storage.hipal.life/minio/assets/a7bd55fe-caaa-4061-8e55-bb914b2d0ed7",
              "https://storage.hipal.life/minio/assets/01060762-2eca-480c-bbde-aad52e783216",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Som Tum Green Papaya Salad",
            price: 280,
            description:
              "Strands of green papaya delicately tossed with herbs, tangy lime juice, and a touch of chili & garnished with peanuts.",
            images: [
              "https://storage.hipal.life/minio/assets/cc180863-5a5c-4f2c-aae9-f65a675d52fa",
              "https://storage.hipal.life/minio/assets/54602166-5f88-4652-bb0e-6bbd06aeeb7e",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Dahi Papdi Chaat",
            price: 190,
            description:
              "Crispy papdis with creamy yogurt, mint  tangy tamarind chutney adding a zesty twist. ",
            images: [
              "https://storage.hipal.life/minio/assets/0ae2a14e-45a2-4d41-a358-5a86384ae13f",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Loaded Nacho Platter",
            price: 240,
            description:
              "Crispy tortilla chips, melted cheese, jalapeos, diced tomatoes and Mexican style baked beans.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Salsa n Chips",
            price: 200,
            description:
              "Crunchy tortilla chips served with our zesty home made salsa.",
            images: [
              "https://storage.hipal.life/minio/assets/95d49fe9-a519-4b50-b185-027da030cdf8",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Karaage Japanese Burger",
            price: 340,
            description:
              "Crispy panko crusted chicken or Tofu fillet in a soft bun, drizzled with wasabi mayo and served with potato fries.",
            images: [
              "https://storage.hipal.life/minio/assets/f821350d-dfef-4349-b427-d27484495525",
            ],
            dishTypes: ["NON_VEG"],
          },
        ];

        const sDishes = [
          {
            name: "Quinoa Salad Veg",
            price: 249,
            description:
              "Boiled quinoa mixed with bell peppers and dressed with a fresh orange vinaigrette.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Quinoa Salad Non Veg",
            price: 299,
            description:
              "Boiled quinoa, bell peppers, and grilled chicken dressed with fresh orange vinaigrette.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Crispy Classic Caesar Salad Veg",
            price: 249,
            description:
              "Mix of lettuce and broccoli, topped with classic Caesar dressing.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Crispy Classic Caesar Salad Non Veg",
            price: 299,
            description:
              "Mix of lettuce, broccoli, and grilled chicken, topped with classic Caesar dressing.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Mexican Farm House Salad Veg",
            price: 249,
            description:
              "Lettuce, bell peppers, corn, jalapenos, and olives with a mustard dressing.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Mexican Farm House Salad Non Veg",
            price: 299,
            description:
              "Lettuce, bell peppers, corn, jalapenos, olives, and grilled chicken with mustard dressing.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Raw Papaya Salad",
            price: 249,
            description:
              "Fine strips of papaya and carrot with a peanut dressing.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "French Fries",
            price: 199,
            description: "Classic crispy French fries.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "French Fries Cheese",
            price: 249,
            description: "Classic crispy French fries with cheese.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Crispy Potato Wedges",
            price: 199,
            description: "Crispy, golden brown potato wedges.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Oven Baked Nachos Veg",
            price: 249,
            description:
              "Oven baked nachos served with melted cheese and jalapenos.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Oven Baked Nachos Non Veg",
            price: 299,
            description:
              "Oven baked nachos served with melted cheese, jalapenos, and grilled chicken.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Beetroot Hummus & Pita",
            price: 249,
            description: "Creamy beetroot hummus served with pita bread.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Avocado Bruschetta",
            price: 229,
            description: "Fresh avocado on toasted bruschetta.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Garlic Bread Plain",
            price: 199,
            description: "Toasted garlic bread.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Garlic Bread Cheese",
            price: 229,
            description: "Toasted garlic bread topped with melted cheese.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Garlic Bread Chilli",
            price: 229,
            description: "Toasted garlic bread with a hint of chili.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Homemade Cheese Dynamite",
            price: 249,
            description: "Fried cheese balls with a crispy exterior.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Batter Fried Zucchini Fritters",
            price: 229,
            description:
              "Batter fried zucchini fritters with a crunchy coating.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Stir Fried Broccoli",
            price: 249,
            description: "Freshly stir fried broccoli with a light seasoning.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Chicken Wings BBQ",
            price: 349,
            description:
              "Chicken wings marinated in BBQ sauce and grilled to perfection.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Chicken Wings Lemon Pepper",
            price: 349,
            description:
              "Chicken wings marinated in lemon pepper sauce and grilled.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Hunan Chicken",
            price: 349,
            description: "Spicy Hunan style chicken stir fry.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Grilled Pesto Fish",
            price: 349,
            description: "Grilled fish fillet with a flavorful pesto sauce.",
            images: [
              "https://storage.hipal.life/minio/assets/9e8cf83f-e5bc-4c47-8216-3e849cf31bcd.jpeg",
              "https://storage.hipal.life/minio/assets/b5c5ca78-93aa-4233-8663-1f3ad60b7921.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Fish & Chips",
            price: 349,
            description: "Classic battered fish and chips.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Korean Fried Chicken",
            price: 349,
            description: "Crispy fried chicken with Korean spices.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Hot Basil Cottage Cheese",
            price: 269,
            description: "Cottage cheese stir fried with fresh basil.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Water Chestnut in Black Pepper Sauce",
            price: 249,
            description: "Water chestnut stir fried with black pepper sauce.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Corn & Water Chestnut Parcel",
            price: 249,
            description: "Crispy parcels filled with corn and water chestnut.",
            images: [
              "https://storage.hipal.life/minio/assets/6a1139a7-04da-4e45-b77a-c730117e66a1.jpeg",
              "https://storage.hipal.life/minio/assets/980c3007-dbc1-4a2b-9c34-473b23c656d9.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Button Mushroom in Sriracha Sauce",
            price: 269,
            description: "Button mushrooms stir fried in spicy sriracha sauce.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Mix Vegetables Tulip",
            price: 249,
            description: "A mix of fresh vegetables prepared in a tulip style.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Fish in Basil Sauce",
            price: 349,
            description: "Fish fillet cooked in a fragrant basil sauce.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Tempura Three Ways",
            price: 399,
            description: "Tempura prepared in three unique styles.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Tai Pai Chicken",
            price: 249,
            description: "Spicy Tai Pai style chicken stir fry.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Teriyaki Toasted Chicken",
            price: 249,
            description: "Chicken toasted with a rich teriyaki sauce.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Open Face Cheese Burger",
            price: 299,
            description: "Open face burger topped with melted cheese.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Crispy Chicken Burger",
            price: 349,
            description: "Crispy chicken patty in a toasted bun.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "California Lamb Burger",
            price: 399,
            description:
              "Juicy lamb burger with fresh California style toppings.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Veg Grilled Sandwich",
            price: 299,
            description: "Grilled sandwich filled with fresh vegetables.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Cottage Cheese Sandwich",
            price: 349,
            description: "Grilled sandwich filled with cottage cheese.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Club Classic Sandwich",
            price: 349,
            description: "Classic club sandwich with layers of filling.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Grilled Chicken Sandwich",
            price: 349,
            description: "Grilled sandwich with juicy chicken filling.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Farm Fresh",
            price: 399,
            description: "Pizza topped with fresh farm vegetables.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Pollo A La Margherita",
            price: 499,
            description: "Margherita pizza topped with grilled chicken.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Chicken Supremo Chorizo",
            price: 499,
            description: "Chicken chorizo pizza with mozzarella and tomato.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Pollo A La Griglia",
            price: 499,
            description: "BBQ chicken pizza with mozzarella and tomato.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Double Sauce Veg",
            price: 399,
            description: "Pizza with double layer of sauce.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Double Sauce Non Veg",
            price: 499,
            description: "Pizza with double layer of sauce and chicken.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Meat Lover Pizza",
            price: 499,
            description: "Pizza loaded with assorted meats.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Cottage Cheese Steak",
            price: 429,
            description:
              "Grilled paneer served with mashed potatoes and vegetables.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Mushroom Stroganoff",
            price: 429,
            description: "Creamy mushroom stroganoff with herb rice.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Jerk Spice Grilled Chicken",
            price: 449,
            description:
              "Jerk spice marinated chicken with grilled vegetables.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Grilled Chicken Breast",
            price: 449,
            description:
              "Grilled chicken breast with mashed potatoes and vegetables.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Grilled Basa with Lemon Butter",
            price: 475,
            description: "Grilled basa fish with lemon butter sauce and pilaf.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Lamb Chops",
            price: 475,
            description:
              "Grilled lamb chops with mashed potatoes and pepper sauce.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Nasi Goreng Chicken",
            price: 429,
            description: "Indonesian fried rice with chicken.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Nasi Goreng Prawns",
            price: 449,
            description: "Indonesian fried rice with prawns.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Burnt Garlic Fried Rice Veg",
            price: 399,
            description: "Fried rice with burnt garlic and vegetables.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Burnt Garlic Fried Rice Chicken",
            price: 429,
            description: "Fried rice with burnt garlic and chicken.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Burnt Garlic Fried Rice Prawns",
            price: 449,
            description: "Fried rice with burnt garlic and prawns.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Bai Cha Fried Rice Veg",
            price: 399,
            description: "Thai style fried rice with vegetables.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Bai Cha Fried Rice Chicken",
            price: 429,
            description: "Thai style fried rice with chicken.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Red Thai Curry Veg",
            price: 399,
            description: "Red Thai curry with vegetables served with rice.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Red Thai Curry Chicken",
            price: 429,
            description: "Red Thai curry with chicken served with rice.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Green Thai Curry Veg",
            price: 399,
            description: "Green Thai curry with vegetables served with rice.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Green Thai Curry Chicken",
            price: 429,
            description: "Green Thai curry with chicken served with rice.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Chilli Butter Garlic Noodles Veg",
            price: 399,
            description: "Noodles with chili butter garlic sauce.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Chilli Butter Garlic Noodles Chicken",
            price: 429,
            description: "Noodles with chili butter garlic sauce and chicken.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Schezwan Noodles Veg",
            price: 399,
            description: "Spicy schezwan noodles with vegetables.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Schezwan Noodles Chicken",
            price: 429,
            description: "Spicy schezwan noodles with chicken.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Kimchi Fried Rice Veg",
            price: 399,
            description: "Kimchi flavored fried rice with vegetables.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Kimchi Fried Rice Chicken",
            price: 429,
            description: "Kimchi flavored fried rice with chicken.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Hakka Noodles Veg",
            price: 399,
            description: "Classic Hakka noodles with vegetables.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Hakka Noodles Chicken",
            price: 429,
            description: "Classic Hakka noodles with chicken.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Create Your Pasta Bowl Veg",
            price: 399,
            description: "Choice of pasta with sauce and garlic bread.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Create Your Pasta Bowl Chicken",
            price: 449,
            description: "Choice of pasta with sauce and chicken.",
            images: [
              "https://storage.hipal.life/minio/assets/4d49ff64-1bb0-40d0-82cd-27bbbccedfa1.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Spaghetti Aglio Olio Veg",
            price: 399,
            description: "Spaghetti with garlic and olive oil.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Spaghetti Aglio Olio Chicken",
            price: 449,
            description: "Spaghetti with garlic, olive oil, and chicken.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "All-American Mac & Cheese Veg",
            price: 399,
            description: "Classic mac and cheese with vegetables.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "All-American Mac & Cheese Non Veg",
            price: 449,
            description: "Classic mac and cheese with chicken.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Mexican Burrito Bowl Veg",
            price: 449,
            description:
              "Mexican rice with pico de gallo, cheese, beans, and corn.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Mexican Burrito Bowl Non Veg",
            price: 499,
            description:
              "Mexican rice with pico de gallo, cheese, beans, corn, and chicken.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Chermoula Grilled Chicken with Veggies",
            price: 499,
            description:
              "All spices grilled chicken served with toasted quinoa and grilled veg",
            images: [
              "https://storage.hipal.life/minio/assets/c3cdb3e3-9952-4be9-aab9-276bdc867fe2.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Crispy Peri Peri Chicken Bowl",
            price: 499,
            description:
              "Peri Peri chicken with cilantro rice and pico de gallo.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Bibimbap Veg",
            price: 399,
            description: "Korean mixed rice with vegetables.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Bibimbap Chicken",
            price: 449,
            description: "Korean mixed rice with chicken.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Plain Maggie",
            price: 149,
            description: "Classic plain Maggie noodles.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Cheese Maggie",
            price: 199,
            description: "Maggie noodles with cheese.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Mix Veg Maggie",
            price: 199,
            description: "Maggie noodles with mixed vegetables.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Chicken with Egg Maggie",
            price: 229,
            description: "Maggie noodles with chicken and egg.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Espresso",
            price: 129,
            description:
              "A strong, concentrated coffee brewed by forcing hot water under pressure through finely ground coffee beans.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Doppio",
            price: 249,
            description:
              "A double shot of espresso for a stronger coffee experience.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Americano",
            price: 129,
            description:
              "A diluted espresso served with hot water for a lighter, less intense coffee.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Machiato",
            price: 129,
            description:
              "Espresso with a small amount of milk, usually foamed.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Cappuccino",
            price: 199,
            description: "Espresso with steamed milk and a deep layer of foam.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Flat white",
            price: 199,
            description:
              "A coffee drink consisting of espresso with microfoam.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Affogato",
            price: 159,
            description:
              "A coffee-based dessert with a shot of hot espresso poured over a scoop of vanilla ice cream.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Mocha",
            price: 199,
            description: "Espresso mixed with hot milk and chocolate.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Caramel mocha",
            price: 199,
            description:
              "Espresso mixed with hot milk, chocolate, and caramel flavor.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Hot chocolate",
            price: 249,
            description:
              "Hot milk with chocolate syrup, topped with whipped cream.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Irish coffee",
            price: 199,
            description:
              "Coffee with Irish whiskey, sugar, and topped with cream.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Filter coffee",
            price: 129,
            description:
              "A coffee drink prepared by steeping coffee grounds in hot water and then filtering out the grounds.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Iced black coffee",
            price: 149,
            description: "Black coffee served over ice.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Vietnamese Coffee",
            price: 229,
            description:
              "Sweetened coffee with condensed milk, served over ice.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Iced Lattee",
            price: 229,
            description: "Iced coffee with milk.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Mocha frappe",
            price: 249,
            description: "Blended coffee with ice, milk, and chocolate syrup.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Cold coffee",
            price: 199,
            description: "Chilled coffee with milk and sugar.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Irish cold coffee",
            price: 249,
            description: "Chilled coffee with Irish cream flavor.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Hazelnut frappe",
            price: 249,
            description: "Blended coffee with ice, milk, and hazelnut syrup.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Caramel cold coffee",
            price: 249,
            description: "Chilled coffee with milk and caramel flavor.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Nutella cold coffee",
            price: 259,
            description: "Blended coffee with ice, milk, and Nutella.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Magic brownie frappe",
            price: 259,
            description: "Blended coffee with ice, milk, and brownie chunks.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Ice chocolate mocha",
            price: 249,
            description: "Blended coffee with ice, milk, and chocolate syrup.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Matcha latte",
            price: 229,
            description: "Green tea with matcha powder and steamed milk.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Hibiscus Green Tea",
            price: 199,
            description: "Green tea infused with hibiscus flowers.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Chamomile with cinnamon",
            price: 199,
            description: "Green tea with chamomile flowers and cinnamon.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Assam green tea",
            price: 199,
            description: "A type of green tea from Assam region.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Roses green tea",
            price: 199,
            description: "Green tea infused with rose petals.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Kashmiri green tea",
            price: 199,
            description: "Green tea with Kashmiri saffron.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Jasmine green tea",
            price: 199,
            description: "Green tea with jasmine flowers.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Angori whole milk tea",
            price: 199,
            description: "Whole milk tea with Angori grapes.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Blue pea",
            price: 249,
            description: "Tea made from butterfly pea flowers, served cold.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Oreo licious",
            price: 249,
            description: "Blended milkshake with Oreo cookies.",
            images: [
              "https://storage.hipal.life/minio/assets/ff3bd311-6162-42fb-9e17-09eae0ff4306.jpeg",
              "https://storage.hipal.life/minio/assets/0cf31d2d-93a3-48c1-93fa-05ae89b991f7.png",
              "https://storage.hipal.life/minio/assets/4b600cbc-93ee-4ffe-81e2-7c88239e32c7.jpeg",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Caramelita",
            price: 299,
            description: "Blended milkshake with caramel flavor.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Double berry",
            price: 299,
            description: "Blended milkshake with mixed berries.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Nuttyful",
            price: 299,
            description: "Blended milkshake with nuts and milk.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Biscoff",
            price: 299,
            description: "Blended milkshake with Biscoff cookies.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "The brownie",
            price: 299,
            description: "Blended milkshake with brownie chunks.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Cheese cake",
            price: 299,
            description: "Blended milkshake with cheesecake flavor.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Peanut butter banana shake",
            price: 299,
            description: "Blended milkshake with peanut butter and banana.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Mango shake",
            price: 249,
            description: "Blended milkshake with mango.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Coffee lemonade",
            price: 249,
            description: "Cold coffee with lemonade.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Litchi",
            price: 249,
            description: "Cold coffee with litchi flavor.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Cranberry coffee",
            price: 249,
            description: "Cold coffee with cranberry flavor.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Virgin orange",
            price: 249,
            description: "Cold coffee with orange flavor.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Peach iced tea",
            price: 199,
            description: "Iced tea with peach flavor.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Passion fruit iced tea",
            price: 199,
            description: "Iced tea with passion fruit flavor.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Hibiscus iced tea",
            price: 199,
            description: "Iced tea with hibiscus flavor.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Pineapple juice",
            price: 199,
            description: "Freshly squeezed pineapple juice.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Orange juice",
            price: 199,
            description: "Freshly squeezed orange juice.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Watermelon juice",
            price: 199,
            description: "Freshly squeezed watermelon juice.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Mosambi juice",
            price: 199,
            description: "Freshly squeezed mosambi (sweet lime) juice.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Fresh lime soda",
            price: 149,
            description:
              "A refreshing drink made with lime juice and soda. Options: Sweet, Salt, Mix",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Virgin sangria",
            price: 249,
            description: "A non-alcoholic sangria made with fruit juices.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Chilli guava",
            price: 249,
            description: "A spicy guava juice drink.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Virgin mojito",
            price: 199,
            description:
              "A refreshing drink made with lime, soda, and options of blue curacao or watermelon flavor.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Basil mass",
            price: 249,
            description: "A refreshing drink made with basil and fruit juice.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Popcorn face",
            price: 249,
            description: "A popcorn-flavored drink.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Virgin colada",
            price: 249,
            description:
              "A non-alcoholic pi�a colada made with coconut cream and pineapple juice.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Virgin cucumber mojito",
            price: 199,
            description: "A refreshing drink made with cucumber and mint.",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Tod Mun Pla fish",
            price: 349,
            description: "Traditional Thai fish cakes.",
            images: [
              "https://storage.hipal.life/minio/assets/f4134cae-bf28-4b44-8364-b4b54b007295.jpeg",
              "https://storage.hipal.life/minio/assets/44d9fe95-28ba-4f7f-a89b-b99c64a1bb7a.png",
            ],
            dishTypes: ["VEG"],
          },
          {
            name: "Cafe Latte ",
            price: 199,
            description: "Espresso with steamed milk and thin layer of foam",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Lemon ice tea",
            price: 199,
            description: "Iced tea with refreshing lemon flavor  ",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Paneer Spinach & Corn Rice Veg",
            price: 449,
            description:
              "saute paneer and corn with spinach mixed well in sriracha sauce",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Calabrese - BBQ Paneer",
            price: 449,
            description: "BBQ Paneer Pizza with mozzarella & tomato",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "All Time Favourite - Margherita",
            price: 399,
            description: "Classic Margherita pizza with mozzarella and tomato",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Fillo Roll",
            price: 249,
            description: "Cheese Stuffed Roll",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Red Velvet Cake",
            price: 249,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Opera Cake",
            price: 249,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Lotus Biscoff Cheesecake",
            price: 249,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Blueberry Cheesecake",
            price: 249,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Diet Coke Can",
            price: 99,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Coke Can",
            price: 99,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Sprite Can",
            price: 99,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Thumsup Can",
            price: 99,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
          {
            name: "Redbull Can",
            price: 249,
            description: "",
            images: [],
            dishTypes: ["VEG"],
          },
        ];
        //
        for (const dish of sDishes) {
          const dishAlreadyExists = await Dish.findOne({
            businessId: "66a8032dd1afb0385308ba86",
            name: dish.name,
            isDeleted: false,
          });
          if (!dishAlreadyExists) {
            const createDish = await Dish.create(
              [{ ...dish, businessId: "66a8032dd1afb0385308ba86" }],
              { session },
            );
            if (!createDish) {
              return c.json(
                { err: true, message: "Error in creating dishes", data: {} },
                400,
              );
            }
          }
        }
        return c.json({
          err: false,
          message: "Dishes created successfully",
          data: {},
        });
      });
    },
  );

export default dishesRouter;
