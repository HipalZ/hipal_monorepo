import { Business, CheckInQr, UrlModel } from "@hi/db-models";
import {
  checkInQrValidator,
  updateCheckInQrValidator,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { z } from "zod";
import { respond } from "../../utils/response";

const checkInQrRouter = new Hono()

  .post("/", zValidator("json", checkInQrValidator), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const { businessId, name } = await c.req.json();
      const updateQrName = name.trim().toLowerCase();
      const qrAlreadyExists = await CheckInQr.findOne({
        businessId,
        name: updateQrName,
        isDeleted: false,
      });

      if (qrAlreadyExists) {
        return respond(c, "QR already exists", true, 409, {});
      }

      const businessInfo = await Business.findById(businessId);

      const longUrl = `http://localhost:3000/${businessInfo?.customLink}/explore?tag=${updateQrName}`;

      const uniqueOrderId = nanoid(5);
      let findUrl = await UrlModel.findOne({ longUrl });

      if (!findUrl) {
        findUrl = await UrlModel.create({
          longUrl: longUrl,
          shortUrl: `http://localhost:4500/surl/check_in/${uniqueOrderId}`,
          urlCode: uniqueOrderId,
          businessId: businessId,
          shortUrlType: "CHECK_IN",
        });
      }
      const newQr = new CheckInQr({
        businessId,
        name: updateQrName,
        downloadLink: findUrl.shortUrl,
        date: Date.now(),
      });
      await newQr.save({ session });

      return respond(c, "QR created successfully", false, 201, {
        qrId: newQr._id,
      });
    });
  })
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(2).max(50),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.query();

      const checkInQrs = await CheckInQr.find({
        businessId,
        isDeleted: false,
      }).lean();

      return respond(
        c,
        "Check-in QRs fetched successfully",
        false,
        200,
        checkInQrs,
      );
    },
  )
  .get(
    "/:qrId",
    zValidator(
      "param",
      z.object({
        qrId: z.string().min(2).max(50),
      }),
    ),

    async (c) => {
      const { qrId } = c.req.param();

      const checkInQr = await CheckInQr.findOne({
        _id: qrId,
        isDeleted: false,
      }).lean();

      if (!checkInQr) {
        return respond(c, "Check-in QR not found", true, 404, {});
      }

      return respond(
        c,
        "Check-in QR fetched successfully",
        false,
        200,
        checkInQr,
      );
    },
  )
  .delete(
    "/",
    zValidator(
      "json",
      z.object({
        qrId: z.string().min(2).max(50),
      }),
    ),

    async (c) => {
      const { qrId } = await c.req.json();

      const checkInQr = await CheckInQr.findByIdAndUpdate(
        qrId,
        { isDeleted: true },
        { new: true },
      ).lean();

      if (!checkInQr) {
        return respond(c, "Check-in QR not found", true, 404, {});
      }

      return respond(c, "Check-in QR deleted successfully", false, 200, {});
    },
  )
  .put(
    "/:qrId",
    zValidator(
      "param",
      z.object({
        qrId: z.string().min(2).max(50),
      }),
    ),
    zValidator("json", updateCheckInQrValidator),
    async (c) => {
      const { qrId } = c.req.param();
      const { name } = await c.req.json();

      const updatedQr = await CheckInQr.findByIdAndUpdate(
        qrId,
        { name },
        { new: true },
      ).lean();

      if (!updatedQr) {
        return respond(c, "Check-in QR not found", true, 404, {});
      }

      return respond(c, "Check-in QR updated successfully", false, 200, {
        _id: updatedQr._id,
      });
    },
  );

export default checkInQrRouter;
