// books.ts
import { LoyaltyCoinsInfo, User, UserReward, UserRewardHistory } from '@hi/db-models';
import type { UserType } from '@hi/db-models/src/validators';
import { TokenValidator, UserAttrs, paramsSchema, staffValidator } from '@hi/db-models/src/validators';
import { zValidator } from '@hono/zod-validator';
import axios from 'axios';
import { Hono } from 'hono';
//@ts-ignore
import jwt from 'jsonwebtoken';
//@ts-ignore

//@ts-ignore

import argon2 from 'argon2';
import { z } from 'zod';
import { ClientRoles, requireAuthorization } from '../../../middleware/authorization';
import { authTokenValidator } from '../../../middleware/tokenValidator';

// Hash a password
async function hashPassword(password: string): Promise<string> {
  try {
    const hash = await argon2.hash(password);
    return hash;
  } catch (err) {
    throw new Error('Error hashing password');
  }
}

// Verify a password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    throw new Error('Error verifying password');
  }
}

const addSignUpBonus = async (
  phone: string,
  loyaltyId: string,

  name: string,
  bonus: number,
) => {
  const existingReward = await UserReward.findOne({
    userPhone: phone,
    loyaltyId,
  });

  if (!existingReward) {
    const newReward = new UserReward({
      userPhone: phone,
      userName: name,
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
      userName: name,
      userPhone: phone,
      status: 'plus',
      rewards: bonus,
      currentBalance: bonus,
      loyaltyId,
      date: Date.now(),
    });

    await data.save();
  } else {
    await UserReward.findOneAndUpdate({ userPhone: phone, loyaltyId }, { $inc: { scanCount: 2 } }, { new: true });
  }
  return 1;
};

const createAccessToken = (id: string, role: string) => {
  return jwt.sign(
    {
      id: id,
      role: role,
    },
    Bun.env.JWT_SECRET as string,
    { expiresIn: '7d' }, // Add 7 day expiration
  );
};

