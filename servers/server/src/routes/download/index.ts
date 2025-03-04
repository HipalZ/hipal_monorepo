import { Payment, PosBill } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
import FormData from "form-data";
import { Hono } from "hono";
import PDFDocument from "pdfkit";
import { z } from "zod";

const downloadRouter = new Hono().get(
  "/download_bill_pdf/:paymentId",
  zValidator(
    "param",
    z.object({
      paymentId: z.string(),
    }),
  ),
  async (c) => {
    try {
      const { paymentId } = c.req.valid("param");
      const payment = await Payment.findById(paymentId).populate("userId");
      if (!payment) {
        return c.json({ err: true, message: "Payment not found" }, 404);
      }

      const posBill = await PosBill.findOne({
        billRequestId: payment?.posBillRequestId,
      });

      if (payment.downloadUrl) {
        return c.json({
          err: false,
          data: { url: payment.downloadUrl },
          message: "PDF already generated",
        });
      }

      const doc = new PDFDocument({ margin: 50 });
      const formData = new FormData();
      formData.append("file", doc, {
        filename: `payment_${paymentId}.pdf`,
        contentType: "application/pdf",
      });

      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("Payment Receipt", { align: "center" });
      doc.moveDown(1);

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Payment Details", { underline: true });
      doc.moveDown(0.5);

      doc.font("Helvetica-Bold");
      doc
        .text(`Payment ID: `, { continued: true })
        .font("Helvetica")
        .text(payment._id.toString().slice(-6));
      doc
        .font("Helvetica-Bold")
        .text(`Customer Name: `, { continued: true })
        .font("Helvetica")
        .text(payment.userId?.name || "Unknown");
      doc
        .font("Helvetica-Bold")
        .text(`Phone: `, { continued: true })
        .font("Helvetica")
        .text(payment.userId?.phone || "N/A");
      doc
        .font("Helvetica-Bold")
        .text(`Payment Mode: `, { continued: true })
        .font("Helvetica")
        .text(payment.paymentMode.toUpperCase());
      doc
        .font("Helvetica-Bold")
        .text(`Table: `, { continued: true })
        .font("Helvetica")
        .text(payment.tableName);
      doc
        .font("Helvetica-Bold")
        .text(`Created At: `, { continued: true })
        .font("Helvetica")
        .text(new Date(payment.date).toLocaleString());
      doc.moveDown(1);

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Items Purchased", { underline: true });
      doc.moveDown(0.5);

      doc.font("Helvetica-Bold");
      doc.text("Item       Price       Qty");
      doc.moveDown(0.5);

      doc.font("Helvetica");
      if (
        !posBill ||
        !Array.isArray(posBill.items) ||
        posBill.items.length === 0
      ) {
        doc.text("No items found.");
      } else {
        posBill.items.forEach((item) => {
          doc.text(
            `${item?.dish?.name || "Unknown"}   ${item?.dish?.price || 0}   ${
              item?.dish?.quantity || 0
            }`,
          );
        });
      }
      doc.moveDown(1);

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Payment Summary", { underline: true });
      doc.moveDown(0.5);
      doc
        .font("Helvetica-Bold")
        .text("Subtotal: ", { continued: true })
        .font("Helvetica")
        .text(`${payment.initialSubTotal}`);
      doc
        .font("Helvetica-Bold")
        .text("Discount: ", { continued: true })
        .font("Helvetica")
        .text(`${payment.discount}`);
      doc
        .font("Helvetica-Bold")
        .text("Total: ", { continued: true })
        .font("Helvetica")
        .text(`${payment.initialTotal}`);
      doc
        .font("Helvetica-Bold")
        .text("Tax: ", { continued: true })
        .font("Helvetica")
        .text(`${payment.tax}`);
      doc
        .font("Helvetica-Bold")
        .text("Service Charge: ", { continued: true })
        .font("Helvetica")
        .text(`${payment.serviceCharge}`);
      doc
        .font("Helvetica-Bold")
        .text("Amount Paid: ", { continued: true })
        .font("Helvetica")
        .text(`${payment.total}`);
      doc.moveDown(1);

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Split Payment Modes", { underline: true });
      doc.moveDown(0.5);
      if (!payment.splitModes || payment.splitModes.length === 0) {
        doc.text("No split payment modes.");
      } else {
        payment.splitModes.forEach((mode) => {
          doc
            .font("Helvetica-Bold")
            .text(`${mode?.name?.toUpperCase()}: `, { continued: true })
            .font("Helvetica")
            .text(`${mode.amount}`);
        });
      }
      doc.end();

      const uploadResponse = await axios.post(
        "https://storage.test.hipalz.com/upload",
        formData,
        { headers: formData.getHeaders() },
      );

      if (uploadResponse.data.url) {
        await Payment.findByIdAndUpdate(paymentId, {
          downloadUrl: uploadResponse.data.url,
        });
      }

      return c.json({
        err: false,
        data: { url: uploadResponse.data.url },
        message: "PDF generated and uploaded successfully",
      });
    } catch (error) {
      console.error("Error generating payment receipt:", error);
      return c.json({ err: true, message: "Internal Server Error" }, 500);
    }
  },
);

export default downloadRouter;
