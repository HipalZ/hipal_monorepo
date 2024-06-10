import { User } from '@hi/db-models';
import { UserAttrs } from '@hi/db-models/src/validators';
import express, { Request, Response } from 'express';
import { z } from 'zod';
import { validateRequest } from 'zod-express-middleware';

const router = express.Router();
const UpdatedUserAttrs = UserAttrs.partial() 
router.put('/v1/users', 
  validateRequest({
    body: UpdatedUserAttrs,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof UpdatedUserAttrs>>, res: Response) => {
  const { action } = req.query;

  if (action === 'logout') {
    req.session = null;
    res.send({});
  }
});

router.put('/v1/users/:userId/updateUser', 
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
});

export { router as updateUserRouter };
