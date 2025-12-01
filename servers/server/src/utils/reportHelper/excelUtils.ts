// src/utils/reportHelper/excelUtils.ts
import type { Worksheet } from "exceljs";

export const addBoldHeaderRow = (
  sheet: Worksheet,
  headers: (string | number)[],
) => {
  const row = sheet.addRow(headers);
  row.eachCell((cell) => {
    cell.font = { ...(cell.font || {}), bold: true };
  });
  return row;
};

export const addKeyValueRow = (
  sheet: Worksheet,
  key: string,
  value: string | number,
) => {
  const row = sheet.addRow([key, value]);
  const keyCell = row.getCell(1);
  keyCell.font = { ...(keyCell.font || {}), bold: true };
  return row;
};

export const addSectionTitleRow = (sheet: Worksheet, title: string) => {
  const row = sheet.addRow([title]);
  row.getCell(1).font = {
    ...(row.getCell(1).font || {}),
    bold: true,
  };
  return row;
};
export const autoFitColumns = (sheet: Worksheet) => {
  if (!sheet.columns) return;

  for (const col of sheet.columns) {
    if (!col || !col.eachCell) continue;

    let maxLength = 10;

    col.eachCell({ includeEmpty: true }, (cell) => {
      const v = cell.value;
      const text =
        v == null
          ? ""
          : typeof v === "object" && "richText" in v
            ? (v as any).richText.map((t: any) => t.text).join("")
            : String(v);

      if (text.length > maxLength) maxLength = text.length;
    });

    col.width = Math.min(Math.max(maxLength + 2, 10), 60);
  }
};
