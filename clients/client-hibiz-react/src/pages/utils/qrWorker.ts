import * as QRCode from 'qrcode';
// Define types for worker communication
export type QRWorkerRequest = {
  table: {
    tableLink: string;
    name: string;
    jobId: string;
  };
};

export type QRWorkerResponse = {
  jobId: string;
  blobUrl?: string;
  error?: string;
};

/* ------------------------------------------------------------------
   1.  PAGE SIZE — keep these two numbers if you already sized prints
   ------------------------------------------------------------------ */
const PAGE_W = 240;          // full canvas width   (px)
const PAGE_H = 240;          // full canvas height  (px)

/* ------------------------------------------------------------------
   2.  DERIVED GEOMETRY
   ------------------------------------------------------------------ */
const QR_RATIO  = 0.90;                               // 90 % for QR
const QR_SIZE   = Math.min(PAGE_W, PAGE_H * QR_RATIO);
const TEXT_H    = PAGE_H - QR_SIZE;                   // remaining 10 %
const TEXT_Y    = QR_SIZE + TEXT_H / 2;               // vertical centre of label
const FONT_PX   = Math.round(TEXT_H * 0.55);          // leave margins above/below

/* ------------------------------------------------------------------
   3.  SHARED COMPOSITION CANVAS
   ------------------------------------------------------------------ */
const pageCanvas = new OffscreenCanvas(PAGE_W, PAGE_H);
const ctx        = pageCanvas.getContext('2d')!;

self.onmessage = async (evt: MessageEvent<QRWorkerRequest>) => {
  const { table }          = evt.data;
  const { jobId, tableLink, name } = table;

  try {
    /* --------------------------------------------------------------
       4.  GENERATE QR INTO ITS OWN OFFSCREEN CANVAS
       -------------------------------------------------------------- */
    const qrCanvas = new OffscreenCanvas(QR_SIZE, QR_SIZE);
    await QRCode.toCanvas(qrCanvas, tableLink, {
      errorCorrectionLevel: 'H',
      margin: 1,
    });

    /* --------------------------------------------------------------
       5.  COMPOSITE PAGE =  QR (90 %)  +  LABEL (10 %)
       -------------------------------------------------------------- */
    // white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, PAGE_W, PAGE_H);

    // centred QR
    const qrX = (PAGE_W - QR_SIZE) / 2;
    ctx.drawImage(qrCanvas, qrX, 0);

    // label text
    ctx.fillStyle = 'black';
    ctx.font      = `bold ${FONT_PX}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name.toUpperCase(), PAGE_W / 2, TEXT_Y);

    /* --------------------------------------------------------------
       6.  RETURN PNG BLOB URL
       -------------------------------------------------------------- */
    const blob   = await pageCanvas.convertToBlob({ type: 'image/png' });
    const blobUrl = URL.createObjectURL(blob);
    const ok: QRWorkerResponse = { jobId, blobUrl };
    self.postMessage(ok);

  } catch (e: any) {
    const fail: QRWorkerResponse = {
      jobId,
      error: e?.message ?? 'QR generation failed',
    };
    self.postMessage(fail);
  }
};

