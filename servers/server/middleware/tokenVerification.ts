import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import jwt from "jsonwebtoken";
//@ts-ignore
import { respond } from "../src/utils/response";

export const tokenVerification = async (c: Context, next: Next) => {
  const api_token = getCookie(c, "api_token");
  const headerData = c.req.header();
  const { server_secret, x_signature, electron_key } = headerData;

  if (electron_key) {
    return next();
  }

  const ignorePaths = [
    "/assets",
    "/ui",
    "/doc",
    "metrics",
    "/users/:id/stafflogin",
    "/users/ownerSignIn",
    "/users/ownerSignIn",
    "/users/ownerSignIn",
    "/menu/customlink",
    "/users/:id/signUp",
    "/users/verifyOtp",
    "/users/:id/signIn",
    "/token/push",
    "/event/getevents",
    "/categories",
    "/menu/fetch_table_menu",
    "/menu-banner/explore/:businessId",
    "/businesses/n/:customLink",
    "/businesses/get/Single/:businessId",
    "/businesses/themes/:businessId",
    "/bucket/images/fetch_bucket_by_business",
    "/kot/table_kot/:tableId",
    "/businesses/get/allbusiness",
    "/businesses/outletInfo/:businessId",
    "/dishes/uniquelyDishes/:businessId",
    "/businesses/:businessId/loyalty",
    "/settings/banners/:businessId",
    "/hotel/room_type/fetch_room_types",
    "/settings",
  ];

  const path = c.req.path;
  console.log("path", path);
  const isIgnorePath = ignorePaths.some((ignorePath) =>
    path.includes(ignorePath),
  );

  if (!server_secret || !x_signature) {
    return respond(c, "Invalid Token!", true, 401, {});
  }

  if (!isIgnorePath) {
    if (!api_token) {
      return respond(c, "Invalid Token!", true, 401, {});
    }

    try {
      jwt.verify(
        api_token,
        "014f6bc236f2ba1cc2c85cb4a7e723ac7fb46fcc5cbd41c382cdf5495eb72d34",
      );
    } catch (err) {
      return respond(c, "Invalid Token!", true, 401, {});
    }
  }

  const s_secret =
    "014f6bc236f2ba1cc2c85cb4a7e723ac7fb46fcc5cbd41c382cdf5495eb72d34";
  const s_signature =
    "56642a628dfdd7fc29feed72fadc412ec7b6dd155e6e19016e778838d1c104ea";

  if (server_secret !== s_secret || x_signature !== s_signature) {
    return respond(c, "Invalid Signature!", true, 401, {});
  }

  return next();
};
