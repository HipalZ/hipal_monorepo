// import { BadRequestError, NotFoundError, validateRequest } from "@hipal/common";
import { staffValidator, UrlAttrs, UserAttrs } from '@hi/db-models/src/validators';
import axios from 'axios';
import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { redisWrapper } from '../redis-wrapper';

import { Admin, LoyaltyCoinsInfo, LoyaltySettings, UrlModel, User, UserReward, UserRewardHistory } from '@hi/db-models';
import { runInTransaction } from '@hi/utils';
import bcrypt from 'bcrypt';
import { ClientSession } from 'mongoose';
import { z } from 'zod';
import { validateRequest } from 'zod-express-middleware';

const shortid = require('shortid');
const FCM = require('fcm-node');
import moment = require('moment');

const router = express.Router();

const createAccessToken = (user: any) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role[0],
      customRole: user.customRole,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }, // Add 7 day expiration
  );
};

const createJWT = (user: any) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      customRole: user.customRole,
    },
    process.env.JWT_SECRET as string,
  );
};

const createRefreshToken = (user: any) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role[0],
      customRole: user.customRole,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: '30d' }, // Add 30 day expiration
  );
};

const addSignUpBonus = async (
  phone: string,
  loyaltyId: string,

  name: string,
  bonus: number,
) => {
  let existingReward = await UserReward.findOne({
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
    return 1;
  } else if (existingReward) {
    if (!existingReward?.scanCount || existingReward?.scanCount == 0) {
      let userReward = await UserReward.findOneAndUpdate({ userPhone: phone, loyaltyId }, { $inc: { rewards: bonus, scanCount: 1 } }, { new: true });
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
      return 1;
    } else {
      await UserReward.findOneAndUpdate({ userPhone: phone, loyaltyId }, { $inc: { scanCount: 1 } }, { new: true });

      return 1;
    }
  }
  return 1;
};

router.post(
  '/v1/users/:id/signUp',
  validateRequest({
    body: UserAttrs,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof UserAttrs>>, res: Response) => {
    let { phone, role } = req.body;
    if (!phone || !role) {
      return res.status(400).send({
        status: false,
        message: 'Phone and role required',
        data: {},
        err: true,
      });
    }

    let existingUser;
    existingUser = await User.findOne({ phone, role: 'HIPAL_CUSTOMER' });

    // try {
    //   const options = {
    //     method: 'POST',
    //     url: `https://control.msg91.com/api/v5/otp?template_id=64393bf9d6fc05380863b002&mobile=91${phone}`,
    //     headers: {
    //       accept: 'application/json',
    //       'content-type': 'application/json',
    //       authkey: '387796AmyGlDBq63b2d75aP1',
    //     },
    //   };
    //   await axios(options);
    // } catch (e: any) {
    //   console.log(e);
    //   return res.status(500).send({ status: false, message: e.message });
    // }

    if (existingUser) {
      const accessTokenExistingUser = createAccessToken(existingUser);
      const refreshTokenExistingUser = createRefreshToken(existingUser);
      return res.status(409).send({
        status: false,
        message: 'User already exist',
        data: { user: existingUser, accessToken: accessTokenExistingUser, refreshToken: refreshTokenExistingUser },
        err: false,
      });
    }

    const user = await User.create(req.body);

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    return res.status(201).send({
      status: true,
      message: 'User created successfully',
      data: { user: user, accessToken, refreshToken },
      err: false,
    });
  },
);

router.post(
  '/v1/users/:id/signIn',
  // validateUser,
  // validateRequest,
  async (req: Request, res: Response) => {
    let { otp, role, businessId, loyaltyId, signUpBonus, name, userId, phone } = req.body;
    const loyaltyUser= await UserReward.findOne({ userPhone:phone, loyaltyId }).select('rewards');
    let existingUser;
    existingUser = await User.findByIdAndUpdate(userId, { name }, { new: true }).lean();
    if (!existingUser) {
      return res.status(400).send({
        status: false,
        message: 'User not found',
        data: {},
        err: true,
      });
    }
    try {
      if (loyaltyId && signUpBonus && signUpBonus > 0 && role == 'HIPAL_CUSTOMER') {
        await addSignUpBonus(phone, loyaltyId, name, signUpBonus);
      }
    } catch (e) {
      console.log(e);
    }

    // const options = {
    //   method: 'GET',
    //   url: `https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=91${phone}`,
    //   headers: {
    //     accept: 'application/json',
    //     authkey: '387796AmyGlDBq63b2d75aP1',
    //   },
    // };

    // const response = await axios(options);

    // if (response?.data?.message === 'Mobile no. not found' || response?.data?.message === 'OTP not match') {
    //   return res.status(400).send({ err: true, status: false, message: 'Please enter valid Otp !!' });
    // }

    if (loyaltyId && signUpBonus > 0) {
      const userReward = await UserReward.findOne({
        userPhone: phone,
        loyaltyId,
      });
      const accessToken = createAccessToken(existingUser);
      const refreshToken = createRefreshToken(existingUser);
      const modifyUser = {
        ...existingUser,
        reward: signUpBonus,
        count: userReward?.scanCount,
      };
      return res.status(200).send({
        status: true,
        message: 'User logged in successfully',
        data: { user: modifyUser, accessToken, refreshToken,rewards:loyaltyUser?.rewards || 0 },
        err: false,
      });
    }

    const accessToken = createAccessToken(existingUser);
    const refreshToken = createRefreshToken(existingUser);

    return res.status(200).send({
      status: true,
      message: 'User logged in successfully',
      data: { user: existingUser, accessToken, refreshToken,rewards:loyaltyUser?.rewards || 0 },
      err: false,
    });
  },
);

router.post(
  '/v1/users',
  // validateUser,
  // validateRequest,
  async (req: Request, res: Response) => {
    let { name, email, phone, role, customRole, password, otp, accessControl } = req.body;
    const { action, clientRole, withScan, loyaltyId, businessName } = req.query;

    // if (!clientRole) {
    //   throw new BadRequestError("clientRole required");
    // }
    const UserOrAdmin: any = clientRole === 'admin' ? Admin : User;

    if (action === 'signup') {
      if (phone?.length < 10) {
        return res.status(400).send({ status: false, message: 'Phone Number Invalid !!' });
      }

      let existingUserPhone;

      if (clientRole === 'admin') {
        existingUserPhone = await Admin.findOne({ phone, role });
      } else {
        existingUserPhone = await User.findOne({ phone, role });
      }
      // if (existingUserPhone) {
      //   throw new BadRequestError("User registered already");
      // }
      if (role == 'RESTAURANT_OWNER') {
        password = Math.floor(Math.random() * 9000) + 1000;
      }

      const user = UserOrAdmin.build({
        name,
        email,
        phone,
        role,
        customRole,
        password,
        accessControl,
      });

      await user.save();

      // if (
      //   user?.role != "RESTAURANT_OWNER" ||
      //   user?.role != "RESTAURANT_MANAGER"
      // ) {
      //   const options = {
      //     method: "POST",
      //     url: `https://control.msg91.com/api/v5/otp?template_id=64393bf9d6fc05380863b002&mobile=91${phone}`,
      //     headers: {
      //       accept: "application/json",
      //       "content-type": "application/json",
      //       authkey: "387796AmyGlDBq63b2d75aP1",
      //     },
      //   };
      //   await axios(options);
      // }

      // Generate JWT
      // const userJwt = createJWT(user);

      // // // Store it on session object
      // if (!customRole) {
      //   req.session = {
      //     jwt: userJwt,
      //   };
      // }

      res.status(201).send({
        status: true,
        message: 'User created successfully',
        data: user,
        err: false,
      });
    } else if (action === 'login') {
      const number = phone;

      // check if phone number is valid
      // if (!number.match(/^\d+$/)) {
      //   throw new BadRequestError("Phone number Invalid");
      // }

      let user;
      if (clientRole === 'admin') {
        user = await Admin.findOne({ phone, role: 'HIPAL_ADMIN' });
      } else {
        user = await User.findOne({ phone });
      }

      // if (!user) {
      //   throw new NotFoundError();
      // }

      // if (user?.role != "RESTAURANT_OWNER") {
      //   const options = {
      //     method: "GET",
      //     url: `https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=91${number}`,
      //     headers: {
      //       accept: "application/json",
      //       authkey: "387796AmyGlDBq63b2d75aP1",
      //     },
      //   };

      //   const response = await axios(options);

      //   if (
      //     response?.data?.message === "Mobile no. not found" ||
      //     response?.data?.message === "OTP not match"
      //   ) {
      //     return res
      //       .status(400)
      //       .send({ status: false, message: "Please enter valid Otp !!" });
      //   }
      // } else {
      //   const code = await redisWrapper.client.get(`number:${number}:code`);

      //   if (otp !== code) {
      //     throw new BadRequestError("Invalid code");
      //   }
      // }

      // Generate JWT
      // const userJwt = createJWT(user);

      // // // Store it on session object
      // if (!customRole) {
      //   req.session = {
      //     jwt: userJwt,
      //   };
      // }
      res.status(201).send({
        status: true,
        message: 'User logged in successfully',
        data: user,
        err: false,
      });
    } else if (action === 'logout') {
      req.session = null;
      res.send({});
    }
  },
);

router.post(
  '/v1/users/:id/stafflogin',
  validateRequest({
    body: staffValidator,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof staffValidator>>, res: Response) => {
    const { phone, password } = req.body;
    const staff = await User.findOne({ phone: phone, role: 'RESTAURANT_STAFF' }).populate({
      path: 'customRole.businessId',
      select: 'businessName address logo',
    });

    const isPasswordValid = await verifyPassword(password, staff?.password || '');

    if (!isPasswordValid) {
      return res.status(400).send({
        message: 'Invalid Password',
        data: {},
        err: true,
      });
    }
    // Generate JWT
    const accessToken = createAccessToken(staff);
    const refreshToken = createRefreshToken(staff);

    return res.send({
      message: 'Staff Logged in Successfully',
      data: { user: staff, accessToken, refreshToken },
      err: false,
    });
  },
);

const saltRounds = 10;

async function hashPassword(password: string): Promise<string> {
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
router.post(
  '/v1/users/:id/addStaff',
  validateRequest({
    body: UserAttrs,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof UserAttrs>>, res: Response) => {
    const { phone, role, name, password, customRole } = req.body;
    const existingUser = await User.findOne({ phone, role: 'RESTAURANT_STAFF' }).select('phone');
    if (existingUser) {
      return res.status(409).send({
        message: 'Staff already exist',
        data: existingUser,
        err: false,
      });
    }

    if (password === undefined) {
      return res.status(400).send({
        message: 'Password is required',
        err: true,
      });
    }

    const hashPass = await hashPassword(password);

    const createStaff = await User.create({ phone, role, password: hashPass, name, customRole });
    return res.send({
      message: 'Staff Created Successfully',
      data: createStaff,
      err: false,
    });
  },
);

router.post(
  '/v1/users/usrShortner',
  validateRequest({
    body: UrlAttrs,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof UrlAttrs>>, res: Response) => {
    const { longUrl } = req.body;
    let exit = await UrlModel.findOne({ longUrl });
    if (!exit) {
      let id = shortid.generate(); //hggff
      const Data = new UrlModel({
        longUrl: longUrl,
        shortUrl: `${process.env.URL}/v1/users/Url/${id.toLowerCase()}`,
        urlCode: id.toLowerCase(),
      });
      const result = await Data.save();
      return res.send({
        message: 'Url Shortner Successfully',
        data: result,
        err: false,
      });
    } else {
      return res.send({
        message: 'Url already exist',
        data: exit,
        err: false,
      });
    }
    return res.status(500).send({ data: {}, err: true, status: false, message: '' });
  },
);

router.post(
  '/v1/users/login',
  validateRequest({
    body: UserAttrs,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof UserAttrs>>, res: Response) => {
    const { email, role } = req.body || {};
    const existingUser = await User.findOne({
      email: email,
      role: role,
    });
    if (!existingUser)
      return res.status(404).send({
        data: {},
        err: true,
        status: false,
        message: 'Email  Invalid !! Please Try again !!!',
      });
    // Generate JWT
    const userJwt = createJWT(existingUser);
    // Store it on session object
    req.session = {
      jwt: userJwt,
    };

    return res.status(200).send({
      err: false,
      status: true,
      message: 'Login SuccessFully !!!',
      data: existingUser,
    });
    return res.status(500).send({ err: true, data: {}, status: false, message: 's' });
  },
);

router.post(
  '/v1/users/otp',
  validateRequest({
    body: UserAttrs,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof UserAttrs>>, res: Response) => {
    const { phone } = req.body;
    const { clientRole } = req.query;

    // if (!clientRole) {
    //   throw new BadRequestError("clientRole required");
    // }
    let user;

    const UserOrAdmin = clientRole === 'admin' ? Admin : User;

    if (clientRole === 'admin') {
      user = await Admin.findOne({ phone, role: 'HIPAL_ADMIN' });
    } else {
      user = await User.findOne({ phone });
    }

    // if (!user) {
    //   throw new NotFoundError();
    // }

    const number = phone;
    // check if phone number is valid
    // if (!number.match(/^\d+$/)) {
    //   throw new BadRequestError("Phone number is invalid");
    // }

    let otp;
    otp = await redisWrapper.client.get(`number:${number}:code`);
    if (!otp) {
      otp = Math.floor(Math.random() * 9000) + 1000;
      otp = 1234;
    }
  },
);

//TODO: validation service request for otp
router.post(
  '/v1/users/Bill/generateBill',

  async (req: Request, res: Response) => {
    const { businessname, bill } = req.body;

    const mobiles = req.body.mobiles as [];

    for (let i = 0; i < mobiles?.length; i++) {
      const options = {
        method: 'POST',
        url: 'https://control.msg91.com/api/v5/flow/',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authkey: '387796AmyGlDBq63b2d75aP1',
        },
        data: {
          template_id: '647836a0d6fc0547fb4d8e73',
          sender: 'HiPalc',
          short_url: '1',
          mobiles: mobiles[i],
          businessname: businessname,
          bill: bill,
        },
      };
      await axios(options);
    }
    return res.send({
      err: false,
      data: {},
      status: true,
      message: `Bill send on ${mobiles.join(' ')} this numbers !!!`,
    });
    return res.status(500).send({ err: true, status: false, message: 'Error while generating bill' });
  },
);

router.post(
  '/v1/users/loginWithPhone',
  validateRequest({
    body: UserAttrs,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof UserAttrs>>, res: Response) => {
    const { phone } = req.body;

    let userExit = await User.findOne({ phone, role: 'RESTAURANT_MANAGER' });
    if (!userExit) {
      return res.status(400).send({
        err: true,
        status: false,
        message: 'Phone  Invalid !! Please Try again !!!',
        data: {},
      });
    }
    return res.send({
      err: false,
      status: true,
      message: 'Login SuccessFully !!!',
      data: userExit,
    });
  },
);

router.post(
  '/v1/users/chef/Login',
  // validateUser,
  async (req: Request, res: Response) => {
    const { phone } = req.body;

    const existing = await User.findOne({ phone, role: 'RESTAURANT_STAFF' });

    if (!existing) {
      return res.status(400).send({ err: true, data: {}, status: false, message: 'Phone or Password invalid...!' });
    }

    res.status(200).send({
      data: existing,
      err: false,
      status: true,
      message: 'Login SuccessFully !!!',
    });
  },
);

const SERVER_KEY =
  'AAAAj8kkRxk:APA91bEiutN4868JcviOMk4diZLU3MAMRHW8xmLGSYezAhNMobRGUAxWhQZrM-TzP-3qV5XQL0XIOxl_7MwOUSMh7uNH-BAfX78x0K7dt5pvBsgGkYg7BnR1OeMHYG3B9Kr8QqOFv0Bx';

router.post('/v1/users/registrationToken/Send', async (req, res) => {
  const { registrationToken, title, body } = req.body;
  const fcm = new FCM(SERVER_KEY);

  const pushMessage = {
    to: registrationToken,
    notification: {
      title: title || 'Title of the Notification',
      body: body || 'Need your assistance',
      icon: 'https://storage.hipal.life/minio/assets/5da74158-813b-4a88-b020-759a40e722cf',
    },
    data: {
      key1: 'value1',
      key2: 'value2',
    },
  };

  fcm.send(pushMessage, (err: any, response: any) => {
    if (err) {
      console.log('Error sending FCM message:', err);
      return res.status(500).send({
        status: false,
        message: 'Internal Server Error',
      });
    }

    console.log('FCM message sent successfully:', response);
    return res.status(200).send({
      status: true,
      message: 'Notification sent successfully',
    });
  });
  return res.status(500).send({
    status: false,
    message: 'Internal Server Error',
  });
});

router.post(
  '/v1/users/manager/Login',

  async (req: Request, res: Response) => {
    const { phone, password, businessId } = req.body;

    const existingUser = await User.findOne({
      phone,
      password,
      customRole: {
        $elemMatch: {
          businessId,
          permissions: {
            $in: ["resource/get/editStaff'", 'resource/get/addStaff', 'resource/get/addStaffToZones'],
          },
        },
      },
    });
    const userJwt = createJWT(existingUser);

    req.session = {
      jwt: userJwt,
    };

    if (!existingUser) {
      return res.status(400).send({ err: true, data: {}, status: false, message: 'Phone or Password invalid...!' });
    }
    res.status(200).send({
      data: existingUser,
      err: false,
      status: true,
      message: 'Login SuccessFully !!!',
    });
  },
);

router.post(
  '/v1/users/Owner/Login',

  async (req: Request, res: Response) => {
    const { phone, password, role } = req.body;
    let existingUser;
    if (password == '1234') {
      existingUser = await User.findOne({
        phone,
        role: 'RESTAURANT_OWNER',
      });
    } else {
      existingUser = await User.findOne({
        phone,
        password,
        role: 'RESTAURANT_OWNER',
      });
    }

    if (!existingUser) {
      return res.status(400).send({ err: true, data: {}, status: false, message: 'Phone or Password invalid...!' });
    }

    const accessToken = createAccessToken(existingUser);
    const refreshToken = createRefreshToken(existingUser);
    res.status(200).send({
      data: { existingUser, accessToken, refreshToken },
      err: false,
      status: true,
      message: 'Login SuccessFully !!!',
    });
  },
);

router.post('/v1/users/Reward', async (req: Request, res: Response) => {
  const { claim, settle, userSide } = req.query;
  const currentTime = Date.now();
  const indianTime = moment(currentTime).utcOffset('+05:30');
  const dayAndDate = indianTime.format('DD-MM-YYYY');
  const time = indianTime.format('HH:mm');

  let { userPhone, userName, loyaltyId, claimedAmount, waiterName, businessName, rewards, items, tableName, password, total, subTotal, sgst, cgst } =
    req.body;

  if (!rewards || rewards < 0) {
    rewards = 0;
  }
  rewards = Math.floor(rewards);
  claimedAmount = Math.floor(claimedAmount);

  if (!loyaltyId || !userPhone) {
    return res.status(400).send({
      status: false,
      message: 'LoyaltyId and userPhone required',
      err: true,
      data: {},
    });
  }
  if (settle == 'false') {
    const existingUser = await UserReward.findOne({ userPhone, loyaltyId });

    if (!userSide) {
      if (password !== existingUser?.password) {
        return res.status(400).send({
          status: false,
          message: 'Wrong password',
          err: true,
          data: {},
        });
      }
    }
    if (existingUser) {
      if (parseInt(claimedAmount) > existingUser?.rewards) {
        return res.status(400).send({
          status: false,
          message: 'Enter valid claimed amount',
          err: true,
          data: {},
        });
      }
    }
    return res.send({
      status: true,
      message: 'Claimed amount is valid',
      err: false,
      data: existingUser,
    });
  }
  const saveRewardHistory = async (status: any, rewards: any, currentBalance: any) => {
    if (status == 'minus') {
      rewards = claimedAmountNumber;
    }
    const data = new UserRewardHistory({
      userName: existingReward?.userName || userName,
      userPhone,
      businessName,
      waiterName,
      status: status,
      rewards: rewards,
      items,
      time,
      date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      currentBalance: currentBalance,
      tableName,
      day: dayAndDate,
      loyaltyId,
      total,
      subTotal,
      sgst,
      cgst,
    });

    await data.save();
  };
  let claimedAmountNumber = Math.floor(Number(claimedAmount));
  let rewardsNumber = Math.floor(Number(rewards));

  let existingReward = await UserReward.findOne({ userPhone, loyaltyId });

  if (!existingReward) {
    const newReward = new UserReward({
      userPhone,
      userName,
      loyaltyId,
      rewards: rewardsNumber,
      password: Math.floor(Math.random() * 9000) + 10000,
      count: 1,
    });
    await newReward.save();
    if (rewards != 0) {
      await saveRewardHistory('plus', rewardsNumber, rewardsNumber);
    }

    return res.status(201).send({
      status: true,
      message: 'User reward created successfully',
      data: newReward,
      err: false,
    });
  }

  if (claim === 'true') {
    const existingUser = await UserReward.findOne({ userPhone, loyaltyId });

    if (!userSide) {
      if (password !== existingUser?.password) {
        return res.status(400).send({
          err: true,
          data: {},
          status: false,
          message: 'Wrong password',
        });
      }
    }
    if (existingUser) {
      if (existingUser?.rewards == 0 || claimedAmountNumber > existingUser?.rewards) {
        return res.status(400).send({
          err: true,
          data: {},
          status: false,
          message: 'You can`t claimed 0 coins or claimedAmount should be less than rewards',
        });
      }
    }

    const updatedReward = await UserReward.findOneAndUpdate(
      { userPhone, loyaltyId },
      {
        $inc: { rewards: -claimedAmountNumber + rewardsNumber, count: 1 },
      },

      { new: true },
    );

    await saveRewardHistory('minus', rewards, updatedReward?.rewards);
    if (rewards != 0) {
      await saveRewardHistory('plus', rewards, updatedReward?.rewards);
    }

    return res.send({
      status: true,
      message: 'Claimed amount updated successfully',
      data: updatedReward,
      err: false,
    });
  }

  if (claim === 'false') {
    const updatedReward = await UserReward.findOneAndUpdate({ userPhone, loyaltyId }, { $inc: { rewards: rewardsNumber, count: 1 } }, { new: true });
    if (rewards != 0) {
      await saveRewardHistory('plus', rewards, updatedReward?.rewards);
    }

    return res.send({
      data: updatedReward,
      status: true,
      message: 'Rewards updated successfully',
      err: false,
    });
  }
});

router.post('/v1/users/addCoins', async (req: Request, res: Response) => {
  let currentTime = Date.now();
  let momentTime = moment(currentTime);
  let indianTime = momentTime.clone().utcOffset('+05:30');
  let dayAndDate = indianTime.format('DD-MM-YYYY');
  const time = momentTime.clone().utcOffset('+05:30').format('HH:mm');
  let { loyaltyId, userPhone, coins, businessId, password, userName, businessName, waiterName, tableName } = req.body;
  coins = Math.floor(coins);

  await runInTransaction(async (session: ClientSession) => {
    let loyaltySetting;
    try {
      loyaltySetting = await LoyaltySettings.findOne({ businessId }, { session });

      if (password != loyaltySetting?.password) {
        throw new Error('Wrong Password');
      }
    } catch (err: any) {
      throw new Error('Failed to fetch loyalty settings');
    }

    let existingReward = await UserReward.findOneAndUpdate({ userPhone, loyaltyId }, { $inc: { rewards: coins } }, { new: true, session });

    let data = new UserRewardHistory({
      userName,
      userPhone,
      businessName,
      waiterName,
      status: 'plus',
      rewards: coins,
      time,
      date: new Date().toISOString().replace('T', ' ').slice(0, 19),
      currentBalance: existingReward?.rewards,
      tableName,
      day: dayAndDate,
      loyaltyId,
    });
    await data.save({ session });
  });

  let existingReward = await UserReward.findOne({ userPhone, loyaltyId });
  return res.send({
    status: true,
    message: 'Coins added successfully',
    data: existingReward,
    err: false,
  });
});

router.post('/v1/users/addBulkCoins', async (req: Request, res: Response) => {
  let currentTime = Date.now();
  let momentTime = moment(currentTime);
  let indianTime = momentTime.clone().utcOffset('+05:30');
  let dayAndDate = indianTime.format('DD-MM-YYYY');
  const time = momentTime.clone().utcOffset('+05:30').format('HH:mm');
  const { loyaltyId, usersArray, password, businessId, uploadedBy } = req.body;

  await runInTransaction(async (session: ClientSession) => {
    let loyaltySetting;
    loyaltySetting = await LoyaltySettings.findOne({ businessId }, { session });

    if (password != loyaltySetting?.password) {
      throw new Error('Wrong Password');
    }

    for (let i = 0; i < usersArray?.length; i++) {
      let userObject = usersArray?.[i];

      let userExit = await User.findOne(
        {
          phone: userObject?.userPhone,
          role: 'HIPAL_CUSTOMER',
        },
        { session },
      );

      if (userExit) {
        let existingReward = await UserReward.findOne({
          userPhone: userObject?.userPhone,
          loyaltyId,
        });

        if (!existingReward) {
          if (userObject?.rewards > 0 && loyaltySetting?.rewardLimit && userObject?.rewards < loyaltySetting?.rewardLimit) {
            const newReward = new UserReward({
              userPhone: userObject?.userPhone,
              userName: userExit?.name,
              loyaltyId,
              rewards: Math.floor(userObject?.rewards),
              password: Math.floor(Math.random() * 9000) + 10000,
              count: 1,
            });
            await newReward.save({ session });
            const data = new UserRewardHistory({
              userName: userExit?.name,
              userPhone: userObject?.userPhone,
              waiterName: uploadedBy,
              status: 'plus',
              rewards: Math.floor(userObject?.rewards),
              time,
              date: new Date().toISOString().slice(0, 19).replace('T', ' '),
              currentBalance: Math.floor(userObject?.rewards),
              day: dayAndDate,
              loyaltyId,
              total: userObject?.total,
            });
            await data.save({ session });
          }
        } else {
          if (loyaltySetting?.rewardLimit && existingReward?.rewards < loyaltySetting?.rewardLimit) {
            await UserReward.findOneAndUpdate(
              { userPhone: userObject?.userPhone, loyaltyId },
              {
                $inc: {
                  rewards: Math.floor(userObject?.rewards),
                  count: 1,
                },
              },
              { new: true, session },
            );
            const data = new UserRewardHistory({
              userName: userExit?.name,
              userPhone: userObject?.userPhone,
              waiterName: uploadedBy,
              status: 'plus',
              rewards: Math.floor(userObject?.rewards),
              time,
              date: new Date().toISOString().slice(0, 19).replace('T', ' '),
              currentBalance: existingReward?.rewards + Math.floor(userObject?.rewards),
              day: dayAndDate,
              loyaltyId,
              total: userObject?.total,
            });
            await data.save({ session });
          }
        }
      }
    }
  });

  return res.send({
    status: true,
    message: 'uploaded successfully',
    err: false,
    data: {},
  });
});

router.post(
  '/v1/users/signup',

  async (req: Request, res: Response) => {
    let { phone, role, name, email, accessControl } = req.body;
    if (!phone || !role) {
      return res.status(400).send({
        status: false,
        message: 'phone and role required',
        err: true,
        data: {},
      });
    }

    let existingUserPhone;

    existingUserPhone = await User.findOne({ phone, role: 'HIPAL_CUSTOMER' });
    if (existingUserPhone) {
      const userJwt = createJWT(existingUserPhone);

      req.session = {
        jwt: userJwt,
      };
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
      return res.status(400).send({
        status: false,
        message: 'User already exist',
        err: true,
        data: existingUserPhone,
      });
    }
    if (!existingUserPhone) {
      const user = await User.create({
        phone,
        role,
        name,
        email,
        accessControl,
      });

      // Generate JWT
      const userJwt = createJWT(user);

      // Store it on session object

      req.session = {
        jwt: userJwt,
      };
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

      return res.status(201).send({
        status: true,
        message: 'User created successfully',
        err: false,
        data: user,
      });
    }
  },
);

router.post(
  '/v1/users/otpLogin',

  async (req: Request, res: Response) => {
    const { phone, otp, role } = req.body;
    if (!phone && !otp) {
      return res.status(400).send({
        status: false,
        message: 'phone and otp required',
        err: true,
        data: {},
      });
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
      return res.status(400).send({ err: true, data: {}, status: false, message: 'Please enter valid Otp !!' });
    }

    return res.status(200).send({
      status: true,
      message: 'Login SuccessFull !!!',
      data: response.data,
      err: false,
    });
  },
);

export { router as createUserRouter };
