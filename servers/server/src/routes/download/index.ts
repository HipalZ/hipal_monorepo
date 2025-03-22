import { OutLetInfo, Payment, PosBill } from "@hi/db-models";
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

      const outLetInfo = await OutLetInfo.findOne({
        businessId: payment.businessId,
      });

      if (!outLetInfo) {
        return c.json({ err: true, message: "Outlet info not found" }, 404);
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

      const doc = new PDFDocument({
        margin: 40,
        bufferPages: true,
        size: 'A4'
      });

      const formData = new FormData();
      formData.append("file", doc, {
        filename: `payment_${paymentId}.pdf`,
        contentType: "application/pdf",
      });

      let y = 50;

      // Invoice Title
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('TAX INVOICE', { align: 'center', y: y + 10 });

      y += 30;

      // Logo and Business Info
      if (outLetInfo.logoUrl) {
        try {
          const logoResponse = await axios.get(outLetInfo.logoUrl, {
            responseType: 'arraybuffer'
          });
          const logoBuffer = Buffer.from(logoResponse.data, 'binary');
          doc.image(logoBuffer, 50, y, {
            width: 60,
            height: 60,
            fit: [60, 60]
          });
        } catch (error) {
          console.error('Error loading logo:', error);
        }
      }

      // Business Information
      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .text(outLetInfo?.name?.toUpperCase(), 120, y + 10)
        .font('Helvetica')
        .fontSize(10)
        .text(outLetInfo.address, 120, y + 30, { width: 300 })
        .text(`Phone: ${outLetInfo.phone}`, 120, y + 55)
        .text(`FSSAI: ${outLetInfo.fssai}`, 120, y + 65)
        .text(`GSTIN: ${outLetInfo.gst}`, 120, y + 80);

      // Header Separator
      y += 100;
      // Left Column
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Invoice Number:', 50, y + 20)
        .font('Helvetica')
        .text(payment._id.toString().slice(-6).toUpperCase(), 130, y + 20)
        .font('Helvetica-Bold')
        .text('Date & Time:', 50, y + 40)
        .font('Helvetica')
        .text(new Date(payment.date).toLocaleString(), 130, y + 40)
        .font('Helvetica-Bold')
        .text('Order Type:', 50, y + 60)
        .font('Helvetica')
        .text(payment.orderType?.toUpperCase() || 'DINE-IN', 130, y + 60);

      // Right Column
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('Customer Name:', 300, y + 20)
        .font('Helvetica')
        .text(payment.userId?.name || 'Guest', 390, y + 20)
        .font('Helvetica-Bold')
        .text('Contact:', 300, y + 40)
        .font('Helvetica')
        .text(payment.userId?.phone || 'N/A', 390, y + 40)
        .font('Helvetica-Bold')
        .text('Table:', 300, y + 60)
        .font('Helvetica')
        .text(payment.tableName, 390, y + 60);

      // Items Section
      let posY = y + 100;
      if (posBill?.items?.length) {
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('ITEMS PURCHASED', 50, posY)
          .moveDown(0.5);

        // Table Header
        doc
          .fillColor('#444444')
          .font('Helvetica-Bold')
          .text('Item', 50, posY + 20)
          .text('Price', 300, posY + 20, { width: 100, align: 'right' })
          .text('Qty', 400, posY + 20, { width: 50, align: 'right' })
          .text('Total', 450, posY + 20, { width: 100, align: 'right' });

        posY += 40;
        doc.font('Helvetica').fontSize(12);

        posBill.items.forEach((item) => {
          const price = item?.dish?.price || 0;
          const qty = item?.dish?.quantity || 0;
          const total = price * qty;

          doc
            .text(item?.dish?.name || 'Unknown', 50, posY)
            .text(`${price.toFixed(2)}`, 300, posY, { width: 100, align: 'right' })
            .text(qty.toString(), 400, posY, { width: 50, align: 'right' })
            .text(`${total.toFixed(2)}`, 450, posY, { width: 100, align: 'right' })

          // Item separator
          doc
            .strokeColor('#333333')
            .lineWidth(1)
            .moveTo(50, posY + 10)
            .lineTo(550, posY + 10)
            .stroke();

          posY += 20;
        });
      } else {
        posY += 20;
      }

      // Summary Section
      posY += 30;
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('PAYMENT SUMMARY', 50, posY)
        .moveDown(0.5);

      const summary = [
        { label: 'Subtotal:', value: payment.initialSubTotal },
        { label: `Discount (${payment?.discountPercentage || 0}%):`, value: payment.discount },
        { label: `Tax (${outLetInfo.gstPercentage}%):`, value: payment.tax },
        { label: `Service Charge (${outLetInfo.serviceChargePercentage}%):`, value: payment.serviceCharge },
        { label: 'Total Amount:', value: payment.total },
      ];

      summary.forEach((item) => {
        doc
          .font('Helvetica-Bold')
          .text(item.label, 375, posY)
          .font('Helvetica')
          .text(`${item.value.toFixed(2)}`, 500, posY, { align: 'right' });
        posY += 20;
      });

      // Payment Methods Section
      posY += 30;
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('PAYMENT METHODS', 50, posY)
        .moveDown(0.5);

      if (payment.splitModes?.length) {
        payment.splitModes.forEach((mode) => {
          posY += 20;
          doc
            .font('Helvetica-Bold')
            .text(`${mode.name.toUpperCase()}:`, 50, posY)
            .font('Helvetica')
            .text(`${mode.amount.toFixed(2)}`, 500, posY, { align: 'right' });
        });
      } else {
        posY += 20;
        doc.font('Helvetica').text(`Payment Mode: ${payment.mode}`, 50, posY);
      }

      // Footer Section
      posY = 700;
      doc
        .fontSize(9)
        .text("This is a computer-generated invoice. No signature required.", 50, posY + 70, { align: 'center' });

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