import {
  GroupAnalytic,
  GroupModel,
  Payment,
  Subscriber,
  UserReward,
} from "@hi/db-models";
import { groupSchema } from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

//Calculate the timestamps
function calculateTimestamps(days: number): {
  fromTimestamp: number;
  toTimestamp: number;
} {
  const currentDate = new Date();
  const toTimestamp = currentDate.getTime();

  const fromDate = new Date();
  fromDate.setDate(currentDate.getDate() - days);
  const fromTimestamp = fromDate.getTime();

  return { fromTimestamp, toTimestamp };
}
const groupRouter = new Hono()
  .post("/", zValidator("json", groupSchema), async (c) => {
    const requestData = await c.req.json();
    const { businessId } = requestData;
    const existingGroup = await GroupModel.findOne({
      businessId,
      name: requestData.name,
      isDeleted: false,
    });

    if (existingGroup) {
      return c.json(
        {
          message: "Group already exists",
          err: true,
          data: {},
        },
        409,
      );
    }

    const createGroup = await GroupModel.create(requestData);

    if (!createGroup) {
      return c.json(
        {
          message: "Group not created",
          err: true,
          data: {},
        },
        400,
      );
    }

    return c.json(
      {
        message: "Group created successfully",
        err: false,
        data: createGroup,
      },
      201,
    );
  })
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        businessId: z.string({
          message: "businessId is required",
        }),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.query();
      const groups = await GroupModel.find({ businessId, isDeleted: false });
      return c.json(
        {
          message: "Groups found",
          err: false,
          data: groups,
        },
        200,
      );
    },
  )
  .get(
    "/:groupId",
    zValidator(
      "param",
      z.object({
        groupId: z.string({
          message: "groupId is required",
        }),
      }),
    ),
    async (c) => {
      const { groupId } = c.req.param();
      const group = await GroupModel.findOne({
        _id: groupId,
        isDeleted: false,
      });
      if (!group) {
        return c.json(
          {
            message: "No group found",
            err: true,
            data: {},
          },
          404,
        );
      }

      return c.json(
        {
          message: "Group found",
          err: false,
          data: group,
        },
        200,
      );
    },
  )
  .delete(
    "/:groupId",
    zValidator(
      "param",
      z.object({
        groupId: z.string({ message: "groupId is required" }),
      }),
    ),

    async (c) => {
      const { groupId } = c.req.param();
      await GroupModel.updateOne(
        {
          _id: groupId,
        },
        { isDeleted: true },
      );
      return c.json(
        {
          message: "group delete successfully",
          err: false,
          data: {},
        },
        200,
      );
    },
  )
  .put(
    "/:groupId",
    zValidator("json", groupSchema.partial()),
    zValidator(
      "param",
      z.object({
        groupId: z.string({ message: "groupId is required" }),
      }),
    ),

    async (c) => {
      const { groupId } = c.req.param();
      const requestData = await c.req.json();
      const { removeUserIds = [] } = requestData;
      const updateGroup = await GroupModel.findByIdAndUpdate(
        groupId,
        requestData,
      );

      if (!updateGroup) {
        return c.json(
          {
            message: "Group not updated",
            err: true,
            data: {},
          },
          400,
        );
      }

      if (updateGroup.groupType === "MANUAL") {
        if (removeUserIds.length > 0) {
          await GroupModel.updateOne(
            {
              _id: groupId,
            },
            {
              $pull: { userIds: { $in: removeUserIds } },
            },
          );
        }
      }

      return c.json(
        {
          message: "Group updated successfully",
          err: false,
          data: updateGroup,
        },
        200,
      );
    },
  )
  .post(
    "/addUsers",

    zValidator(
      "json",
      z.object({
        groupId: z.string({ message: "groupId is required" }),
        userIds: z.array(z.string({ message: "userIds is required" })),
      }),
    ),

    async (c) => {
      const { groupId, userIds } = await c.req.json();
      const group = await GroupModel.findOneAndUpdate(
        {
          _id: groupId,
        },
        {
          $addToSet: { userIds: { $each: userIds } },
        },
        { new: true },
      );

      return c.json(
        {
          message: "Users added to group",
          err: false,
          data: group,
        },
        200,
      );
    },
  )
  .put(
    "/updateBestUsers/:businessId/:groupId",

    zValidator(
      "param",
      z.object({
        businessId: z.string({ message: "businessId is required" }),
        groupId: z.string({ message: "groupId is required" }),
      }),
    ),

    async (c) => {
      const { businessId, groupId } = c.req.param();

      const bestUserGroup = await GroupModel.findById(groupId);
      if (!bestUserGroup) {
        return c.json(
          {
            message: "Group not found",
            err: true,
            data: {},
          },
          404,
        );
      }

      const { fromTimestamp, toTimestamp } = calculateTimestamps(
        bestUserGroup.filter[0].duration,
      );

      const userIds: string[] = [];

      const users = await Payment.find({
        businessId,
        date: { $gte: fromTimestamp, $lte: toTimestamp },
      });

      const subscriber = await Subscriber.find({
        businessId: businessId,
      }).count();

      const tagCountMap = new Map();

      users.forEach((user) => {
        user.tagIds.forEach((tagId) => {
          if (tagCountMap.has(tagId)) {
            tagCountMap.set(tagId, tagCountMap.get(tagId) + 1);
          } else {
            tagCountMap.set(tagId, 1);
          }
        });
      });

      const userAnalytics = await users.reduce(async (accPromise, user) => {
        const acc = await accPromise;

        if (!acc[user.userId]) {
          const userReward = await UserReward.findOne({
            userId: user.userId,
            loyaltyId: user.businessId,
          });

          acc[user.userId] = {
            userId: user.userId,
            visit: 0,
            spend: 0,
            cardBalance: userReward ? userReward.rewards : 0,
            coinzIssued: user.earnCoins,
            coinzUsed: user.claimedCoins,
            tags: user.tagIds.map((tagId) => ({ tagId, count: 0 })),
          };
        }

        acc[user.userId].visit += 1;
        acc[user.userId].spend += user.total;
        acc[user.userId].coinzIssued += user.earnCoins;
        acc[user.userId].coinzUsed += user.claimedCoins;

        user.tagIds.forEach((tagId) => {
          const tag = acc[user.userId].tags.find((t) => t.tagId === tagId);
          if (tag) {
            tag.count = tagCountMap.get(tagId);
          } else {
            acc[user.userId].tags.push({
              tagId,
              count: tagCountMap.get(tagId),
            });
          }
        });

        return acc;
      }, Promise.resolve({}));

      const matchCondition = (data: Record<string, any>, condition: any) => {
        return Object.values(data).filter((user) => {
          let visitMatch = true;
          let spendMatch = true;
          let cardBalanceMatch = true;
          let coinzIssuedMatch = true;
          let coinzUsedMatch = true;

          if (condition.visitType) {
            switch (condition.visitType) {
              case "ABOVE":
                visitMatch = user.visit > condition.visit;
                break;
              case "BELOW":
                visitMatch = user.visit < condition.visit;
                break;
              case "EQUAL":
                visitMatch = user.visit === condition.visit;
                break;
            }
          }

          if (condition.spendType) {
            switch (condition.spendType) {
              case "ABOVE":
                spendMatch = user.spend > condition.spend;
                break;
              case "BELOW":
                spendMatch = user.spend < condition.spend;
                break;
              case "EQUAL":
                spendMatch = user.spend === condition.spend;
                break;
            }
          }

          if (condition.cardBalanceType) {
            switch (condition.cardBalanceType) {
              case "ABOVE":
                cardBalanceMatch = user.cardBalance > condition.cardBalance;
                break;
              case "BELOW":
                cardBalanceMatch = user.cardBalance < condition.cardBalance;
                break;
              case "EQUAL":
                cardBalanceMatch = user.cardBalance === condition.cardBalance;
                break;
            }
          }

          if (condition.coinzIssuedType) {
            switch (condition.coinzIssuedType) {
              case "ABOVE":
                coinzIssuedMatch = user.coinzIssued > condition.coinzIssued;
                break;
              case "BELOW":
                coinzIssuedMatch = user.coinzIssued < condition.coinzIssued;
                break;
              case "EQUAL":
                coinzIssuedMatch = user.coinzIssued === condition.coinzIssued;
                break;
            }
          }

          if (condition.coinzUsedType) {
            switch (condition.coinzUsedType) {
              case "ABOVE":
                coinzUsedMatch = user.coinzUsed > condition.coinzUsed;
                break;
              case "BELOW":
                coinzUsedMatch = user.coinzUsed < condition.coinzUsed;
                break;
              case "EQUAL":
                coinzUsedMatch = user.coinzUsed === condition.coinzUsed;
                break;
            }
          }

          return (
            visitMatch &&
            spendMatch &&
            cardBalanceMatch &&
            coinzIssuedMatch &&
            coinzUsedMatch
          );
        });
      };

      const matchedUsers = matchCondition(
        userAnalytics,
        bestUserGroup.filter[0],
      );

      matchedUsers.map((user) => {
        user.tags = user.tags.filter((tag) => {
          return bestUserGroup.filter[0].tags.some(
            (condition) =>
              condition.tagId.toString() === tag.tagId.toString() &&
              condition.count === tag.count,
          );
        });
        return user;
      });

      matchedUsers.forEach((user) => {
        userIds.push(user.userId.toString());
      });

      await GroupModel.findOneAndUpdate(
        {
          _id: groupId,
        },
        { $addToSet: { userIds: { $each: userIds } } },
        { new: true },
      );

      const groupAnalytics = await GroupAnalytic.findOne({ groupId: groupId });
      if (groupAnalytics) {
        await GroupAnalytic.findOneAndUpdate(
          {
            groupId: groupId,
          },
          {
            userCount: matchedUsers.length,
            userPercentage: Math.round(
              (matchedUsers.length / subscriber) * 100,
            ),
            businessId,
            date: Date.now(),
          },
        );
      } else {
        await GroupAnalytic.create({
          groupId,
          businessId,
          userCount: matchedUsers.length,
          userPercentage: Math.round((matchedUsers.length / subscriber) * 100),

          date: Date.now(),
        });
      }

      return c.json({
        message: "Best users found",
        err: false,
        data: matchedUsers,
      });
    },
  )
  .put(
    "/updateAverageUsers/:businessId/:groupId",

    zValidator(
      "param",
      z.object({
        businessId: z.string({ message: "businessId is required" }),
        groupId: z.string({ message: "groupId is required" }),
      }),
    ),

    async (c) => {
      const { businessId, groupId } = c.req.param();

      const bestUserGroup = await GroupModel.findById(groupId);
      if (!bestUserGroup) {
        return c.json(
          {
            message: "Group not found",
            err: true,
            data: {},
          },
          404,
        );
      }

      const { fromTimestamp, toTimestamp } = calculateTimestamps(
        bestUserGroup.filter[0].duration,
      );

      const userIds: string[] = [];

      const users = await Payment.find({
        businessId,
        date: { $gte: fromTimestamp, $lte: toTimestamp },
      });

      const subscriber = await Subscriber.find({
        businessId: businessId,
      }).count();

      const tagCountMap = new Map();

      users.forEach((user) => {
        user.tagIds.forEach((tagId) => {
          if (tagCountMap.has(tagId)) {
            tagCountMap.set(tagId, tagCountMap.get(tagId) + 1);
          } else {
            tagCountMap.set(tagId, 1);
          }
        });
      });

      const userAnalytics = await users.reduce(async (accPromise, user) => {
        const acc = await accPromise;

        if (!acc[user.userId]) {
          const userReward = await UserReward.findOne({
            userId: user.userId,
            loyaltyId: user.businessId,
          });

          acc[user.userId] = {
            userId: user.userId,
            visit: 0,
            spend: 0,
            cardBalance: userReward ? userReward.rewards : 0,
            coinzIssued: user.earnCoins,
            coinzUsed: user.claimedCoins,
            tags: user.tagIds.map((tagId) => ({ tagId, count: 0 })),
          };
        }

        acc[user.userId].visit += 1;
        acc[user.userId].spend += user.total;
        acc[user.userId].coinzIssued += user.earnCoins;
        acc[user.userId].coinzUsed += user.claimedCoins;

        user.tagIds.forEach((tagId) => {
          const tag = acc[user.userId].tags.find((t) => t.tagId === tagId);
          if (tag) {
            tag.count = tagCountMap.get(tagId);
          } else {
            acc[user.userId].tags.push({
              tagId,
              count: tagCountMap.get(tagId),
            });
          }
        });

        return acc;
      }, Promise.resolve({}));

      const matchCondition = (data: Record<string, any>, condition: any) => {
        return Object.values(data).filter((user) => {
          let visitMatch = true;
          let spendMatch = true;
          let cardBalanceMatch = true;
          let coinzIssuedMatch = true;
          let coinzUsedMatch = true;

          if (condition.visitType) {
            switch (condition.visitType) {
              case "ABOVE":
                visitMatch = user.visit > condition.visit;
                break;
              case "BELOW":
                visitMatch = user.visit < condition.visit;
                break;
              case "EQUAL":
                visitMatch = user.visit === condition.visit;
                break;
            }
          }

          if (condition.spendType) {
            switch (condition.spendType) {
              case "ABOVE":
                spendMatch = user.spend > condition.spend;
                break;
              case "BELOW":
                spendMatch = user.spend < condition.spend;
                break;
              case "EQUAL":
                spendMatch = user.spend === condition.spend;
                break;
            }
          }

          if (condition.cardBalanceType) {
            switch (condition.cardBalanceType) {
              case "ABOVE":
                cardBalanceMatch = user.cardBalance > condition.cardBalance;
                break;
              case "BELOW":
                cardBalanceMatch = user.cardBalance < condition.cardBalance;
                break;
              case "EQUAL":
                cardBalanceMatch = user.cardBalance === condition.cardBalance;
                break;
            }
          }

          if (condition.coinzIssuedType) {
            switch (condition.coinzIssuedType) {
              case "ABOVE":
                coinzIssuedMatch = user.coinzIssued > condition.coinzIssued;
                break;
              case "BELOW":
                coinzIssuedMatch = user.coinzIssued < condition.coinzIssued;
                break;
              case "EQUAL":
                coinzIssuedMatch = user.coinzIssued === condition.coinzIssued;
                break;
            }
          }

          if (condition.coinzUsedType) {
            switch (condition.coinzUsedType) {
              case "ABOVE":
                coinzUsedMatch = user.coinzUsed > condition.coinzUsed;
                break;
              case "BELOW":
                coinzUsedMatch = user.coinzUsed < condition.coinzUsed;
                break;
              case "EQUAL":
                coinzUsedMatch = user.coinzUsed === condition.coinzUsed;
                break;
            }
          }

          return (
            visitMatch &&
            spendMatch &&
            cardBalanceMatch &&
            coinzIssuedMatch &&
            coinzUsedMatch
          );
        });
      };

      const matchedUsers = matchCondition(
        userAnalytics,
        bestUserGroup.filter[0],
      );

      matchedUsers.map((user) => {
        user.tags = user.tags.filter((tag) => {
          return bestUserGroup.filter[0].tags.some(
            (condition) =>
              condition.tagId.toString() === tag.tagId.toString() &&
              condition.count === tag.count,
          );
        });
        return user;
      });

      matchedUsers.forEach((user) => {
        userIds.push(user.userId.toString());
      });

      await GroupModel.findOneAndUpdate(
        {
          _id: groupId,
        },
        { $addToSet: { userIds: { $each: userIds } } },
        { new: true },
      );

      const groupAnalytics = await GroupAnalytic.findOne({ groupId: groupId });
      if (groupAnalytics) {
        await GroupAnalytic.findOneAndUpdate(
          {
            groupId: groupId,
          },
          {
            userCount: matchedUsers.length,
            userPercentage: Math.round(
              (matchedUsers.length / subscriber) * 100,
            ),
            businessId,
            date: Date.now(),
          },
        );
      } else {
        await GroupAnalytic.create({
          groupId,
          businessId,
          userCount: matchedUsers.length,
          userPercentage: Math.round((matchedUsers.length / subscriber) * 100),

          date: Date.now(),
        });
      }

      return c.json({
        message: "Best users found",
        err: false,
        data: matchedUsers,
      });
    },
  )
  .put(
    "/updateAttensionUsers/:businessId/:groupId",

    zValidator(
      "param",
      z.object({
        businessId: z.string({ message: "businessId is required" }),
        groupId: z.string({ message: "groupId is required" }),
      }),
    ),

    async (c) => {
      const { businessId, groupId } = c.req.param();

      const bestUserGroup = await GroupModel.findById(groupId);
      if (!bestUserGroup) {
        return c.json(
          {
            message: "Group not found",
            err: true,
            data: {},
          },
          404,
        );
      }

      const { fromTimestamp, toTimestamp } = calculateTimestamps(
        bestUserGroup.filter[0].duration,
      );

      const userIds: string[] = [];

      const users = await Payment.find({
        businessId,
        date: { $gte: fromTimestamp, $lte: toTimestamp },
      });

      const subscriber = await Subscriber.find({
        businessId: businessId,
      }).count();

      const tagCountMap = new Map();

      users.forEach((user) => {
        user.tagIds.forEach((tagId) => {
          if (tagCountMap.has(tagId)) {
            tagCountMap.set(tagId, tagCountMap.get(tagId) + 1);
          } else {
            tagCountMap.set(tagId, 1);
          }
        });
      });

      const userAnalytics = await users.reduce(async (accPromise, user) => {
        const acc = await accPromise;

        if (!acc[user.userId]) {
          const userReward = await UserReward.findOne({
            userId: user.userId,
            loyaltyId: user.businessId,
          });

          acc[user.userId] = {
            userId: user.userId,
            visit: 0,
            spend: 0,
            cardBalance: userReward ? userReward.rewards : 0,
            coinzIssued: user.earnCoins,
            coinzUsed: user.claimedCoins,
            tags: user.tagIds.map((tagId) => ({ tagId, count: 0 })),
          };
        }

        acc[user.userId].visit += 1;
        acc[user.userId].spend += user.total;
        acc[user.userId].coinzIssued += user.earnCoins;
        acc[user.userId].coinzUsed += user.claimedCoins;

        user.tagIds.forEach((tagId) => {
          const tag = acc[user.userId].tags.find((t) => t.tagId === tagId);
          if (tag) {
            tag.count = tagCountMap.get(tagId);
          } else {
            acc[user.userId].tags.push({
              tagId,
              count: tagCountMap.get(tagId),
            });
          }
        });

        return acc;
      }, Promise.resolve({}));

      const matchCondition = (data: Record<string, any>, condition: any) => {
        return Object.values(data).filter((user) => {
          let visitMatch = true;
          let spendMatch = true;
          let cardBalanceMatch = true;
          let coinzIssuedMatch = true;
          let coinzUsedMatch = true;

          if (condition.visitType) {
            switch (condition.visitType) {
              case "ABOVE":
                visitMatch = user.visit > condition.visit;
                break;
              case "BELOW":
                visitMatch = user.visit < condition.visit;
                break;
              case "EQUAL":
                visitMatch = user.visit === condition.visit;
                break;
            }
          }

          if (condition.spendType) {
            switch (condition.spendType) {
              case "ABOVE":
                spendMatch = user.spend > condition.spend;
                break;
              case "BELOW":
                spendMatch = user.spend < condition.spend;
                break;
              case "EQUAL":
                spendMatch = user.spend === condition.spend;
                break;
            }
          }

          if (condition.cardBalanceType) {
            switch (condition.cardBalanceType) {
              case "ABOVE":
                cardBalanceMatch = user.cardBalance > condition.cardBalance;
                break;
              case "BELOW":
                cardBalanceMatch = user.cardBalance < condition.cardBalance;
                break;
              case "EQUAL":
                cardBalanceMatch = user.cardBalance === condition.cardBalance;
                break;
            }
          }

          if (condition.coinzIssuedType) {
            switch (condition.coinzIssuedType) {
              case "ABOVE":
                coinzIssuedMatch = user.coinzIssued > condition.coinzIssued;
                break;
              case "BELOW":
                coinzIssuedMatch = user.coinzIssued < condition.coinzIssued;
                break;
              case "EQUAL":
                coinzIssuedMatch = user.coinzIssued === condition.coinzIssued;
                break;
            }
          }

          if (condition.coinzUsedType) {
            switch (condition.coinzUsedType) {
              case "ABOVE":
                coinzUsedMatch = user.coinzUsed > condition.coinzUsed;
                break;
              case "BELOW":
                coinzUsedMatch = user.coinzUsed < condition.coinzUsed;
                break;
              case "EQUAL":
                coinzUsedMatch = user.coinzUsed === condition.coinzUsed;
                break;
            }
          }

          return (
            visitMatch &&
            spendMatch &&
            cardBalanceMatch &&
            coinzIssuedMatch &&
            coinzUsedMatch
          );
        });
      };
      const matchedUsers = matchCondition(
        userAnalytics,
        bestUserGroup.filter[0],
      );

      matchedUsers.map((user) => {
        user.tags = user.tags.filter((tag) => {
          return bestUserGroup.filter[0].tags.some(
            (condition) =>
              condition.tagId.toString() === tag.tagId.toString() &&
              condition.count === tag.count,
          );
        });
        return user;
      });

      matchedUsers.forEach((user) => {
        userIds.push(user.userId.toString());
      });

      await GroupModel.findOneAndUpdate(
        {
          _id: groupId,
        },
        { $addToSet: { userIds: { $each: userIds } } },
        { new: true },
      );

      const groupAnalytics = await GroupAnalytic.findOne({ groupId: groupId });
      if (groupAnalytics) {
        await GroupAnalytic.findOneAndUpdate(
          {
            groupId: groupId,
          },
          {
            userCount: matchedUsers.length,
            userPercentage: Math.round(
              (matchedUsers.length / subscriber) * 100,
            ),
            businessId,
            date: Date.now(),
          },
        );
      } else {
        await GroupAnalytic.create({
          groupId,
          businessId,
          userCount: matchedUsers.length,
          userPercentage: Math.round((matchedUsers.length / subscriber) * 100),

          date: Date.now(),
        });
      }

      return c.json({
        message: "Best users found",
        err: false,
        data: matchedUsers,
      });
    },
  )
  .put(
    "/updateLossUsers/:businessId/:groupId",

    zValidator(
      "param",
      z.object({
        businessId: z.string({ message: "businessId is required" }),
        groupId: z.string({ message: "groupId is required" }),
      }),
    ),

    async (c) => {
      const { businessId, groupId } = c.req.param();

      const bestUserGroup = await GroupModel.findById(groupId);
      if (!bestUserGroup) {
        return c.json(
          {
            message: "Group not found",
            err: true,
            data: {},
          },
          404,
        );
      }

      const { fromTimestamp, toTimestamp } = calculateTimestamps(
        bestUserGroup.filter[0].duration,
      );

      const userIds: string[] = [];

      const users = await Payment.find({
        businessId,
        date: { $gte: fromTimestamp, $lte: toTimestamp },
      });

      const subscriber = await Subscriber.find({
        businessId: businessId,
      }).count();

      const tagCountMap = new Map();

      users.forEach((user) => {
        user.tagIds.forEach((tagId) => {
          if (tagCountMap.has(tagId)) {
            tagCountMap.set(tagId, tagCountMap.get(tagId) + 1);
          } else {
            tagCountMap.set(tagId, 1);
          }
        });
      });

      const userAnalytics = await users.reduce(async (accPromise, user) => {
        const acc = await accPromise;

        if (!acc[user.userId]) {
          const userReward = await UserReward.findOne({
            userId: user.userId,
            loyaltyId: user.businessId,
          });

          acc[user.userId] = {
            userId: user.userId,
            visit: 0,
            spend: 0,
            cardBalance: userReward ? userReward.rewards : 0,
            coinzIssued: user.earnCoins,
            coinzUsed: user.claimedCoins,
            tags: user.tagIds.map((tagId) => ({ tagId, count: 0 })),
          };
        }

        acc[user.userId].visit += 1;
        acc[user.userId].spend += user.total;
        acc[user.userId].coinzIssued += user.earnCoins;
        acc[user.userId].coinzUsed += user.claimedCoins;

        user.tagIds.forEach((tagId) => {
          const tag = acc[user.userId].tags.find((t) => t.tagId === tagId);
          if (tag) {
            tag.count = tagCountMap.get(tagId);
          } else {
            acc[user.userId].tags.push({
              tagId,
              count: tagCountMap.get(tagId),
            });
          }
        });

        return acc;
      }, Promise.resolve({}));

      const matchCondition = (data: Record<string, any>, condition: any) => {
        return Object.values(data).filter((user) => {
          let visitMatch = true;
          let spendMatch = true;
          let cardBalanceMatch = true;
          let coinzIssuedMatch = true;
          let coinzUsedMatch = true;

          if (condition.visitType) {
            switch (condition.visitType) {
              case "ABOVE":
                visitMatch = user.visit > condition.visit;
                break;
              case "BELOW":
                visitMatch = user.visit < condition.visit;
                break;
              case "EQUAL":
                visitMatch = user.visit === condition.visit;
                break;
            }
          }

          if (condition.spendType) {
            switch (condition.spendType) {
              case "ABOVE":
                spendMatch = user.spend > condition.spend;
                break;
              case "BELOW":
                spendMatch = user.spend < condition.spend;
                break;
              case "EQUAL":
                spendMatch = user.spend === condition.spend;
                break;
            }
          }

          if (condition.cardBalanceType) {
            switch (condition.cardBalanceType) {
              case "ABOVE":
                cardBalanceMatch = user.cardBalance > condition.cardBalance;
                break;
              case "BELOW":
                cardBalanceMatch = user.cardBalance < condition.cardBalance;
                break;
              case "EQUAL":
                cardBalanceMatch = user.cardBalance === condition.cardBalance;
                break;
            }
          }

          if (condition.coinzIssuedType) {
            switch (condition.coinzIssuedType) {
              case "ABOVE":
                coinzIssuedMatch = user.coinzIssued > condition.coinzIssued;
                break;
              case "BELOW":
                coinzIssuedMatch = user.coinzIssued < condition.coinzIssued;
                break;
              case "EQUAL":
                coinzIssuedMatch = user.coinzIssued === condition.coinzIssued;
                break;
            }
          }

          if (condition.coinzUsedType) {
            switch (condition.coinzUsedType) {
              case "ABOVE":
                coinzUsedMatch = user.coinzUsed > condition.coinzUsed;
                break;
              case "BELOW":
                coinzUsedMatch = user.coinzUsed < condition.coinzUsed;
                break;
              case "EQUAL":
                coinzUsedMatch = user.coinzUsed === condition.coinzUsed;
                break;
            }
          }

          return (
            visitMatch &&
            spendMatch &&
            cardBalanceMatch &&
            coinzIssuedMatch &&
            coinzUsedMatch
          );
        });
      };

      const matchedUsers = matchCondition(
        userAnalytics,
        bestUserGroup.filter[0],
      );

      console.log("matchedUsers", matchedUsers);

      matchedUsers.map((user) => {
        user.tags = user.tags.filter((tag) => {
          return bestUserGroup.filter[0].tags.some(
            (condition) =>
              condition.tagId.toString() === tag.tagId.toString() &&
              condition.count === tag.count,
          );
        });
        return user;
      });

      matchedUsers.forEach((user) => {
        userIds.push(user.userId.toString());
      });

      await GroupModel.findOneAndUpdate(
        {
          _id: groupId,
        },
        { $addToSet: { userIds: { $each: userIds } } },
        { new: true },
      );

      const groupAnalytics = await GroupAnalytic.findOne({ groupId: groupId });
      if (groupAnalytics) {
        await GroupAnalytic.findOneAndUpdate(
          {
            groupId: groupId,
          },
          {
            userCount: matchedUsers.length,
            userPercentage: Math.round(
              (matchedUsers.length / subscriber) * 100,
            ),
            businessId,
            date: Date.now(),
          },
        );
      } else {
        await GroupAnalytic.create({
          groupId,
          businessId,
          userCount: matchedUsers.length,
          userPercentage: Math.round((matchedUsers.length / subscriber) * 100),

          date: Date.now(),
        });
      }

      return c.json({
        message: "Best users found",
        err: false,
        data: matchedUsers,
      });
    },
  )
  .put(
    "/updateMorningUsers/:businessId/:groupId",

    zValidator(
      "param",
      z.object({
        businessId: z.string({ message: "businessId is required" }),
        groupId: z.string({ message: "groupId is required" }),
      }),
    ),

    async (c) => {
      const { businessId, groupId } = c.req.param();

      const bestUserGroup = await GroupModel.findById(groupId);
      if (!bestUserGroup) {
        return c.json(
          {
            message: "Group not found",
            err: true,
            data: {},
          },
          404,
        );
      }

      const { fromTimestamp, toTimestamp } = calculateTimestamps(
        bestUserGroup.filter[0].duration,
      );

      const users = await Payment.find({
        businessId,
        date: { $gte: fromTimestamp, $lte: toTimestamp },
      });

      const subscriber = await Subscriber.find({
        businessId: businessId,
      }).count();

      const MorningUser = {
        visitCount: 0,
        spendAmount: 0,
        userCount: 0,
        userIds: [],
      };

      const processedUserIds = new Set<string>();

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const paymentHour = new Date(user.date).getHours();
        if (paymentHour >= 6 && paymentHour < 12) {
          if (!processedUserIds.has(user.userId.toString())) {
            MorningUser.visitCount += 1;
            MorningUser.spendAmount += user.total;
            MorningUser.userCount += 1;
            MorningUser.userIds.push(user.userId.toString());
            processedUserIds.add(user.userId.toString());
          }
        }
      }

      const groupAnalytics = await GroupAnalytic.findOne({ groupId: groupId });
      if (groupAnalytics) {
        await GroupAnalytic.updateOne(
          {
            groupId: groupId,
          },
          {
            userCount: MorningUser.userCount,
            userPercentage: Math.round(
              (MorningUser.userCount / subscriber) * 100,
            ),
            businessId,
            date: Date.now(),
          },
        );
      } else {
        await GroupAnalytic.create({
          groupId,
          duration: bestUserGroup.filter[0].duration,
          businessId,

          userCount: MorningUser.userCount,
          userPercentage: Math.round(
            (MorningUser.userCount / subscriber) * 100,
          ),
          groupColor: bestUserGroup.groupColor,
          groupName: bestUserGroup.name,
          date: Date.now(),
        });
      }

      const group = await GroupModel.findOneAndUpdate(
        {
          _id: groupId,
        },
        { $addToSet: { userIds: { $each: MorningUser.userIds } } },
        { new: true },
      );

      return c.json({
        message: "Best users found",
        err: false,
        data: MorningUser,
      });
    },
  )
  .put(
    "/updateAfterNoonUsers/:businessId/:groupId",

    zValidator(
      "param",
      z.object({
        businessId: z.string({ message: "businessId is required" }),
        groupId: z.string({ message: "groupId is required" }),
      }),
    ),

    async (c) => {
      const { businessId, groupId } = c.req.param();

      const bestUserGroup = await GroupModel.findById(groupId);
      if (!bestUserGroup) {
        return c.json(
          {
            message: "Group not found",
            err: true,
            data: {},
          },
          404,
        );
      }

      const { fromTimestamp, toTimestamp } = calculateTimestamps(
        bestUserGroup.filter[0].duration,
      );

      const users = await Payment.find({
        businessId,
        date: { $gte: fromTimestamp, $lte: toTimestamp },
      });

      const subscriber = await Subscriber.find({
        businessId: businessId,
      }).count();

      const MorningUser = {
        visitCount: 0,
        spendAmount: 0,
        userCount: 0,
        userIds: [],
      };

      const processedUserIds = new Set<string>();

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const paymentHour = new Date(user.date).getHours();
        if (paymentHour >= 12 && paymentHour < 18) {
          if (!processedUserIds.has(user.userId.toString())) {
            MorningUser.visitCount += 1;
            MorningUser.spendAmount += user.total;
            MorningUser.userCount += 1;
            MorningUser.userIds.push(user.userId.toString());
            processedUserIds.add(user.userId.toString());
          }
        }
      }

      const groupAnalytics = await GroupAnalytic.findOne({ groupId: groupId });
      if (groupAnalytics) {
        await GroupAnalytic.updateOne(
          {
            groupId: groupId,
          },
          {
            userCount: MorningUser.userCount,
            userPercentage: Math.round(
              (MorningUser.userCount / subscriber) * 100,
            ),
            businessId,
            date: Date.now(),
          },
        );
      } else {
        await GroupAnalytic.create({
          groupId,
          duration: bestUserGroup.filter[0].duration,
          businessId,

          userCount: MorningUser.userCount,
          userPercentage: Math.round(
            (MorningUser.userCount / subscriber) * 100,
          ),
          groupColor: bestUserGroup.groupColor,
          groupName: bestUserGroup.name,
          date: Date.now(),
        });
      }

      const group = await GroupModel.findOneAndUpdate(
        {
          _id: groupId,
        },
        { $addToSet: { userIds: { $each: MorningUser.userIds } } },
        { new: true },
      );

      return c.json({
        message: "Best users found",
        err: false,
        data: MorningUser,
      });
    },
  )
  .put(
    "/updateEveningUsers/:businessId/:groupId",

    zValidator(
      "param",
      z.object({
        businessId: z.string({ message: "businessId is required" }),
        groupId: z.string({ message: "groupId is required" }),
      }),
    ),

    async (c) => {
      const { businessId, groupId } = c.req.param();

      const bestUserGroup = await GroupModel.findById(groupId);
      if (!bestUserGroup) {
        return c.json(
          {
            message: "Group not found",
            err: true,
            data: {},
          },
          404,
        );
      }

      const { fromTimestamp, toTimestamp } = calculateTimestamps(
        bestUserGroup.filter[0].duration,
      );

      const users = await Payment.find({
        businessId,
        date: { $gte: fromTimestamp, $lte: toTimestamp },
      });

      const subscriber = await Subscriber.find({
        businessId: businessId,
      }).count();

      const MorningUser = {
        visitCount: 0,
        spendAmount: 0,
        userCount: 0,
        userIds: [],
      };

      const processedUserIds = new Set<string>();

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const paymentHour = new Date(user.date).getHours();
        if (paymentHour >= 18 && paymentHour < 24) {
          if (!processedUserIds.has(user.userId.toString())) {
            MorningUser.visitCount += 1;
            MorningUser.spendAmount += user.total;
            MorningUser.userCount += 1;
            MorningUser.userIds.push(user.userId.toString());
            processedUserIds.add(user.userId.toString());
          }
        }
      }

      const groupAnalytics = await GroupAnalytic.findOne({ groupId: groupId });
      if (groupAnalytics) {
        await GroupAnalytic.updateOne(
          {
            groupId: groupId,
          },
          {
            userCount: MorningUser.userCount,
            userPercentage: Math.round(
              (MorningUser.userCount / subscriber) * 100,
            ),
            businessId,
            date: Date.now(),
          },
        );
      } else {
        await GroupAnalytic.create({
          groupId,
          duration: bestUserGroup.filter[0].duration,
          businessId,

          userCount: MorningUser.userCount,
          userPercentage: Math.round(
            (MorningUser.userCount / subscriber) * 100,
          ),
          groupColor: bestUserGroup.groupColor,
          groupName: bestUserGroup.name,
          date: Date.now(),
        });
      }

      const group = await GroupModel.findOneAndUpdate(
        {
          _id: groupId,
        },
        { $addToSet: { userIds: { $each: MorningUser.userIds } } },
        { new: true },
      );

      return c.json({
        message: "Best users found",
        err: false,
        data: MorningUser,
      });
    },
  )
  .put(
    "/updateLateNightUsers/:businessId/:groupId",

    zValidator(
      "param",
      z.object({
        businessId: z.string({ message: "businessId is required" }),
        groupId: z.string({ message: "groupId is required" }),
      }),
    ),

    async (c) => {
      const { businessId, groupId } = c.req.param();

      const bestUserGroup = await GroupModel.findById(groupId);
      if (!bestUserGroup) {
        return c.json(
          {
            message: "Group not found",
            err: true,
            data: {},
          },
          404,
        );
      }

      const { fromTimestamp, toTimestamp } = calculateTimestamps(
        bestUserGroup.filter[0].duration,
      );

      const users = await Payment.find({
        businessId,
        date: { $gte: fromTimestamp, $lte: toTimestamp },
      });

      const subscriber = await Subscriber.find({
        businessId: businessId,
      }).count();

      const MorningUser = {
        visitCount: 0,
        spendAmount: 0,
        userCount: 0,
        userIds: [],
      };

      const processedUserIds = new Set<string>();

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const paymentHour = new Date(user.date).getHours();
        if (paymentHour >= 0 && paymentHour < 6) {
          if (!processedUserIds.has(user.userId.toString())) {
            MorningUser.visitCount += 1;
            MorningUser.spendAmount += user.total;
            MorningUser.userCount += 1;
            MorningUser.userIds.push(user.userId.toString());
            processedUserIds.add(user.userId.toString());
          }
        }
      }

      const groupAnalytics = await GroupAnalytic.findOne({ groupId: groupId });
      if (groupAnalytics) {
        await GroupAnalytic.updateOne(
          {
            groupId: groupId,
          },
          {
            userCount: MorningUser.userCount,
            userPercentage: Math.round(
              (MorningUser.userCount / subscriber) * 100,
            ),
            businessId,
            date: Date.now(),
          },
        );
      } else {
        await GroupAnalytic.create({
          groupId,
          duration: bestUserGroup.filter[0].duration,
          businessId,

          userCount: MorningUser.userCount,
          userPercentage: Math.round(
            (MorningUser.userCount / subscriber) * 100,
          ),
          groupColor: bestUserGroup.groupColor,
          groupName: bestUserGroup.name,
          date: Date.now(),
        });
      }
      const group = await GroupModel.findOneAndUpdate(
        {
          _id: groupId,
        },
        { $addToSet: { userIds: { $each: MorningUser.userIds } } },
        { new: true },
      );

      return c.json({
        message: "Best users found",
        err: false,
        data: MorningUser,
      });
    },
  )
  .get(
    "/groupAnalytics/users",
    zValidator(
      "query",
      z.object({
        businessId: z.string({ message: "businessId is required" }),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.query();
      const groupAnalytics = await GroupAnalytic.find({ businessId });
      return c.json({
        message: "Group analytics",
        err: false,
        data: groupAnalytics,
      });
    },
  )
  .post(
    "/users/sendBulkMessage",

    zValidator(
      "json",
      z.object({
        userIds: z.array(z.string({ message: "userIds is required" })),
        message: z.string({ message: "message is required" }).optional(),
        businessId: z.string({ message: "businessId is required" }),
      }),
    ),

    async (c) => {
      const { userIds = [], message, businessId } = await c.req.json();
      console.log(userIds, message, businessId);
      return c.json(
        {
          message: "Message sent successfully",
          err: false,
          data: { userIds },
        },
        200,
      );
    },
  )
  .get(
    "/userGroups/:businessId/:userId",
    zValidator(
      "param",
      z.object({
        businessId: z.string({ message: "businessId is required" }),
        userId: z.string({ message: "userId is required" }),
      }),
    ),

    async (c) => {
      const { businessId, userId } = c.req.param();

      const groups = await GroupModel.find({
        businessId,
        userIds: userId,
      }).select("name");

      return c.json({
        message: "User groups found",
        err: false,
        data: groups,
      });
    },
  );

export default groupRouter;
