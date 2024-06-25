import express, { Request, Response } from 'express';

import { UrlModel, User, UserReward, UserRewardHistory } from '@hi/db-models';
import axios from 'axios';

const router = express.Router();

import apicache from 'apicache';
let cache = apicache.middleware;

const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);

const endOfToday = new Date();
endOfToday.setHours(23, 59, 59, 999);

router.get(
  '/v1/users/Url/:urlCode',
  cache('1 day'),

  async (req: Request, res: Response) => {
    const { urlCode } = req.params;
    let result = await UrlModel.findOne({ urlCode: urlCode });
    if (!result) return res.status(404).send({ err: true, data: {}, status: false, message: 'Given urlcode not found !!' });

    res.status(302).redirect(result.longUrl);
    return res.status(500).send({ err: true, data: {}, status: false, message: 'Something is wrong' });
  },
);

router.get(
  '/v1/users/:id/getUser',

  async (req: Request, res: Response) => {
    const { userId } = req.query;
    let result = await User.findById(userId);
    if (!result) return res.status(404).send({ err: true, data: {}, status: false, message: 'Given user not found !!' });

    return res.send({
      data: result,
      status: true,
      message: 'User fetched successfully',
      err: false,
    });
  },
);
router.get('/v1/users', async (req: Request, res: Response) => {
  const { clientRole } = req.query;
  if (clientRole === 'user') {
    // const userId = req.currentUser?.id;
    // const existingUser = await User.findById(userId);
    // res.status(200).send({
    //   currentUser: existingUser,
    // });
  } else if (clientRole === 'admin') {
    // const userId = req.currentUser?.id;
    // const admin = await Admin.findById(userId);
    // res.status(200).send({
    //   currentUser: admin,
    // });
  }
});

router.get('/v1/users/:id/test', async (req: Request, res: Response) => {
  res.send({
    data: {},
    err: false,
    status: true,
    message: 'User fetched successfully',
  });
});

router.get(
  '/v1/users/get/All/Users',

  async (req: Request, res: Response) => {
    const { remove } = req.query || {};

    const existingUser = await User.find();
    if (remove) {
      let success = await User.deleteMany({
        phone: { $in: ['9588413799', '9000006420'] },
      });
      return res.send({
        message: 'Users deleted successfully',
        data: success,
        status: true,
        err: false,
      });
    }

    return res.send({
      data: existingUser,
      status: true,
      message: 'User fetched successfully',
      err: false,
    });
  },
);

router.get('/v1/users/resend/OTP', async (req: Request, res: Response) => {
  const { mobile } = req.query;

  const options = {
    method: 'GET',
    url: `https://control.msg91.com/api/v5/otp/retry?authkey=387796AmyGlDBq63b2d75aP1&retrytype=text&mobile=${mobile}`,
  };

  const response = await axios(options);
  if (response) {
    return res.send({
      message: 'OTP resent successfully',
      data: response.data,
      status: true,
      err: false,
    });
  } else {
    return res.send({
      message: 'Failed to resend OTP',
      status: false,
      err: true,
      data: response,
    });
  }
});

router.get(
  '/v1/users/:businessId',
  // currentUser,
  // requireAuth,
  async (req: Request, res: Response) => {
    const { businessId } = req.params;
    const existingUser = await User.find({
      'customRole.businessId': businessId,
    });

    res.status(200).send({
      data: existingUser,
      status: true,
      message: 'User fetched successfully',
      err: false,
    });
  },
);

router.get(
  '/v1/users/getOwner/list',

  async (req: Request, res: Response) => {
    const existingUser = await User.find({
      role: 'RESTAURANT_OWNER',
    });

    res.status(200).send({
      data: existingUser,
      status: true,
      message: 'User fetched successfully',
      err: false,
    });
  },
);

router.get('/v1/users/staff/Single', async (req: Request, res: Response) => {
  const { staffId, password, remove } = req.query;
  let user;
  if (password) {
    user = await User.findByIdAndUpdate(staffId, { password: password }, { new: true });
  }
  if (remove) {
    user = await User.findByIdAndDelete(staffId);
    return res.send({
      message: 'Staff deleted successfully',
    });
  }

  user = await User.findById(staffId);
  if (!user) {
    return res.status(400).send({
      message: 'User not found',
    });
  }

  res.status(200).send({
    data: user,
    status: true,
    message: 'User fetched successfully',
    err: false,
  });
});