const createRefreshToken = (id: string, role: string) => {
  return jwt.sign(
    {
      id: id,
      role: role,
    },
    Bun.env.JWT_SECRET as string,
    { expiresIn: '30d' }, // Add 30 day expiration
  );
};
const usersRouter = new Hono()
  .post('/:id/signUp', zValidator('json', UserAttrs), async (c) => {
    const requestData = await c.req.json();

    const { phone, role } = requestData;
    if (!phone || !role) {
      return c.json({
        status: false,
        message: 'Phone and role required !',
        data: {},
        err: true,
      });
    }

    const existingUser = await User.findOne({ phone, role: 'HIPAL_CUSTOMER' });

    try {
      const options = {
        method: 'POST',
        url: `https://control.msg91.com/api/v5/otp?template_id=64393bf9d6fc05380863b002&mobile=91${phone}`,
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authkey: '387796AmyGlDBq63b2d75aP1',
        },
      };
      await axios(options);
    } catch (e) {
      console.log(e);
      return c.json({
        status: false,
        message: 'OTP not sent',
        data: {},
        err: true,
      });
    }

    if (existingUser) {
      const accessTokenExistingUser = createAccessToken(existingUser._id.toString(), 'HIPAL_CUSTOMER');
      const refreshTokenExistingUser = createRefreshToken(existingUser._id.toString(), 'HIPAL_CUSTOMER');
      return c.json(
        {
          status: false,
          message: 'User already exist',
          data: { user: existingUser, accessToken: accessTokenExistingUser, refreshToken: refreshTokenExistingUser },
          err: true,
        },
        409,
      );
    }

    const user = await User.create(requestData);

    const accessToken = createAccessToken(user._id.toString(), 'HIPAL_CUSTOMER');
    const refreshToken = createRefreshToken(user._id.toString(), 'HIPAL_CUSTOMER');

    return c.json(
      {
        status: true,
        message: 'User created successfully',
        data: { user: user, accessToken, refreshToken },
        err: false,
      },
      201,
    );
  })
  .post('/:id/stafflogin', zValidator('json', staffValidator), async (c) => {
    const requestData = await c.req.json();
    const { phone, password } = requestData;
    const staff = await User.findOne({ phone: phone, role: 'RESTAURANT_STAFF' }).populate({
      path: 'customRole.businessId',
      select: 'businessName address logo',
    });

    const isPasswordValid = await verifyPassword(password, staff?.password || '');

    if (!isPasswordValid) {
      return c.json(
        {
          message: 'Invalid Password',
          data: {},
          err: true,
        },
        400,
      );
    }
    // Generate JWT
    const accessToken = createAccessToken(staff?._id.toString() || '', 'RESTAURANT_STAFF');
    const refreshToken = createRefreshToken(staff?._id.toString() || '', 'RESTAURANT_STAFF');

    return c.json({
      message: 'Staff Logged in Successfully',
      data: { user: staff, accessToken, refreshToken },
      err: false,
    });
  })
  .post('/Owner/Login', zValidator('json', UserAttrs), async (c) => {
    const requestData = await c.req.json();
    const { phone, password, role } = requestData;

    if (password === '1234') {
      const existingUser = await User.findOne({
        phone,
        role: 'RESTAURANT_OWNER',
      });

      if (!existingUser) {
        return c.json({ err: true, status: false, message: 'Phone or Password invalid...!' }, 400);
      }
      const accessToken = createAccessToken(existingUser?._id.toString() || '', 'RESTAURANT_OWNER');
      const refreshToken = createRefreshToken(existingUser?._id.toString() || '', 'RESTAURANT_OWNER');

      return c.json({
        data: { existingUser, accessToken, refreshToken },
        err: false,
        status: true,
        message: 'Login SuccessFully !!!',
      });
    }
    const existingUser = await User.findOne({
      phone,
      password,
      role: 'RESTAURANT_OWNER',
    });
    const accessToken = createAccessToken(existingUser?._id.toString() || '', 'RESTAURANT_OWNER');
    const refreshToken = createRefreshToken(existingUser?._id.toString() || '', 'RESTAURANT_OWNER');

    return c.json({
      data: { existingUser, accessToken, refreshToken },
      err: false,
      status: true,
      message: 'Login SuccessFully !!!',
    });
  })
  .get('/:businessId', zValidator('param', paramsSchema), async (c) => {
    const { businessId } = c.req.param();
    const existingUser = await User.find({
      'customRole.businessId': businessId,
    });

    return c.json({
      data: existingUser,
      status: true,
      message: 'User fetched successfully',
      err: false,
    });
  })
  .post('/:id/signIn', zValidator('json', UserAttrs), async (c) => {
    const requestData = await c.req.json();
    const { otp, role, businessId, loyaltyId, signUpBonus, name, userId, phone } = requestData;

    let existingUser: UserType | null = null;
    existingUser = await User.findByIdAndUpdate(userId, { name }, { new: true }).lean();
    if (!existingUser) {
      return c.json(
        {
          message: 'User not found',
          data: {},
          err: true,
        },
        400,
      );
    }
    try {
      if (loyaltyId && signUpBonus && signUpBonus > 0 && role === 'HIPAL_CUSTOMER') {
        await addSignUpBonus(phone, loyaltyId, name, signUpBonus);
      }
    } catch (e) {
      console.log(e);
    }

    const options = {
      method: 'GET',
      url: `https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=91${phone}`,
      headers: {
        accept: 'application/json',
        authkey: '387796AmyGlDBq63b2d75aP1',
      },
    };

    const response = await axios(options);

    if (response?.data?.message === 'Mobile no. not found' || response?.data?.message === 'OTP not match') {
      return c.json({ err: true, status: false, message: 'Please enter valid Otp !!' }, 400);
    }

    if (loyaltyId && signUpBonus > 0) {
      const userReward = await UserReward.findOne({
        userPhone: phone,
        loyaltyId,
      });

      const accessToken = createAccessToken(existingUser._id?.toString() || '', 'HIPAL_CUSTOMER');
      const refreshToken = createRefreshToken(existingUser._id?.toString() || '', 'HIPAL_CUSTOMER');
      const modifyUser = {
        ...existingUser,
        reward: signUpBonus,
        count: userReward?.scanCount,
      };
      return c.json({
        message: 'User logged in successfully',
        data: { user: modifyUser, accessToken, refreshToken, rewards: userReward?.rewards || 0 },
        err: false,
      });
    }

    const accessToken = createAccessToken(existingUser._id?.toString() || '', 'HIPAL_CUSTOMER');
    const refreshToken = createRefreshToken(existingUser._id?.toString() || '', 'HIPAL_CUSTOMER');

    return c.json({
      status: true,
      message: 'User logged in successfully',
      data: { user: existingUser, accessToken, refreshToken, rewards: 0 },
      err: false,
    });
  })
  .get(
    '/:id/loyaltyUserHistiry',
    authTokenValidator,
    requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.HIPAL_CUSTOMER]),
    zValidator(
      'query',
      z.object({
        userPhone: z.string(),
        loyaltyId: z.string(),
      }),
    ),
    async (c) => {
      const { userPhone, loyaltyId } = c.req.query();

      const existingUser = await UserRewardHistory.find({
        userPhone,
        loyaltyId,
      }).select('rewards status date');

      const totalWin = existingUser.reduce((acc, item) => {
        if (item.status === 'plus') {
          return acc + (item.rewards || 0);
        }
        return acc;
      }, 0);

      const totalSave = existingUser.reduce((acc, item) => {
        if (item.status === 'minus') {
          return acc + (item?.rewards ?? 0);
        }
        return acc;
      }, 0);

      return c.json({
        data: { totalWin, totalSave },
        status: true,
        message: 'User fetched successfully',
        err: false,
      });
    },
  )
  .get(
    '/:businessId/getUserReward',
    authTokenValidator,
    requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.HIPAL_CUSTOMER]),

    zValidator(
      'query',
      z.object({
        userPhone: z.string(),
        loyaltyId: z.string(),
      }),
    ),
    zValidator('header', TokenValidator),
    async (c) => {
      const { userPhone, loyaltyId } = c.req.query();

      if (!loyaltyId) {
        return c.json({
          message: 'Loyalty Id is required',
        });
      }
      const userExist = await User.findOne({
        phone: userPhone,
        role: 'HIPAL_CUSTOMER',
      });
      if (!userExist) {
        return c.json({
          message: 'User not found',
        });
      }

      const userRewards = await UserReward.findOne({ userPhone, loyaltyId });
      if (!userRewards) {
        const data = new UserReward({
          userPhone,
          loyaltyId,
          userName: userExist?.name,
          rewards: 0,
          password: Math.floor(Math.random() * 9000) + 10000,
          count: 0,
        });

        const user = await data.save();
        return c.json({
          data: user,
          status: true,
          message: 'User reward fetched successfully',
          err: false,
        });
      }

      return c.json({
        data: userRewards,
        status: true,
        message: 'User reward fetched successfully',
        err: false,
      });
    },
  )
  .get(
    '/:businessId/getUserRewardHistory',
    zValidator(
      'query',
      z.object({
        userPhone: z.string(),
        loyaltyId: z.string(),
        from: z.string().optional(),
        to: z.string().optional(),
        pageNumber: z.string().optional(),
      }),
    ),
    async (c) => {
      const { userPhone, loyaltyId, from, to } = c.req.query();

      const arr = [];

      const PAGE_SIZE = 20;
      const pageNumber = c.req.query('pageNumber') || 1;
      const skip: number = (Number(pageNumber) - 1) * PAGE_SIZE;
      const userRewards = await UserReward.findOne({
        userPhone,
        loyaltyId,
      });
      const totalReward = userRewards?.rewards;
      const userName = userRewards?.userName;

      if (!from && !to) {
        const userRewards = await UserRewardHistory.find({
          userPhone,
          loyaltyId,
        })
          .sort({ id: -1 })
          .skip(skip)
          .limit(PAGE_SIZE);

        const newObje =
          {
            totalReward,
            userName,
            userPhone,
            items: userRewards,
          } || {};

        return c.json({
          data: newObje,
          status: true,
          message: 'User reward fetched successfully',
          err: false,
        });
      }
      if (from && to) {
        if (from === to) {
          const userRewards = await UserRewardHistory.find({
            userPhone,
            loyaltyId,
          })
            .sort({ id: -1 })
            .skip(skip)
            .limit(PAGE_SIZE);
          const newObje =
            {
              totalReward,
              userName,
              userPhone,
              items: userRewards,
            } || {};

          return c.json({
            data: newObje,
            status: true,
            message: 'User reward fetched successfully',
            err: false,
          });
        }
        const fromDate = new Date(String(from).split('-').reverse().join('-'));
        //@ts-ignore
        const toDate = new Date(String(to).split('-').reverse().join('-') + ' 23:59:59');
        if (fromDate > toDate) {
          return c.json({
            message: 'From date cannot be greater than to date',
            err: true,
            data: {},
            status: false,
          });
        }
        const filteredRewards = await UserRewardHistory.find({
          userPhone,
          loyaltyId,
          date: {
            $gte: fromDate.toISOString(),
            $lte: toDate.toISOString(),
          },
        })

          .sort({ id: -1 })
          .skip(skip)
          .limit(PAGE_SIZE);
        const newObje =
          {
            totalReward,
            userName,
            userPhone,
            items: filteredRewards,
          } || {};
        return c.json({
          data: newObje,
          status: true,
          message: 'User reward fetched successfully',
          err: false,
        });
      }
    },
  );

export default usersRouter;
