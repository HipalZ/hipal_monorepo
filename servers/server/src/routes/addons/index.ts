import { AddOn, BusinessPosConfig, Dish } from '@hi/db-models';
import { type AddOnType, AddOnsAttrs, updateAddOnSchema } from '@hi/db-models/src/validators';
import { runInTransaction } from '@hi/utils';
import { zValidator } from '@hono/zod-validator';
// books.ts
import { Hono } from 'hono';
import type { ClientSession } from 'mongoose';
import { z } from 'zod';
import { respond } from '../../utils/response';
const addonRouter = new Hono()
  .post(
    '/',

    // authTokenValidator,
    // requireAuthorization([ClientRoles.OWNER, ClientRoles.CO_OWNER]),
    zValidator('json', AddOnsAttrs),

    async (c) => {
      //@ts-ignore
      return await runInTransaction(async (session: ClientSession) => {
        const requestData = (await c.req.json()) as AddOnType;

        const businessPosConfig = await BusinessPosConfig.findOne({
          businessId: requestData.businessId,
          isDeleted: false,
          active: true,
          posName: {
            $ne: 'HIPAL_Z',
          },
        });

        if (businessPosConfig) {
          return respond(c, "pos is enabled for this business you can't create addon", true, 400, {});
        }

        const hipalZPos = await BusinessPosConfig.findOne({
          businessId: requestData.businessId,
          isDeleted: false,
          active: true,
          posName: 'HIPAL_Z',
        });

        const alreadyExist = await AddOn.findOne({
          name: requestData.name,
          menuId: requestData.menuId,
        });

        if (alreadyExist) {
          return respond(c, 'Addon already exist', true, 409, {});
        }

        const addon = await AddOn.create({ ...requestData, pos: !!hipalZPos });

        if (!addon) return respond(c, 'failed', true, 400, addon);

        if (requestData.dishIds && requestData.dishIds.length > 0) {
          await Dish.updateMany({ _id: { $in: requestData.dishIds } }, { $push: { addOnIds: addon._id } });
        }

        return respond(c, 'addon created successFully !', false, 201, addon);
      });
    },
  )
  .put('/:id', zValidator('param', z.object({ id: z.string() })), zValidator('json', updateAddOnSchema), async (c) => {
    //@ts-ignore
    return await runInTransaction(async (session: ClientSession) => {
      const { id } = c.req.param();
      const requestData = await c.req.json();
      const { dishIds = [], removeDishIds = [] } = requestData;
      const businessPosConfig = await BusinessPosConfig.findOne({
        businessId: requestData.businessId,
        isDeleted: false,
        active: true,
        posName: {
          $ne: 'HIPAL_Z',
        },
      });

      if (businessPosConfig) {
        return respond(c, "pos is enabled for this business you can't update addon", true, 400, {});
      }

      const updatedAddOn = await AddOn.findByIdAndUpdate(
        id,
        {
          visibility: requestData.visibility,
          availability: requestData.availability,
          name: requestData.name,
          choices: requestData.choices,
          choiceType: requestData.choiceType,
          compulsory: requestData.compulsory,
          addOnMaxQuantity: requestData.addOnMaxQuantity,
        },
        {
          session,
        },
      );

      if (!updatedAddOn) return respond(c, 'failed', true, 400, {});

      if (removeDishIds.length > 0) {
        await AddOn.findByIdAndUpdate(
          id,

          {
            $pull: { dishIds: { $in: removeDishIds } },
          },
          { session },
        );

        await Dish.updateMany({ _id: { $in: removeDishIds } }, { $pull: { addOnIds: id } }, { session });
      }

      if (dishIds.length > 0) {
        await AddOn.findByIdAndUpdate(
          id,

          {
            $addToSet: { dishIds: { $each: dishIds } },
          },
          { session },
        );

        await Dish.updateMany({ _id: { $in: dishIds } }, { $addToSet: { addOnIds: id } }, { session });
      }

      return respond(c, 'success', false, 200, updatedAddOn);
    });
  })
  .delete('/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
    //@ts-ignore
    return await runInTransaction(async (session: ClientSession) => {
      const { id } = c.req.param();

      const fetchAddOn = await AddOn.findById(id);
      if (!fetchAddOn) {
        return respond(c, 'not found', true, 404, {});
      }

      const businessPosConfig = await BusinessPosConfig.findOne({
        businessId: fetchAddOn.businessId,
        isDeleted: false,
        active: true,
        posName: {
          $ne: 'HIPAL_Z',
        },
      });

      if (businessPosConfig) {
        return respond(c, "pos is enabled for this business you can't delete addon", true, 400, {});
      }

      const addon = await AddOn.findByIdAndUpdate(id, { isDeleted: true });

      if (!addon) return respond(c, 'not found', true, 404, {});

      await Dish.updateMany({ addOnIds: id }, { $pull: { addOnIds: id } }, { session });

      return respond(c, 'success', false, 200, addon);
    });
  })
  .get(
    '/:id',

    zValidator(
      'param',
      z.object({
        id: z.string(),
      }),
    ),

    async (c) => {
      const { id } = c.req.param();

      const addon = await AddOn.findOne({
        _id: id,
        isDeleted: false,
        active: true,
      });

      if (!addon) return respond(c, 'not found', true, 404, {});

      return respond(c, 'success', false, 200, addon);
    },
  )

  .get(
    '/',
    zValidator(
      'query',
      z.object({
        businessId: z.string(),
        menu: z.string().optional(),
        menuId: z.string().optional(),
      }),
    ),

    async (c) => {
      const { businessId, menu, menuId } = c.req.query();

      const query = {
        businessId,
        isDeleted: false,
        active: true,
        ...(menuId && { menuId }),
      };

      const addon = menu ? await AddOn.find(query).select('_id name choices availability visibility createdAt updatedAt') : await AddOn.find(query);

      return respond(c, 'success', false, 200, addon);
    },
  );

export default addonRouter;
