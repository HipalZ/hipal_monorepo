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
    }),
  ),
  async (c) => {
    const { businessId, userId, tab } = c.req.query();
    const output = {
      management: [
        {
          name: "themes",
          description: "make your app look good",
          inprogress: false,
          visibility: true,
          image: "https://example.com/theme.png",
          redirectionUrl: "themes",
        },
        {
          name: "payments",
          description: "all payment related stuff",
          inprogress: false,
          visibility: true,
          image: "https://example.com/payment.png",
          redirectionUrl: "payments",
        },
        {
          name: "reports",
          description: "download your reports",
          inprogress: false,
          visibility: true,
          image: "https://example.com/report.png",
          redirectionUrl: "reports",
        },
        {
          name: "point_of_sale",
          description: "manage your pos",
          inprogress: false,
          visibility: false,
          image: "https://example.com/pos.png",
          redirectionUrl: "pos",
        },
        {
          name: "staff",
          description: "create your team",
          inprogress: false,
          visibility: true,
          image: "https://example.com/staff.png",
          redirectionUrl: "staff",
        },
        {
          name: "password_management",
          description: "setup all passwords",
          inprogress: false,
          visibility: false,
          image: "https://example.com/password.png",
          redirectionUrl: "password",
        },
        {
          name: "settings",
          description: "all settings in one place",
          inprogress: false,
          visibility: false,
          image: "https://example.com/settings.png",
          redirectionUrl: "settings",
        },
      ],
      services: [
        {
          name: "explore_page",
          description: "make your website more beautiful",
          inprogress: false,
          visibility: true,
          image: "https://example.com/explore_page.png",
          redirectionUrl: "explorepage",
        },
        {
          name: "Qrs",
          description: "manage your Qrs",
          inprogress: false,
          visibility: false,
          image: "https://example.com/zones.png",
          redirectionUrl: "zones",
        },
        {
          name: "menu",
          description: "manage your menu items",
          inprogress: false,
          visibility: false,
          image: "https://example.com/menu.png",
          redirectionUrl: "select-menu",
        },
        {
          name: "birthday_events",
          description: "manage your birthday events",
          inprogress: false,
          visibility: true,
          image: "https://example.com/birthday_events.png",
          redirectionUrl: "events",
        },
        {
          name: "my_gallery",
          description: "show about ambience and vibe",
          inprogress: false,
          visibility: true,
          image: "https://example.com/my_gallery.png",
          redirectionUrl: "thumbnail",
        },
      ],
      coupon_and_loyalty: [
        {
          name: "loyalty",
          description: "manage your loyalty",
          inprogress: false,
          visibility: true,
          image: "https://example.com/loyalty.png",
          redirectionUrl: "loyalty",
        },
        {
          name: "coupons",
          description: "manage your coupons",
          inprogress: false,
          visibility: true,
          image: "https://example.com/coupons.png",
          redirectionUrl: "coupons",
        },
      ],
      marketing: [
        {
          name: "hi_people",
          description: "manage your hi_people",
          inprogress: false,
          visibility: true,
          image: "https://example.com/hi_people.png",
          redirectionUrl: "people",
        },
        {
          name: "reviews",
          description: "manage your reviews",
          inprogress: false,
          visibility: true,
          image: "https://example.com/reviews.png",
          redirectionUrl: "reviews",
        },
        {
          name: "whatsapp",
          description: "manage your whatsapp",
          inprogress: false,
          visibility: true,
          image: "https://example.com/whatsapp.png",
          redirectionUrl: "whatzapp",
        },
        {
          name: "analytics",
          description: "get insights of your business",
          inprogress: false,
          visibility: true,
          image: "https://example.com/analytics.png",
          redirectionUrl: "analytics",
        },
      ],
    };

    return respond(c, "Success", false, 200, output);
  },
);

export default cardRouter;
