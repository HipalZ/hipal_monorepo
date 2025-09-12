import { NpcUser, Payment, User } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
//
//dates
const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);

const endOfToday = new Date();
endOfToday.setHours(23, 59, 59, 999);
const roles = [
  "MANAGER",
  "CO_OWNER",
  "CAPTAIN",
  "MARKETING_AGENT",
  "RESTAURANT_OWNER",
];
const npcRouter = new Hono()
  .get(
    "/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();

      const npcUsers = await NpcUser.find({ businessId: businessId })
        .select("userId totalNpcAmount")
        .populate({
          path: "userId",
          select: "name phone",
        });
      return c.json({
        message: "npc Users",
        data: npcUsers,
        err: false,
      });
    },
  )
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(1).max(50),
        name: z.string().min(1).max(50),
        phone: z.string().min(10).max(10),
      }),
    ),
    async (c) => {
      const { businessId, name, phone } = await c.req.json();

      const user = await User.findOne({ phone });

      const existingNpcUser = await NpcUser.findOne({
        userId: user?._id,
        businessId,
      });

      if (existingNpcUser) {
        return c.json(
          {
            message: "Npc User Already Exists",
            data: existingNpcUser,
            err: true,
          },
          409,
        );
      }

      let createdUser = null;
      if (!user) {
        createdUser = await User.create({ name, phone, role: roles });
      }

      // Create a new DuesUser
      const npcUser = await NpcUser.create({
        businessId,
        userId: user?._id || createdUser?._id,
      });

      return c.json({
        message: "npc User Created",
        data: {
          _id: npcUser._id,
        },
        err: false,
      });
    },
  )
  .get(
    "/:businessId/user/:phone",
    zValidator(
      "param",
      z.object({
        businessId: z.string().min(1).max(50),
        phone: z.string().min(10).max(10),
      }),
    ),
    async (c) => {
      const { businessId, phone } = c.req.param();

      const user = await User.findOne({ phone });

      const npcUser = await NpcUser.findOne({
        businessId: businessId,
        userId: user?._id,
      })
        .select("userId")
        .populate({
          path: "userId",
          select: "name phone",
        });
      if (!npcUser) {
        return c.json(
          {
            message: "npc User Not Found",
            data: {},
            err: true,
          },
          404,
        );
      }
      return c.json({
        message: "npc User",
        data: npcUser,
        err: false,
      });
    },
  )

  .get(
    "/:businessId/bills",
    zValidator(
      "param",
      z.object({
        businessId: z.string().min(1).max(500),
      }),
    ),

    zValidator(
      "query",
      z.object({
        userId: z.string().min(1).max(500),
        from: z.string().min(1).max(500).optional(),
        to: z.string().min(1).max(500).optional(),
        pageNumber: z.string().optional(),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();
      const { userId, from, to } = c.req.query();
      const fromDate = Number(from);
      const toDate = Number(to);
      const PAGE_SIZE = 20;
      const pageNumber = c.req.query("pageNumber") as string;
      const skip: number = (Number(pageNumber) - 1) * PAGE_SIZE;

      if (fromDate > toDate) {
        return c.json({
          err: true,
          data: {},
          message: "from date should be less than to date.",
        });
      }

      const query = {
        businessId,
        date: {
          $gte: from ? fromDate : startOfToday.getTime(),
          $lte: to ? toDate : endOfToday.getTime(),
        },
        userId,
      };

      const payments = await Payment.find(query)
        .sort({
          _id: -1,
        })
        .skip(skip)
        .limit(PAGE_SIZE);

      return c.json({
        message: "user bills",
        data: payments,
        err: false,
      });
    },
  );

export default npcRouter;
