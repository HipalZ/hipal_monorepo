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
    try {
      const { urlCode } = req.params;
      let result = await UrlModel.findOne({ urlCode: urlCode });
      if (!result) return res.status(404).send({ status: false, message: 'Given urlcode not found !!' });

      return res.status(302).redirect(result.longUrl);
    } catch (error: any) {
      return res.status(500).send({ status: false, message: error.message });
    }
  },
);

router.get(
  '/v1/users',

  async (req: Request, res: Response) => {
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
  },
);

router.get(
  '/v1/users/:id/test',

  async (req: Request, res: Response) => {
    try {
      return res.send('Test');
    } catch (error: any) {
      return res.status(500).send({ status: false, message: error.message });
    }
  },
);

router.get(
  '/v1/users/get/All/Users',

  async (req: Request, res: Response) => {
    const { remove } = req.query || {};

    const existingUser = await User.find();
    if (remove) {
      let success = await User.deleteMany({
        phone: { $in: ['9588413799', '9000006420'] },
      });
      return res.send(success);
    }

    return res.send(existingUser);
  },
);

router.get('/v1/users/resend/OTP', async (req: Request, res: Response) => {
  const { mobile } = req.query;

  const options = {
    method: 'GET',
    url: `https://control.msg91.com/api/v5/otp/retry?authkey=387796AmyGlDBq63b2d75aP1&retrytype=text&mobile=${mobile}`,
  };

  const response = await axios(options);
  console.log('dddd', response);
  if (response) {
    return res.send(response.data);
  } else {
    return res.send(response);
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

    res.status(200).send(existingUser);
  },
);

router.get(
  '/v1/users/getOwner/list',

  async (req: Request, res: Response) => {
    const existingUser = await User.find({
      role: 'RESTAURANT_OWNER',
    });

    res.status(200).send(existingUser);
  },
);

router.get('/v1/users/staff/Single', async (req: Request, res: Response) => {
  try {
    const { staffId, password, remove } = req.query;
    let user;
    if (password) {
      user = await User.findByIdAndUpdate(staffId, { password: password }, { new: true });
    }
    if (remove) {
      user = await User.findByIdAndDelete(staffId);
      return res.send('Deleted');
    }

    user = await User.findById(staffId);
    if (!user) {
      return res.status(400).send('Not Found');
    }

    res.status(200).send(user);
  } catch (error: any) {
    console.log('err', error);
  }
});

router.get('/v1/users/:businessId/getUserReward', async (req: Request, res: Response) => {
  try {
    const { userPhone, loyaltyId } = req.query;

    if (!loyaltyId) {
      return res.status(400).send('loyaltyId Required');
    }
    const userExist = await User.findOne({
      phone: userPhone,
      role: 'HIPAL_CUSTOMER',
    });
    if (!userExist) {
      return res.status(404).send('Not found');
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

    return res.send(userRewards);
  } catch (error: any) {
    console.log('err', error);
  }
});

router.get('/v1/users/:businessId/getUserRewardHistory', async (req: Request, res: Response) => {
  try {
    const { userPhone, loyaltyId, from, to } = req.query;
    var fields = '';
    var arr = [];
    if (req.query.fieldMasks) {
      console.log('fieldMasks', req.query.fieldMasks);
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

      return res.send(newObje);
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
        return res.status(400).send('From date cannot be greater than to date');
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
      return res.send(newObje);
    }
  } catch (error: any) {
    console.log('err', error);
  }
});

router.get('/v1/users/:businessId/RewardHistory', async (req: Request, res: Response) => {
  try {
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
        return res.status(404).send('Not Found');
      }

      return res.send(userReward);
    }

    if (!from && !to) {
      const userRewards = await UserRewardHistory.find({ loyaltyId })
        .sort({
          _id: -1,
        })
        .skip(skip)
        .limit(PAGE_SIZE)
        .select(arr?.length > 0 ? fields : '');

      return res.send(userRewards);
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

        return res.send(userRewards);
      }
      let fromDate = new Date(String(from).split('-').reverse().join('-'));
      let toDate = new Date(String(to).split('-').reverse().join('-') + ' 23:59:59');
      if (fromDate > toDate) {
        return res.status(400).send('From date cannot be greater than to date .');
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

      return res.send(filteredPayments);
    }
  } catch (error: any) {
    console.log('err', error);
  }
});

router.get('/v1/users/:businessId/getAllLoyaltyUsers', async (req: Request, res: Response) => {
  try {
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

    return res.send(allUsers);
  } catch (error: any) {
    console.log('err', error);
  }
});

router.get('/v1/users/:businessId/loyaltyDashboard', async (req: Request, res: Response) => {
  try {
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
      allUsers,
      coinsIssued,
      coinsUsed,
      repeatUsed,
      usagePercentage,
      coinsGivenOut,
      coinsGivenUsed,
      newCustomer,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).send({ error: 'An error occurred while processing your request.' });
  }
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
router.get(
  '/v1/users/:id/userDashboard',

  async (req: Request, res: Response) => {
    try {
      let { from, to } = req.query;
      let fromDate = Number(from);
      let toDate = Number(to);

      const businessId = req.query.businessId as string;
      if (!businessId) {
        return res.status(400).send({ message: 'businessId is required' });
      }
      if (!from && !to) {
        const obj = await filterBasedOnDate(startOfToday.getTime(), endOfToday.getTime(), businessId);

        return res.send(obj);
      }
      if (from && to) {
        if (fromDate > toDate) {
          return res.status(400).send('From date cannot be greater than to date.');
        }
        const obj = await filterBasedOnDate(fromDate, toDate, businessId);

        return res.send(obj);
      }

      return res.status(400).send('Invalid query parameters');
    } catch (error: any) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
  },
);

export { router as readUserRouter };
