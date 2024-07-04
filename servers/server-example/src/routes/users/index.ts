// books.ts
import { LoyaltyCoinsInfo, User, UserReward, UserRewardHistory } from '@hi/db-models';
import { UserAttrs, UserType } from '@hi/db-models/src/validators';
import { zValidator } from '@hono/zod-validator';
import axios from 'axios';
import { Hono } from 'hono';
import jwt from 'jsonwebtoken';

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
    //testing
    await newReward.save();
    const data = new UserRewardHistory({
      userName: name,
      userPhone: phone,
      status: 'plus',
      rewards: bonus,
      currentBalance: bonus,
      loyaltyId,
    });

    await data.save();
  } else if (existingReward) {
    if (!existingReward?.scanCount || existingReward?.scanCount === 0) {
      const userReward = await UserReward.findOneAndUpdate(
        { userPhone: phone, loyaltyId },
        { $inc: { rewards: bonus, scanCount: 1 } },
        { new: true },
      );
      await LoyaltyCoinsInfo.findOneAndUpdate(
        { businessId: loyaltyId },

        {
          $inc: {
            coinzIssued: bonus,
          },
        },
      );
      const data = new UserRewardHistory({
        userName: userReward?.userName || name,
        userPhone: userReward?.userPhone || phone,

        status: 'plus',
        rewards: bonus,

        currentBalance: userReward?.rewards || bonus,

        loyaltyId,
      });

      await data.save();
    } else {
      await UserReward.findOneAndUpdate({ userPhone: phone, loyaltyId }, { $inc: { scanCount: 1 } }, { new: true });

      return 1;
    }
  }
  return 1;
};

const createAccessToken = (user: UserType) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role || 'HIPAL_CUSTOMER',
    },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }, // Add 7 day expiration
  );
};

const createJWT = (user: UserType) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
    },
    process.env.JWT_SECRET as string,
  );
};

const createRefreshToken = (user: UserType) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role || 'HIPAL_CUSTOMER',
    },
    process.env.JWT_SECRET as string,
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
      const accessTokenExistingUser = createAccessToken(existingUser);
      const refreshTokenExistingUser = createRefreshToken(existingUser);
      return c.json({
        status: false,
        message: 'User already exist',
        data: { user: existingUser, accessToken: accessTokenExistingUser, refreshToken: refreshTokenExistingUser },
        err: false,
      });
    }

    const user = await User.create(requestData);

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    return c.json({
      status: true,
      message: 'User created successfully',
      data: { user: user, accessToken, refreshToken },
      err: false,
    });
  })
  .post('/:id/stafflogin', async (c) => {})
  .get('/:businessId', async (c) => {
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
  .post('/:id/signIn', async (c) => {
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
      const accessTokenExistingUser = createAccessToken(existingUser);
      const refreshTokenExistingUser = createRefreshToken(existingUser);
      return c.json(
        {
          status: false,
          message: 'User already exist',
          data: { user: existingUser, accessToken: accessTokenExistingUser, refreshToken: refreshTokenExistingUser },
          err: false,
        },
        409,
      );
    }

    const user = await User.create(requestData);

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

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
  .get('/:id/loyaltyUserHistiry', async (c) => {
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
  })
  .get('/:businessId/getUserReward', async (c) => {
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
  })
  .get('/:businessId/getUserRewardHistory', async (c) => {
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
  });

export default usersRouter;
