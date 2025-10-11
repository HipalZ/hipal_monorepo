import type { UploadedFile } from "./types";

export async function prepareFilesForAI(
  files: UploadedFile[],
): Promise<Array<{ type: string; data: string; mimeType?: string }>> {
  const results: Array<{ type: string; data: string; mimeType?: string }> = [];

  for (const uploadedFile of files) {
    try {
      const prepared = await prepareFileForAI(uploadedFile);
      if (prepared) {
        results.push(prepared);
      }
    } catch (error) {
      console.error(
        `[v0] Failed to process file ${uploadedFile.file.name}:`,
        error,
      );
    }
  }

  return results;
}

async function prepareFileForAI(
  uploadedFile: UploadedFile,
): Promise<{ type: string; data: string; mimeType?: string } | null> {
  const { file, type } = uploadedFile;

  switch (type) {
    case "image":
      return await prepareImage(file);
    case "csv":
      return await prepareCSV(file);
    case "xlsx":
      return await prepareXLSX(file);
    case "pdf":
      return await preparePDF(file);
    case "doc":
    case "docx":
      return await prepareDOC(file);
    default:
      return null;
  }
}

async function prepareImage(
  file: File,
): Promise<{ type: string; data: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        // Extract base64 data without the data URL prefix
        const base64Data = reader.result.split(",")[1];
        resolve({
          type: "image",
          data: base64Data,
          mimeType: file.type,
        });
      } else {
        reject(new Error("Failed to read image"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function prepareCSV(file: File): Promise<{ type: string; data: string }> {
  const text = await file.text();
  return {
    type: "csv",
    data: text,
  };
}

async function prepareXLSX(
  file: File,
): Promise<{ type: string; data: string }> {
  // For now, read as text - in production, use xlsx library to parse properly
  const arrayBuffer = await file.arrayBuffer();
  const text = new TextDecoder().decode(arrayBuffer);
  return {
    type: "xlsx",
    data: `XLSX file content:\n${text.substring(0, 5000)}`, // Limit size
  };
}

async function preparePDF(file: File): Promise<{ type: string; data: string }> {
  // For now, return file info - in production, use pdf.js to extract text
  return {
    type: "pdf",
    data: `PDF file: ${file.name} (${(file.size / 1024).toFixed(
      2,
    )} KB)\nNote: PDF text extraction not yet implemented. Please use CSV or image format.`,
  };
}

async function prepareDOC(file: File): Promise<{ type: string; data: string }> {
  // For now, return file info - in production, use mammoth.js to extract text
  return {
    type: "doc",
    data: `DOC file: ${file.name} (${(file.size / 1024).toFixed(
      2,
    )} KB)\nNote: DOC text extraction not yet implemented. Please use CSV or image format.`,
  };
}