//TODO: add validate req
router.get('/v1/users/:businessId/getUserReward', async (req: Request, res: Response) => {
  const { userPhone, loyaltyId } = req.query;

  if (!loyaltyId) {
    return res.status(400).send({
      message: 'Loyalty Id is required',
    });
  }
  const userExist = await User.findOne({
    phone: userPhone,
    role: 'HIPAL_CUSTOMER',
  });
  if (!userExist) {
    return res.status(404).send({
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

    let user = await data.save();
    return res.send(user);
  }

  return res.send({
    data: userRewards,
    status: true,
    message: 'User reward fetched successfully',
    err: false,
  });
});

router.get('/v1/users/:businessId/getUserRewardHistory', async (req: Request, res: Response) => {
  const { userPhone, loyaltyId, from, to } = req.query;
  var fields = '';
  var arr = [];
  if (req.query.fieldMasks) {
    const fieldMasks = req?.query?.fieldMasks as string;
    let validJson = fieldMasks.replace(/'/g, '"');
    arr = JSON.parse(validJson);
    fields = arr.join(' ');
  }
  let PAGE_SIZE = 20;
  let pageNumber: any = req?.query?.pageNumber || 1;
  const skip: number = (parseInt(pageNumber) - 1) * PAGE_SIZE;
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
      .select(arr?.length > 0 ? fields : '')
      .sort({ id: -1 })
      .skip(skip)
      .limit(PAGE_SIZE);

    let newObje =
      {
        totalReward,
        userName,
        userPhone,
        items: userRewards,
      } || {};

    return res.send({
      data: newObje,
      status: true,
      message: 'User reward fetched successfully',
      err: false,
    });
  }
  if (from && to) {
    if (from == to) {
      const userRewards = await UserRewardHistory.find({
        userPhone,
        loyaltyId,
      })
        .select(arr?.length > 0 ? fields : '')
        .sort({ id: -1 })
        .skip(skip)
        .limit(PAGE_SIZE);
      let newObje =
        {
          totalReward,
          userName,
          userPhone,
          items: userRewards,
        } || {};

      return res.send(newObje);
    }
    let fromDate = new Date(String(from).split('-').reverse().join('-'));
    let toDate = new Date(String(to).split('-').reverse().join('-') + ' 23:59:59');
    if (fromDate > toDate) {
      return res.status(400).send({
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
      .select(arr?.length > 0 ? fields : '')
      .sort({ id: -1 })
      .skip(skip)
      .limit(PAGE_SIZE);
    let newObje =
      {
        totalReward,
        userName,
        userPhone,
        items: filteredRewards,
      } || {};
    return res.send({
      data: newObje,
      status: true,
      message: 'User reward fetched successfully',
      err: false,
    });
  }
});

router.get('/v1/users/:businessId/RewardHistory', async (req: Request, res: Response) => {
  const { from, to, loyaltyId, findUser } = req.query;
  var fields = '';
  var arr = [];
  if (req.query.fieldMasks) {
    const fieldMasks = req?.query?.fieldMasks as string;
    let validJson = fieldMasks.replace(/'/g, '"');
    arr = JSON.parse(validJson);
    fields = arr.join(' ');
  }
  let PAGE_SIZE = 20;
  let pageNumber: any = req?.query?.pageNumber || 1;
  const skip: number = (parseInt(pageNumber) - 1) * PAGE_SIZE;
  if (findUser) {
    const userReward = await UserRewardHistory.findOne({
      loyaltyId,
      userPhone: findUser,
    });
    if (!userReward) {
      return res.status(404).send({
        data: {},
        status: false,
        err: true,
        message: 'User not found',
      });
    }

    return res.send({
      status: true,
      message: 'User reward fetched successfully',
      err: false,
      data: userReward,
    });
  }

  if (!from && !to) {
    const userRewards = await UserRewardHistory.find({ loyaltyId })
      .sort({
        _id: -1,
      })
      .skip(skip)
      .limit(PAGE_SIZE)
      .select(arr?.length > 0 ? fields : '');

    return res.send({
      data: userRewards,
      status: true,
      message: 'User reward fetched successfully',
      err: false,
    });
  }
  if (from && to) {
    if (from == to) {
      const userRewards = await UserRewardHistory.find({ loyaltyId })
        .sort({
          _id: -1,
        })
        .skip(skip)
        .limit(PAGE_SIZE)
        .select(arr?.length > 0 ? fields : '');

      return res.send({
        data: userRewards,
        status: true,
        message: 'User reward fetched successfully',
        err: false,
      });
    }
    let fromDate = new Date(String(from).split('-').reverse().join('-'));
    let toDate = new Date(String(to).split('-').reverse().join('-') + ' 23:59:59');
    if (fromDate > toDate) {
      return res.status(400).send({
        message: 'From date cannot be greater than to date',
        err: true,
        data: {},
        status: false,
      });
    }
    const filteredPayments = await UserRewardHistory.find({
      loyaltyId,
      date: {
        $gte: fromDate.toISOString(),
        $lte: toDate.toISOString(),
      },
    })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .select(arr?.length > 0 ? fields : '');

    return res.send({
      data: filteredPayments,
      status: true,
      message: 'User reward fetched successfully',
      err: false,
    });
  }
});

router.get('/v1/users/:businessId/getAllLoyaltyUsers', async (req: Request, res: Response) => {
  const { loyaltyId } = req.query;
  let PAGE_SIZE = 20;
  let pageNumber: any = req?.query?.pageNumber || 1;
  const skip: number = (parseInt(pageNumber) - 1) * PAGE_SIZE;

  const allUsers = await UserReward.find({
    loyaltyId,
    rewards: { $ne: 0 },
  })
    .sort({ _id: -1 })
    .skip(skip)
    .limit(PAGE_SIZE)
    .select('userPhone userName rewards id loyaltyId');

  return res.send({
    data: allUsers,
    status: true,
    message: 'User reward fetched successfully',
    err: false,
  });
});

router.get('/v1/users/:businessId/loyaltyDashboard', async (req: Request, res: Response) => {
  const { loyaltyId, from, to } = req.query;

  // Get all reward history at once and process in memory
  const rewardHistory = await UserRewardHistory.find({ loyaltyId });

  let coinsIssued = 0;
  let coinsUsed = 0;
  let repeatUsed = 0;

  rewardHistory.forEach((element) => {
    switch (element?.status) {
      case 'minus':
        coinsUsed += element?.rewards || 0;
        break;
      case 'plus':
        repeatUsed += element?.rewards || 0;
        coinsIssued += element?.rewards || 0;
        break;
    }
  });

  // Calculate usage percentage
  const usagePercentage = Number(((coinsUsed / coinsIssued) * 100).toFixed(2));

  let allUsers = await UserReward.find({ loyaltyId }).count();
  let newCustomer = allUsers;
  let coinsGivenOut = coinsIssued;
  let coinsGivenUsed = coinsUsed;

  if (from && to) {
    let fromDate = new Date(String(from).split('-').reverse().join('-'));
    let toDate = new Date(String(to).split('-').reverse().join('-') + ' 23:59:59');
    if (fromDate > toDate) {
      return res.status(400).send('From date cannot be greater than to date.');
    }
    const filteredRewards = await UserRewardHistory.find({
      loyaltyId,
      date: {
        $gte: fromDate.toISOString(),
        $lte: toDate.toISOString(),
      },
    });

    newCustomer = filteredRewards?.length;
    filteredRewards.forEach((element) => {
      switch (element?.status) {
        case 'minus':
          coinsGivenUsed += element?.rewards || 0;
          break;
        case 'plus':
          coinsGivenOut += element?.rewards || 0;
          break;
      }
    });
    if (filteredRewards?.length == 0) {
      coinsGivenOut = 0;
      coinsGivenUsed = 0;
    }
  }
  return res.send({
    message: 'Loyalty dashboard fetched successfully',
    err: false,
    status: true,
    data: {
      allUsers,
      coinsIssued,
      coinsUsed,
      repeatUsed,
      usagePercentage,
      coinsGivenOut,
      coinsGivenUsed,
      newCustomer,
    },
    allUsers,
    coinsIssued,
    coinsUsed,
    repeatUsed,
    usagePercentage,
    coinsGivenOut,
    coinsGivenUsed,
    newCustomer,
  });
});

const filterBasedOnDate = async (from: number, to: number, businessId: string) => {
  const paymentStats = await UserRewardHistory.aggregate([
    {
      $match: {
        businessId: businessId,

        reward_date: {
          $gte: from,
          $lte: to,
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$total' },
        count: { $sum: 1 },
      },
    },
  ]);

  const avgTicketValue = paymentStats.length > 0 ? Math.round(paymentStats[0].total / paymentStats[0].count) : 0;

  const obj = {
    avgTicketValue,
    visitPerDay: paymentStats.length > 0 ? paymentStats[0].count : 0,
  };

  return obj;
};

// Retrieves payments based on the specified date range and business ID.
router.get('/v1/users/:id/userDashboard', async (req: Request, res: Response) => {
  let { from, to } = req.query;
  let fromDate = Number(from);
  let toDate = Number(to);

  const businessId = req.query.businessId as string;
  if (!businessId) {
    return res.status(400).send({ err: true, status: false, data: {}, message: 'businessId is required' });
  }
  if (!from && !to) {
    const obj = await filterBasedOnDate(startOfToday.getTime(), endOfToday.getTime(), businessId);

    return res.send({
      data: obj,
      status: true,
      message: 'User dashboard fetched successfully',
      err: false,
    });
  }
  if (from && to) {
    if (fromDate > toDate) {
      return res.status(400).send({
        data: {},
        status: false,
        err: true,
        message: 'From date cannot be greater than to date',
      });
    }
    const obj = await filterBasedOnDate(fromDate, toDate, businessId);

    return res.send({
      data: obj,
      status: true,
      message: 'User dashboard fetched successfully',
      err: false,
    });
  }

  return res.status(400).send({
    err: true,
    data: {},
    status: false,
    message: 'Invalid query parameters',
  });
});

export { router as readUserRouter };
