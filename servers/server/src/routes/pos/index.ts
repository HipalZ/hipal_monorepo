import axios from "axios";
import { Hono } from "hono";
import { petPoojaCateAndDish, transformData } from "../../utils/helper";
const posRouter = new Hono().get("/", async (c) => {
  const config = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    url: "https://private-anon-c58ea9a72a-dineinapi.apiary-mock.com/send_dinein_menu",
    data: {
      "app-key": "xxxxxxx",
      "app-secret": "xxxxxxxx",
      "access-token": "xxx",
      restID: "xxxxxx",
      tableNo: "x1x",
    },
  };

  const response = await axios(config);

  const transformedCategories = transformData(petPoojaCateAndDish);
  return c.json(
    {
      message: "Data fetched successfully",
      err: false,
      data: transformedCategories,
    },
    200,
  );
});

export default posRouter;
