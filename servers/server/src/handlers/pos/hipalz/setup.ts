import {
  AddOn,
  BusinessPosConfig,
  Category,
  Dish,
  Menu,
  OutLetInfo,
  Table,
  Zone,
} from "@hi/db-models";
import type { ClientSession } from "mongoose";
import { nanoid } from "nanoid";
import { POS_NAME } from "../../../constants/posName";

async function hipalzPosSetupHandler(payload: {
  businessId: string;
  restId: string;
  orderVerificationType: string;
  posId: string;
  session: ClientSession;
}) {
  try {
    const { businessId, restId, orderVerificationType, posId, session } =
      payload;

    const existingConfig = await BusinessPosConfig.findOne({
      businessId,
      isDeleted: false,
      active: true,
    }).session(session);

    if (existingConfig) {
      return {
        success: false,
        message: "POS already configured for this business",
      };
    }

    const isMenuExists = await Menu.exists({
      businessId,
      isDeleted: false,
      isActive: true,
    }).session(session);

    if (isMenuExists) {
      const modelsToUpdate = [Dish, Category, AddOn, Zone, Table];
      const updateOps = modelsToUpdate.map((Model) =>
        Model.updateMany(
          { businessId, isDeleted: false },
          { $set: { pos: true, active: true } },
          { session },
        ),
      );
      await Promise.all(updateOps);
    }

    const businessPosConfig = new BusinessPosConfig({
      businessId,
      branchId: businessId,
      orderMode: "WITH_ORDER",
      accessKey: nanoid(10),
      secretKey: nanoid(10),
      authToken: nanoid(15),
      restId,
      orderVerificationType,
      posName: POS_NAME.HIPAL_Z,
      posId,
      isDeleted: false,
      active: true,
      date: new Date(),
    });

    await businessPosConfig.save({ session });

    await OutLetInfo.updateOne(
      { businessId },
      {
        $set: {
          isPosEnabled: true,
          isHipalzPos: true,
          shareCart: false,
        },
      },
      { session },
    );

    return true;
  } catch (error) {
    throw new Error((error as Error).message || "Internal error in POS setup");
  }
}

async function hipalzPosSyncMenuHandler(payload: {
  businessId: string;
  restId: string;
  orderVerificationType: string;
  posId: string;
  session: ClientSession;
}) {
  try {
    const { businessId, restId, orderVerificationType, posId, session } =
      payload;
    // 1️⃣ Check if POS already configured
    const existingConfig = await BusinessPosConfig.findOne({
      businessId,
      isDeleted: false,
      active: true,
    }).session(session);

    if (existingConfig) {
      return {
        success: false,
        message: "POS already configured for this business",
      };
    }

    const isMenuExists = await Menu.exists({
      businessId,
      isDeleted: false,
      isActive: true,
    }).session(session);

    if (isMenuExists) {
      const modelsToUpdate = [Dish, Category, AddOn, Zone, Table];
      const updateOps = modelsToUpdate.map((Model) =>
        Model.updateMany(
          { businessId, isDeleted: false },
          { $set: { pos: true, active: true } },
          { session },
        ),
      );
      await Promise.all(updateOps);
    }

    const businessPosConfig = new BusinessPosConfig({
      businessId,
      branchId: businessId,
      orderMode: "WITH_ORDER",
      accessKey: nanoid(10),
      secretKey: nanoid(10),
      authToken: nanoid(15),
      restId,
      orderVerificationType,
      posName: POS_NAME.HIPAL_Z,
      posId,
      isDeleted: false,
      active: true,
      date: new Date(),
    });

    await businessPosConfig.save({ session });

    await OutLetInfo.updateOne(
      { businessId },
      {
        $set: {
          isPosEnabled: true,
          isHipalzPos: true,
          shareCart: false,
        },
      },
      { session },
    );

    return true;
  } catch (error) {
    throw new Error((error as Error).message || "Internal error in POS setup");
  }
}

export { hipalzPosSetupHandler, hipalzPosSyncMenuHandler };
