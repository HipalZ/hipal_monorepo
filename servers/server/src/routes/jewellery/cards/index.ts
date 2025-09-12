import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "../../../utils/response";
//

const cardRouter = new Hono().get(
  "/",
  zValidator(
    "query",
    z.object({
      businessId: z.string().min(1).max(500),
      userId: z.string().min(1).max(500),
      tab: z.string().min(1).max(500),
    }),
  ),
  async (c) => {
    const { businessId, userId, tab } = c.req.query();
    if (tab === "management") {
      const cards = [
        {
          name: "themes",
          description: "make your app look good",
          inprogress: false,
          visibility: true,
          image: "https://example.com/theme.png",
        },
        {
          name: "payments",
          description: "all payment related stuff",
          inprogress: false,
          visibility: false,
          image: "https://example.com/payment.png",
        },
        {
          name: "reports",
          description: "download your reports",
          inprogress: false,
          visibility: false,
          image: "https://example.com/report.png",
        },
        {
          name: "point_of_sale",
          description: "manage your pos",
          inprogress: false,
          visibility: false,
          image: "https://example.com/pos.png",
        },
        {
          name: "staff",
          description: "create your team",
          inprogress: false,
          visibility: true,
          image: "https://example.com/staff.png",
        },
        {
          name: "password_management",
          description: "setup all passwords",
          inprogress: false,
          visibility: false,
          image: "https://example.com/password.png",
        },
        {
          name: "settings",
          description: "all settings in one place",
          inprogress: false,
          visibility: true,
          image: "https://example.com/settings.png",
        },
      ];

      return respond(c, "fetched cards", false, 200, cards);
    }

    if (tab === "services") {
      const cards = [
        {
          name: "explore_page",
          description: "make your website more beautiful",
          inprogress: false,
          visibility: true,
          image: "https://example.com/explore_page.png",
        },
        {
          name: "zones",
          description: "manage your zones and tables",
          inprogress: false,
          visibility: true,
          image: "https://example.com/zones.png",
        },
        {
          name: "menu",
          description: "manage your menu items",
          inprogress: false,
          visibility: true,
          image: "https://example.com/menu.png",
        },
        {
          name: "birthday_events",
          description: "manage your birthday events",
          inprogress: false,
          visibility: true,
          image: "https://example.com/birthday_events.png",
        },
        {
          name: "my_gallery",
          description: "show about ambience and vibe",
          inprogress: false,
          visibility: true,
          image: "https://example.com/my_gallery.png",
        },
      ];

      return respond(c, "fetched cards", false, 200, cards);
    }
    if (tab === "coupon_and_loyalty") {
      const cards = [
        {
          name: "loyalty",
          description: "manage your loyalty",
          inprogress: false,
          visibility: true,
          image: "https://example.com/loyalty.png",
        },
        {
          name: "coupons",
          description: "manage your coupons",
          inprogress: false,
          visibility: true,
          image: "https://example.com/coupons.png",
        },
      ];

      return respond(c, "fetched cards", false, 200, cards);
    }
    if (tab === "marketing") {
      const cards = [
        {
          name: "hi_people",
          description: "manage your hi_people",
          inprogress: false,
          visibility: false,
          image: "https://example.com/hi_people.png",
        },
        {
          name: "reviews",
          description: "manage your reviews",
          inprogress: false,
          visibility: true,
          image: "https://example.com/reviews.png",
        },
        {
          name: "whatsapp",
          description: "manage your whatsapp",
          inprogress: false,
          visibility: true,
          image: "https://example.com/whatsapp.png",
        },
        {
          name: "analytics",
          description: "get insights of your business",
          inprogress: false,
          visibility: true,
          image: "https://example.com/analytics.png",
        },
      ];

      return respond(c, "fetched cards", false, 200, cards);
    }
  },
);

export default cardRouter;
