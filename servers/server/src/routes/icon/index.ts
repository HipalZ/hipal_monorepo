import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
//
const iconRouter = new Hono().get(
  "/:businessId",
  zValidator(
    "param",
    z.object({
      businessId: z.string().min(1).max(500),
    }),
  ),
  async (c) => {
    const { businessId } = c.req.param();

    const iconWithCategories = [
      {
        categoryName: "sandwiches",
        iconUrls: ["https://assets.hipalz.com/Sandwiches/sandwiche(1).png"],
      },
      {
        categoryName: "burgers",
        iconUrls: [
          "https://assets.hipalz.com/Burgers/Burger1.png",

          "https://assets.hipalz.com/Burgers/Burger%20%20(1).png",

          "https://assets.hipalz.com/Burgers/Burger2.png",

          "https://assets.hipalz.com/Burgers/Burger3.png",
        ],
      },
      {
        categoryName: "pizzas",
        iconUrls: ["https://assets.hipalz.com/Pizza/Pizza.png"],
      },
      {
        categoryName: "Bowls",
        iconUrls: ["https://assets.hipalz.com/Bowls/Bowl.png"],
      },
      {
        categoryName: "milkshakes",
        iconUrls: ["https://assets.hipalz.com/Milkshakes/Milkshakes.png"],
      },
      {
        categoryName: "alcohol",
        iconUrls: ["https://assets.hipalz.com/Alcohol/alcohol.png"],
      },
      {
        categoryName: "cakes",
        iconUrls: ["https://assets.hipalz.com/Cakes/cake.png"],
      },
      {
        categoryName: "icecream",
        iconUrls: ["https://assets.hipalz.com/Icecream/Ice%20Cream.png"],
      },
      {
        categoryName: "seafood",
        icons: ["https://assets.hipalz.com/SeaFood/25%20Seafood%20(1).png"],
      },
    ];

    return c.json({
      businessId,
      iconWithCategories,
    });
  },
);

export default iconRouter;
