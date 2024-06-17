import { User, UserReward } from '@hi/db-models';
import { UserAttrs } from '@hi/db-models/src/validators';
import express, { Request, Response } from 'express';
import { z } from 'zod';
import { validateRequest } from 'zod-express-middleware';

const router = express.Router();
const UpdatedUserAttrs = UserAttrs.partial();
router.put(
  '/v1/users',
  validateRequest({
    body: UpdatedUserAttrs,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof UpdatedUserAttrs>>, res: Response) => {
    const { action } = req.query;

    if (action === 'logout') {
      req.session = null;
      res.send({});
    }
  },
);

router.put('/v1/users/:id/updateReward', async (req: Request, res: Response) => {
  const { loyaltyId, user } = req.query;

  if (!loyaltyId) {
    return res.status(400).send({ message: 'Loyalty ID is required.' });
  }

  try {
    // Find users with the specified loyaltyId
    const users = await UserReward.find({ loyaltyId: loyaltyId });

    if (user) {
      return res.status(200).send(users);
    }

    // Update each user's phone number if it's 12 digits long
    const updates = users.map(async (user) => {
      if (user.userPhone.length === 12) {
        user.userPhone = user.userPhone.substring(2); // Remove the first two digits
        await user.save(); // Save the updated user
      }
    });

    // Wait for all updates to complete
    await Promise.all(updates);

    res.status(200).send({ message: 'Users updated successfully.' });
  } catch (error) {
    console.error('Error updating users:', error);
    res.status(500).send({ message: 'Internal server error.' });
  }
});

router.put('/v1/users/:id/updateRole', async <T, K>(req: Request<T, K, z.infer<typeof UpdatedUserAttrs>>, res: Response) => {
  // Conceptual script to illustrate the intended operation
  const updateResult = await User.updateMany(
    {}, // This would update all users, adjust the filter as needed
    [
      {
        $set: {
          role: {
            $cond: {
              if: { $isArray: '$role' },
              then: '$role', // Keep the role as is if it's already an array
              else: ['$role'], // Wrap the role in an array if it's not
            },
          },
        },
      },
    ],
  );
  console.log('updateResult', updateResult);

  res.send(updateResult);
});

router.put(
  '/v1/users/:userId/updateUser',
  validateRequest({
    body: UpdatedUserAttrs,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof UpdatedUserAttrs>>, res: Response) => {
    try {
      const { userId } = req.params as { userId: string };
      const data = req.body || {};
      const userObject = await User.findById(userId);
      // return res.send(userObject);

      if (!userObject) return res.status(400).send({ status: false, message: 'User Not Found Given Id !!! ' });

      const updateUserObject = await User.findByIdAndUpdate(userId, data, {
        new: true,
      });
      return res.status(200).send({ status: true, data: updateUserObject });
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

export { router as updateUserRouter };
