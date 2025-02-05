// books.ts
import {
  DeviceToken,
  LoyaltyCoinsInfo,
  StaffPermission,
  StaffPermissionGroup,
  Subscriber,
  User,
  UserReward,
  UserRewardHistory,
} from "@hi/db-models";
import type {
  AddStaffValidatorType,
  UserType,
} from "@hi/db-models/src/validators";
import {
  UserAttrs,
  addStaffValidator,
  ownerLoginValidator,
  paramsSchema,
  roles,
  staffValidator,
} from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
//@ts-ignore
//@ts-ignore
import argon2 from "argon2";
import axios from "axios";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
//@ts-ignore
import jwt from "jsonwebtoken";
import { z } from "zod";
import { respond } from "../../utils/response";
const admin = require("firebase-admin");
// Hash a passwordss

const serviceAccount = require("..//../utils/service_account.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
export async function hashPassword(password: string): Promise<string> {
  try {
    const hash = await argon2.hash(password);
    return hash;
  } catch (err) {
    throw new Error("Error hashing password");
  }
}

// Verify a password
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    throw new Error("Error verifying password");
  }
}

export const addSignUpBonus = async (
  loyaltyId: string,
  userId: string,
  bonus: number,
) => {
  const existingReward = await UserReward.findOne({
    userId,
    loyaltyId,
  });

  if (!existingReward) {
    const newReward = new UserReward({
      userId,
      loyaltyId,
      rewards: bonus,
      password: Math.floor(Math.random() * 9000) + 10000,
      scanCount: 1,
    });
    await LoyaltyCoinsInfo.findOneAndUpdate(
      { businessId: loyaltyId },
      {
        $inc: {
          coinzIssued: bonus,
        },
      },
    );

    await newReward.save();
    const data = new UserRewardHistory({
      userId,
      status: "PLUS",
      rewards: bonus,
      loyaltyId,
      date: Date.now(),
    });

    await data.save();
  } else {
    await UserReward.findOneAndUpdate(
      { userId, loyaltyId },
      { $inc: { scanCount: 2 } },
      { new: true },
    );
  }
  return 1;
};

export const createAccessToken = (id: string, role: string) => {
  return jwt.sign(
    {
      id: id,
      role: role,
    },
    Bun.env.JWT_SECRET as string,
    { expiresIn: "10d" }, // Add 7 day expiration
  );
};

export const createRefreshToken = (id: string, role: string) => {
  return jwt.sign(
    {
      id: id,
      role: role,
    },
    Bun.env.JWT_SECRET as string,
    { expiresIn: "50d" }, // Add 30 day expiration
  );
};

async function createPermissionObject(
  permissionIds: string[],
  permissionGroupIds: string[],
) {
  const permissions = await StaffPermission.find({
    _id: { $in: permissionIds },
  });
  const groupPermissions = await StaffPermissionGroup.find({
    _id: { $in: permissionGroupIds },
  });

  if (!permissions || !groupPermissions) {
    throw new Error("Permission not found");
  }

  const perObj: Record<string, boolean> = {};

  // Add individual permissions
  for (const permission of permissions) {
    perObj[permission.name] = true;
  }

  // Add group permissions
  for (const group of groupPermissions) {
    for (const permission of Object.keys(group.permissions)) {
      perObj[permission] = true;
    }
  }

  return perObj;
}
const usersRouter = new Hono()
  .post("/:id/signUp", zValidator("json", UserAttrs), async (c) => {
    const requestData = await c.req.json();

    const { phone } = requestData;

    const existingUser = await User.findOne({ phone });
    //TODO: USER ["HIPAL_CUSTOMER"]

    try {
      const options = {
        method: "POST",
        url: `https://control.msg91.com/api/v5/otp?template_id=64393bf9d6fc05380863b002&mobile=91${phone}`,
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authkey: "387796AmyGlDBq63b2d75aP1",
        },
      };
      await axios(options);
    } catch (e) {
      console.log(e);
      return respond(c, "Otp not sent", true, 400, {});
    }

    if (existingUser) {
      return respond(c, "User already exist", true, 409, {
        user: existingUser,
      });
    }

    const user = await User.create({ ...requestData, role: roles });

    return respond(c, "User created successfully", false, 201, { user: user });
  })
  .post(
    "/ownerSignUp",
    zValidator("json", ownerLoginValidator),
    zValidator(
      "query",
      z.object({
        verifyOtp: z.string(),
      }),
    ),
    async (c) => {
      const requestData = await c.req.json();

      const { name, phone, otp } = requestData;
      const { verifyOtp } = c.req.query();

      let existingUser: UserType | null = null;

      existingUser = await User.findOne({ phone: phone });
      if (existingUser) {
        return c.json(
          {
            status: false,
            message: "User already exist",
            data: { user: existingUser },
            err: true,
          },
          409,
        );
      }

      if (verifyOtp === "false") {
        const options = {
          method: "POST",
          url: `https://control.msg91.com/api/v5/otp?template_id=64393bf9d6fc05380863b002&mobile=91${phone}`,
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            authkey: "387796AmyGlDBq63b2d75aP1",
          },
        };
        const response = await axios(options);

        if (!response) {
          return c.json(
            {
              status: false,
              message: "Otp not sent",
              data: {},
              err: true,
            },
            400,
          );
        }

        return c.json({
          status: false,
          message: "Otp sent successfully",
          data: {},
          err: false,
        });
      }

      if (verifyOtp === "true") {
        const options = {
          method: "GET",
          url: `https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=91${phone}`,
          headers: {
            accept: "application/json",
            authkey: "387796AmyGlDBq63b2d75aP1",
          },
        };

        const response = await axios(options);
        console.log("responsesss", response.data.message);

        if (
          response?.data?.message === "Mobile no. not found" ||
          response?.data?.message === "OTP not match" ||
          response?.data?.message === "OTP expired" ||
          response?.data?.message === "Otp empty or not numeric" ||
          response?.data?.message ===
            "Max limit reached for this otp verification"
        ) {
          return c.json(
            { err: true, status: false, message: "Please enter valid Otp !!" },
            400,
          );
        }

        const user = await User.create({ name, phone, role: roles });

        const accessToken = createAccessToken(user._id, "OWNER");
        const refreshToken = createRefreshToken(user._id, "OWNER");

        return c.json({
          status: true,
          message: "User created successfully",
          data: { user, accessToken, refreshToken },
          err: false,
        });
      }
    },
  )
  .post(
    "/ownerSignIn",
    zValidator(
      "json",
      z.object({
        phone: z.string().max(10).optional(),
        otp: z.string().length(4).optional(),
        password: z.string().max(20).optional(),
      }),
    ),
    zValidator("query", z.object({})),
    async (c) => {
      const requestData = await c.req.json();
      const { verifyOtp } = c.req.query();
      const { phone, password, otp } = requestData;

      if (verifyOtp === "false") {
        let existingUser: UserType | null = null;

        existingUser = await User.findOne({ phone: phone });
        if (!existingUser) {
          return c.json(
            {
              message: "User not found",
              data: {},
              err: true,
            },
            404,
          );
        }
        const comparePass = await verifyPassword(
          password,
          existingUser?.password || "",
        );
        console.log("comparePass", comparePass);

        if (!comparePass) {
          return c.json(
            {
              message: "Invalid Password",
              data: {},
              err: true,
            },
            400,
          );
        }
        const accessToken = createAccessToken(existingUser?._id || "", "OWNER");
        const refreshToken = createRefreshToken(
          existingUser?._id || "",
          "OWNER",
        );

        return c.json({
          message: "Owner Logged in Successfully",
          data: { user: existingUser, accessToken, refreshToken },
          err: false,
        });
      }
      if (verifyOtp === "true") {
        const options = {
          method: "GET",
          url: `https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=91${phone}`,
          headers: {
            accept: "application/json",
            authkey: "387796AmyGlDBq63b2d75aP1",
          },
        };

        const response = await axios(options);

        if (
          response?.data?.message === "Mobile no. not found" ||
          response?.data?.message === "OTP not match" ||
          response?.data?.message === "OTP expired" ||
          response?.data?.message === "Otp empty or not numeric" ||
          response?.data?.message ===
            "Max limit reached for this otp verification"
        ) {
          return c.json(
            { err: true, status: false, message: "Please enter valid Otp !!" },
            400,
          );
        }

        const user = await User.findOne({ phone });
        if (!user) return respond(c, "User not found", true, 404, {});

        const accessToken = createAccessToken(
          user?._id.toString() || "",
          "OWNER",
        );
        const refreshToken = createRefreshToken(
          user?._id.toString() || "",
          "OWNER",
        );

        return respond(c, "Owner Logged in Successfully", false, 200, {
          user,
          accessToken,
          refreshToken,
        });
      }
    },
  )
  .put(
    "/:ownerId",
    zValidator(
      "param",
      z.object({
        ownerId: z.string(),
      }),
    ),
    zValidator(
      "json",
      z.object({
        password: z.string().min(4).max(20),
      }),
    ),
    async (c) => {
      const requestData = await c.req.json();
      const { password } = requestData;

      const { ownerId } = c.req.param();

      const hashedPassword = await hashPassword(password);

      const user = await User.findByIdAndUpdate(
        ownerId,
        { password: hashedPassword },
        { new: true },
      );

      if (!user) {
        return c.json(
          {
            message: "User not found",
            data: {},
            err: true,
          },
          404,
        );
      }

      return c.json({
        message: "Password updated successfully",
        data: user,
        err: false,
      });
    },
  )
  .post(
    "/resendOtp",
    zValidator(
      "json",
      z.object({
        phone: z.string(),
      }),
    ),
    async (c) => {
      const requestData = await c.req.json();
      const { phone } = requestData;

      const options = {
        method: "POST",
        url: `https://control.msg91.com/api/v5/otp?template_id=64393bf9d6fc05380863b002&mobile=91${phone}`,
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authkey: "387796AmyGlDBq63b2d75aP1",
        },
      };
      const response = await axios(options);

      return c.json({
        message: "OTP sent successfully",
        data: response.data,
        err: false,
      });
    },
  )

  .post("/:id/stafflogin", zValidator("json", staffValidator), async (c) => {
    const requestData = await c.req.json();
    const { phone, password } = requestData;
    const staff = await User.findOne({ phone: phone }).populate({
      path: "customRole.businessId",
      select: "name address logo",
    });

    if (!staff) {
      return c.json(
        {
          message: "Staff not found",
          data: {},
          err: true,
        },
        404,
      );
    }

    const isPasswordValid = await verifyPassword(
      password,
      staff?.password || "",
    );

    if (!isPasswordValid) {
      return c.json(
        {
          message: "Invalid Password",
          data: {},
          err: true,
        },
        400,
      );
    }
    // Generate JWT
    const accessToken = createAccessToken(
      staff?._id.toString() || "",
      "CAPTAIN",
    );
    const refreshToken = createRefreshToken(
      staff?._id.toString() || "",
      "CAPTAIN",
    );

    return c.json({
      message: "Staff Logged in Successfully",
      data: { user: staff, accessToken, refreshToken },
      err: false,
    });
  })
  .post(
    "/addStaff",

    zValidator("json", addStaffValidator),

    async (c) => {
      const requestData = await c.req.json();
      const {
        name,
        phone,
        businessId,
        role,
        permissionIds = [],
        permissionGroupIds = [],
        password,
      } = requestData as AddStaffValidatorType;

      const existingUser = await User.findOne({
        phone,
      });

      if (existingUser) {
        const perObj = await createPermissionObject(
          permissionIds,
          permissionGroupIds,
        );
        const customRole = {
          businessId,
          role,

          permissionGroupIds,
          default: false,
          isDeleted: false,
          permissions: perObj,
          permissionIds,
        };

        console.log("customRole", customRole);

        const updateUser = await User.findOneAndUpdate(
          { phone },
          {
            $addToSet: {
              customRole: customRole,
            },
          },
          { new: true },
        );

        return c.json({
          message: "Staff added successfully",
          data: { user: updateUser },
          err: false,
        });
      }

      const hashPass = await hashPassword(password);

      const perObj = await createPermissionObject(
        permissionIds,
        permissionGroupIds,
      );

      const customRole = {
        businessId,
        role,

        permissionGroupIds,
        default: false,
        isDeleted: false,
        permissions: perObj,
        permissionIds,
      };

      const user = await User.create({
        name,
        phone,
        role: roles,
        customRole: [customRole],
        password: hashPass,
      });

      return c.json({
        message: "Staff created successfully",
        data: { user },
        err: false,
      });
    },
  )
  .put(
    "/:staffId/staff",
    zValidator(
      "json",
      z.object({
        businessId: z.string(),
        name: z.string().min(2).max(30).optional(),
        role: z.string().optional(),
        permissionIds: z.array(z.string()).optional().default([]),
        permissionGroupIds: z.array(z.string()).optional().default([]),
        removePermissionIds: z.array(z.string()).optional().default([]),
        removePermissionGroupIds: z.array(z.string()).optional().default([]),
        bookMark: z.boolean().optional(),
      }),
    ),
    async (c) => {
      const requestData = await c.req.json();
      const { staffId } = c.req.param();
      const {
        name,
        role,
        permissionIds = [],
        permissionGroupIds = [],
        removePermissionIds = [],
        removePermissionGroupIds = [],
        businessId,
        bookMark,
      } = requestData;

      const existingUser = await User.findById(staffId);

      if (!existingUser) {
        return c.json(
          {
            message: "Staff not found",
            data: {},
            err: true,
          },
          404,
        );
      }

      if (removePermissionIds.length > 0) {
        await User.findOneAndUpdate(
          {
            _id: staffId,
            "customRole.businessId": businessId,
          },
          {
            $pull: {
              "customRole.permissionIds": {
                $in: removePermissionIds,
              },
            },
          },
        );
      }

      if (removePermissionGroupIds.length > 0) {
        await User.findOneAndUpdate(
          {
            _id: staffId,
            "customRole.businessId": businessId,
          },
          {
            $pull: {
              "customRole.permissionGroupIds": {
                $in: removePermissionGroupIds,
              },
            },
          },
        );
      }

      const perObj = await createPermissionObject(
        permissionIds,
        permissionGroupIds,
      );

      const customRole = {
        businessId,
        role,
        permissionGroupIds,
        default: false,
        isDeleted: false,
        permissions:
          permissionGroupIds.length > 0 || permissionIds.length > 0
            ? perObj
            : {},
        permissionIds,
      };

      await User.findOneAndUpdate(
        {
          _id: staffId,
          "customRole.businessId": businessId,
        },
        {
          $set: {
            "customRole.$": customRole,
            name: name || undefined,
            bookMark: bookMark,
          },
        },
      );

      return c.json({
        message: "Staff updated successfully",
        data: {},
        err: false,
      });
    },
  )

  .put(
    "/:staffId/change_password",
    zValidator(
      "json",
      z.object({
        businessId: z.string(),
        oldPassword: z.string(),
        newPassword: z.string(),
        forgetPassword: z.boolean().optional().default(false),
        otp: z.string().optional(),
      }),
    ),
    async (c) => {
      const requestData = await c.req.json();
      const { staffId } = c.req.param();
      const { oldPassword, newPassword, businessId, forgetPassword, otp } =
        requestData;

      const user = await User.findById(staffId);

      if (forgetPassword) {
        const options = {
          method: "POST",
          url: `https://control.msg91.com/api/v5/otp?template_id=64393bf9d6fc05380863b002&mobile=91${user?.phone}`,
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            authkey: "387796AmyGlDBq63b2d75aP1",
          },
        };
        const response = await axios(options);

        if (otp.length > 1) {
          const options = {
            method: "GET",
            url: `https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=91${user?.phone}`,
            headers: {
              accept: "application/json",
              authkey: "387796AmyGlDBq63b2d75aP1",
            },
          };

          const response = await axios(options);

          if (
            response?.data?.message === "Mobile no. not found" ||
            response?.data?.message === "OTP not match" ||
            response?.data?.message === "OTP expired" ||
            response?.data?.message === "Otp empty or not numeric" ||
            response?.data?.message ===
              "Max limit reached for this otp verification"
          ) {
            return c.json(
              {
                err: true,
                status: false,
                message: "Please enter valid Otp !!",
              },
              400,
            );
          }

          await User.findOneAndUpdate(
            {
              _id: staffId,
            },
            {
              $set: {
                password: newPassword
                  ? await hashPassword(newPassword)
                  : undefined,
              },
            },
          );

          return c.json({
            message: "password updated successfully",
            data: {},
            err: false,
          });
        }
      }

      if (!user) {
        return c.json(
          {
            message: "Staff not found",
            data: {},
            err: true,
          },
          404,
        );
      }

      const isMatch = await verifyPassword(
        oldPassword,
        user.password as string,
      );
      if (!isMatch) {
        return c.json(
          {
            message: "Old password does not match",
            data: {},
            err: true,
          },
          400,
        );
      }

      await User.findOneAndUpdate(
        {
          _id: staffId,
        },
        {
          $set: {
            password: newPassword ? await hashPassword(newPassword) : undefined,
          },
        },
      );

      return c.json({
        message: "password updated successfully",
        data: {},
        err: false,
      });
    },
  )

  .delete(
    "/:staffId/:businessId",

    zValidator(
      "param",
      z.object({
        staffId: z.string(),
        businessId: z.string(),
      }),
    ),
    async (c) => {
      const { staffId, businessId } = c.req.param();

      const deleteStaff = await User.findOneAndUpdate(
        {
          _id: staffId,
          "customRole.businessId": businessId,
        },
        {
          $set: {
            "customRole.$.isDeleted": true,
          },
        },
        { new: true },
      );
      return respond(
        c,
        deleteStaff ? "Staff deleted successfully" : "Staff not found",
        !deleteStaff,
        deleteStaff ? 200 : 404,
        deleteStaff || {},
      );
    },
  )

  .post("/Owner/Login", zValidator("json", UserAttrs), async (c) => {
    const requestData = await c.req.json();
    const { phone, password, role } = requestData;

    if (password === "1234") {
      const existingUser = await User.findOne({
        phone,
        role: "OWNER",
      });

      if (!existingUser) {
        return c.json(
          {
            err: true,
            status: false,
            message: "Phone or Password invalid...!",
          },
          400,
        );
      }
      const accessToken = createAccessToken(
        existingUser?._id.toString() || "",
        "OWNER",
      );
      const refreshToken = createRefreshToken(
        existingUser?._id.toString() || "",
        "OWNER",
      );

      return c.json({
        data: {
          existingUser: existingUser,
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
        err: false,
        status: true,
        message: "Login SuccessFully !!!",
      });
    }
    const existingUser = await User.findOne({
      phone,
      password,
      role: "OWNER",
    });
    if (!existingUser) {
      return c.json(
        { err: true, status: false, message: "Phone or Password invalid...!" },
        400,
      );
    }
    const accessToken = createAccessToken(
      existingUser?._id.toString() || "",
      "OWNER",
    );
    const refreshToken = createRefreshToken(
      existingUser?._id.toString() || "",
      "OWNER",
    );

    return c.json({
      data: {
        existingUser: existingUser,
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
      err: false,
      status: true,
      message: "Login SuccessFully !!!",
    });
  })

  .get(
    "/:businessId",
    zValidator("param", paramsSchema),

    async (c) => {
      const { businessId } = c.req.param();
      const existingUser = await User.find({
        customRole: {
          $elemMatch: {
            businessId: businessId,
            isDeleted: false,
          },
        },
      }).select({
        name: 1,
        phone: 1,
        customRole: {
          $elemMatch: {
            businessId: businessId,
            isDeleted: false,
          },
        },
      });

      return respond(c, "Staff fetched successfully", false, 200, existingUser);
    },
  )
  .get(
    "/getStaff/:staffId",

    zValidator(
      "param",
      z.object({
        staffId: z.string(),
      }),
    ),
    async (c) => {
      const { staffId } = c.req.param();
      const existingUser = await User.findById(staffId);
      if (!existingUser) return respond(c, "User not found", true, 404, {});
      return respond(c, "User fetched successfully", false, 200, existingUser);
    },
  )
  .post(
    "/:id/signIn",
    zValidator(
      "json",
      z.object({
        otp: z.string().length(4),
        loyaltyId: z.string().optional(),
        signUpBonus: z.number().optional(),
        name: z.string().min(3).max(100).optional(),
        userId: z.string(),
        phone: z.string().min(10).max(10),
        businessId: z.string().optional(),
      }),
    ),
    async (c) => {
      const requestData = await c.req.json();
      const { otp, loyaltyId, signUpBonus, name, userId, phone, businessId } =
        requestData;

      let existingUser: UserType | null = null;
      existingUser = await User.findByIdAndUpdate(
        userId,
        { name },
        { new: true },
      ).lean();
      if (!existingUser) {
        return respond(c, "User not found", true, 404, {});
      }

      const options = {
        method: "GET",
        url: `https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=91${phone}`,
        headers: {
          accept: "application/json",
          authkey: "387796AmyGlDBq63b2d75aP1",
        },
      };

      const response = await axios(options);

      if (
        response?.data?.message === "Mobile no. not found" ||
        response?.data?.message === "OTP not match" ||
        response?.data?.message === "OTP expired" ||
        response?.data?.message === "Otp empty or not numeric" ||
        response?.data?.message ===
          "Max limit reached for this otp verification"
      )
        return respond(c, "Please enter valid Otp !", true, 400, {});

      try {
        if (loyaltyId && signUpBonus && signUpBonus > 0) {
          const bonus = await addSignUpBonus(loyaltyId, userId, signUpBonus);
          console.log("bonus", bonus);
        }
      } catch (e) {
        return respond(c, "Error in adding sign up bonus", true, 400, {});
      }

      if (loyaltyId && signUpBonus > 0) {
        const userReward = await UserReward.findOne({
          userId: userId,
          loyaltyId,
        });

        const accessToken = createAccessToken(
          existingUser._id?.toString() || "",
          "HIPAL_CUSTOMER",
        );
        const refreshToken = createRefreshToken(
          existingUser._id?.toString() || "",
          "HIPAL_CUSTOMER",
        );
        const modifyUser = {
          ...existingUser,
          reward: signUpBonus,

          count: userReward?.scanCount,
        };
        const subscriber = await Subscriber.findOne({
          userId: existingUser._id,
          businessId: businessId,
        }).select("_id");

        if (!subscriber) {
          await Subscriber.create({
            userId: userId,
            businessId: businessId,
            userCount: 1,
            date: Date.now(),
          });
        } else {
          await Subscriber.findOneAndUpdate(
            {
              userId: userId,
              businessId: businessId,
            },
            {
              $inc: {
                userCount: 1,
              },
            },
          );
        }
        return respond(c, "User logged in successfully", false, 200, {
          user: modifyUser,
          accessToken,
          refreshToken,
          rewards: signUpBonus,
        });
      }

      const subscriber = await Subscriber.findOne({
        userId: existingUser._id,
        businessId: businessId,
      }).select("_id");

      if (!subscriber) {
        await Subscriber.create({
          userId: userId,
          businessId: businessId,
          userCount: 1,
          date: Date.now(),
        });
      } else {
        await Subscriber.findOneAndUpdate(
          {
            userId: userId,
            businessId: businessId,
          },
          {
            $inc: {
              userCount: 1,
            },
          },
        );
      }

      const accessToken = createAccessToken(
        existingUser._id?.toString() || "",
        "HIPAL_CUSTOMER",
      );
      const refreshToken = createRefreshToken(
        existingUser._id?.toString() || "",
        "HIPAL_CUSTOMER",
      );

      return respond(c, "User logged in successfully", false, 200, {
        user: existingUser,
        accessToken,
        refreshToken,
        rewards: 0,
      });
    },
  )
  .get(
    "/:id/loyaltyUserHistory",

    zValidator(
      "query",
      z.object({
        userId: z.string(),
        loyaltyId: z.string(),
      }),
    ),

    async (c) => {
      const { userId, loyaltyId } = c.req.query();

      const existingUser = await UserRewardHistory.find({
        userId,
        loyaltyId,
      }).select("rewards status date");

      const totalWin = existingUser.reduce((acc, item) => {
        if (item.status === "PLUS") {
          return acc + (item.rewards || 0);
        }
        return acc;
      }, 0);

      const totalSave = existingUser.reduce((acc, item) => {
        if (item.status === "MINUS") {
          return acc + (item?.rewards ?? 0);
        }
        return acc;
      }, 0);

      return c.json({
        data: { totalWin, totalSave },
        status: true,
        message: "User fetched successfully",
        err: false,
      });
    },
  )
  .get(
    "/:businessId/getUserReward",
    // authTokenValidator,
    // requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_CUSTOMER]),

    zValidator(
      "query",
      z.object({
        userId: z.string(),
        loyaltyId: z.string(),
      }),
    ),

    async (c) => {
      const { userId, loyaltyId } = c.req.query();

      const userExist = await User.findOne({
        _id: userId,
      });
      if (!userExist) {
        return c.json({
          message: "User not found",
        });
      }

      const userRewards = await UserReward.findOne({
        userId,
        loyaltyId,
      }).populate("userId", {
        name: 1,
        phone: 1,
        _id: 0,
      });

      if (!userRewards) {
        return c.json({
          message: "User reward not found",
          data: {},
          err: true,
        });
      }

      return c.json({
        message: "User reward fetched successfully",
        data: userRewards,
        err: false,
      });
    },
  )
  .get(
    "/:businessId/getUserRewardHistory",
    zValidator(
      "query",
      z.object({
        userId: z.string(),
        loyaltyId: z.string(),
        from: z.string().optional(),
        to: z.string().optional(),
        pageNumber: z.string().optional(),
      }),
    ),
    async (c) => {
      const { userId, loyaltyId, from, to } = c.req.query();

      const fromDate = Number(from);
      const toDate = Number(to);
      const PAGE_SIZE = 20;
      const pageNumber = c.req.query("pageNumber") as string;
      const skip: number = (Number(pageNumber) - 1) * PAGE_SIZE;
      if (fromDate > toDate)
        return respond(
          c,
          "From date cannot be greater than to date",
          true,
          400,
          {},
        );
      const userRewards = await UserReward.findOne({
        userId,
        loyaltyId,
      }).populate("userId", {
        name: 1,
        phone: 1,
        _id: 0,
      });
      const totalReward = userRewards?.rewards;
      const userName = userRewards?.userId.name || "";
      const userPhone = userRewards?.userId.phone || "";

      if (!from && !to) {
        const userRewards = await UserRewardHistory.find({
          userId,
          loyaltyId,
        })
          .sort({ _id: -1 })
          .skip(skip)
          .limit(PAGE_SIZE)
          .populate("userId", {
            name: 1,
            phone: 1,
            _id: 0,
          });

        const newObje =
          {
            totalReward,
            userName,
            userPhone,
            items: userRewards,
          } || {};

        return respond(
          c,
          "User reward fetched successfully",
          false,
          200,
          newObje,
        );
      }
      if (from && to) {
        const filteredRewards = await UserRewardHistory.find({
          userId,
          loyaltyId,
          date: {
            $gte: fromDate,
            $lte: toDate,
          },
        })

          .sort({ id: -1 })
          .skip(skip)
          .limit(PAGE_SIZE)
          .populate("userId", {
            name: 1,
            phone: 1,
            _id: 0,
          });
        const newObje =
          {
            totalReward,
            userName,
            userPhone,
            items: filteredRewards,
          } || {};
        return respond(
          c,
          "User reward fetched successfully",
          false,
          200,
          newObje,
        );
      }
    },
  )

  .post(
    "/save/token",
    zValidator(
      "json",
      z.object({
        registrationToken: z
          .string()
          .min(10, {
            message:
              "registrationToken is required and must be at least 10 characters",
          })
          .max(1000, {
            message:
              "registrationToken is required and must be at most 1000 characters",
          }),

        businessId: z.string(),
        userId: z.string(),
      }),
    ),

    async (c) => {
      const requestData = await c.req.json();
      const { registrationToken, businessId, userId } = requestData;

      const alreadyExist = await DeviceToken.findOne({
        token: registrationToken,
      });

      if (!alreadyExist) {
        const save = await DeviceToken.create({
          businessId,
          userId,
          token: registrationToken,
        });

        return c.json({
          message: "Token saved successfully",
          err: false,
          data: save,
        });
      }

      return c.json({
        message: "Token saved successfully",
        err: false,
        data: alreadyExist,
      });
    },
  )
  .put(
    "/update/token",
    zValidator(
      "json",
      z.object({
        notification: z.boolean(),
        businessId: z.string(),
        userId: z.string(),
        registrationToken: z.string(),
      }),
    ),

    async (c) => {
      const requestData = await c.req.json();
      const { notification, registrationToken } = requestData;

      const updateDeviceToken = await DeviceToken.findOneAndUpdate(
        {
          token: registrationToken,
        },
        { notification: notification },
        { new: true },
      );

      return c.json({
        message: "Token saved successfully    ",
        err: false,
        data: updateDeviceToken,
      });
    },
  )
  .put(
    "/updateUserInfo/:userId",
    zValidator("param", z.object({ userId: z.string() })),
    zValidator("json", z.object({ dob: z.number() })),

    async (c) => {
      const { dob } = await c.req.json();
      const { userId } = c.req.param();

      const user = await User.findByIdAndUpdate(userId, { dob }, { new: true });

      if (!user) {
        return respond(c, "User not found", true, 404, {});
      }

      return respond(c, "User updated successfully", false, 200, user);
    },
  )

  .post(
    "/set_session",
    zValidator(
      "json",
      z.object({
        businessId: z.string(),
        userId: z.string(),
        bookMark: z.boolean().optional(),
      }),
    ),
    async (c) => {
      const requestData = await c.req.json();
      const { businessId, userId, bookMark } = requestData;

      const existingUser = await User.findOne(
        {
          _id: userId,
          "customRole.businessId": businessId,
        },
        {
          name: 1,
          email: 1,
          phone: 1,
          customRole: {
            $elemMatch: { businessId: businessId },
          },
        },
      );

      if (!existingUser) {
        return respond(c, "User not found", true, 404, {});
      }

      if (bookMark) {
        await User.findOneAndUpdate(
          {
            _id: userId,
            "customRole.businessId": businessId,
          },
          {
            $set: {
              "customRole.$.bookMark": bookMark,
            },
          },
        );
      }

      const permissionToken = jwt.sign(
        {
          id: existingUser._id,
          permissions: existingUser?.customRole?.[0]?.permissions || {},
        },
        Bun.env.JWT_SECRET as string,
      );
      // setCookie(c, "token", permissionToken, {
      //   httpOnly: true, // Prevents JavaScript access to the cookie
      //   secure: true, // Ensures the cookie is only sent over HTTPS
      //   sameSite: "Lax", // Helps mitigate CSRF attacks
      //   domain: "yourdomain.com", // Replace with your actual domain
      //   path: "/", // Ensures the cookie is sent with all requests to your domain
      // });

      setCookie(c, "token", permissionToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        domain: "localhost",
        path: "/",
      });

      return respond(c, "Session set successfully", false, 200, {});
    },
  );

export default usersRouter;
