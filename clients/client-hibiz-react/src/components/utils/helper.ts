import QRCode from "qrcode";
import * as XLSX from "xlsx";
import type { BillsData } from "../types/businessData";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "@/axios";
import veg from "@/assets/dishTypes/veg.png";
import nonVeg from "@/assets/dishTypes/non_veg.png";
import egg from "@/assets/dishTypes/egg.png";
import vegan from "@/assets/dishTypes/vegan.png";
import { DishTypeEnum } from "@hi/db-models/src/validators";
import useMenuPageStore, {
  ImagePreviews,
  SetImageFilesFunction,
  SetImagePreviewsFunction,
} from "../store/useMenuStorage";
import { cropImage } from "../cropper";

export function convertToCSV(data: BillsData) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return "";
  }

  const headers = [
    "businessName",
    "customerName",
    "customerPhone",
    "paymentDate",
    "discount",
    "paymentMode",
    "serviceCharge",
    "sgst",
    "cgst",
    "subTotal",
    "tableName",
    "tips",
    "total",
    "waiterName",
  ];

  let csvContent = headers.join(",") + "\r\n";

  data.forEach((bill: any) => {
    const row = headers
      .map((fieldName) => {
        let field = bill[fieldName];
        if (field === undefined || field === null) {
          return "";
        }
        if (typeof field === "object") {
          return JSON.stringify(field);
        }
        if (field.toString().includes(",")) {
          field = `"${field}"`;
        }
        return field;
      })
      .join(",");

    csvContent += row + "\r\n";
  });
  return csvContent;
}

export function downloadCSV(billsData: BillsData | null) {
  if (billsData) {
    const csv = convertToCSV(billsData);
    if (csv) {
      const blob = new Blob([csv], { type: "text/csv" });
      const link = document.createElement("a");

      link.href = URL.createObjectURL(blob);
      link.download = "bills_data.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

export async function storeImageFiles(image: File) {
  if (image === undefined) return;
  const reader = new FileReader();
  reader?.readAsDataURL(image);
  const imageId = crypto.randomUUID();
  await new Promise((resolve, reject) => {
    reader.onload = () => {
      resolve(reader.result);
    };
  });
  if (reader.result) {
    const blobBin = atob(reader.result.toString().split(",")[1]);
    const array = [];
    for (let i = 0; i < blobBin.length; i++) {
      array.push(blobBin.charCodeAt(i));
    }
    const file = new Blob([new Uint8Array(array)], {
      type: image.type,
    });
    const formdata = new FormData();
    formdata.append("fileData", file);
    formdata.append("fileName", `${imageId}`);
    formdata.append("bucketName", "assets");
    try {
      const res = await axios.post(
        `https://api.hipal.life/v1/storage`,
        formdata,
      );
      console.log("res", res);
      return `https://storage.hipal.life/minio/assets/${imageId}`;
    } catch (error) {
      console.log(error);
    }
  }
}

export async function storeImageAfterSave(
  image: File,
  imagePreview: string | null,
) {
  if (!image) return;
  const imageId = crypto.randomUUID();
  if (imagePreview) {
    const blobBin = atob(imagePreview.toString().split(",")[1]);
    const array = [];
    for (let i = 0; i < blobBin.length; i++) {
      array.push(blobBin.charCodeAt(i));
    }
    const file = new Blob([new Uint8Array(array)], {
      type: image.type,
    });
    const formdata = new FormData();
    formdata.append("fileData", file);
    formdata.append("fileName", `${imageId}`);
    formdata.append("bucketName", "assets");
    try {
      await axios.post("https://api.hipal.life/v1/storage", formdata);
      return `https://storage.hipal.life/minio/assets/${imageId}`;
    } catch (error) {
      console.log(error);
    }
  }
}

export const getSalesApi = async (businessId: string) => {
  const url = `https://dev.api.hipal.life/v1/payments?id=${businessId}`;

  try {
    const res = await axios.get(url);
    return res.data.data;
  } catch (error) {
    console.error("Error fetching sales report:", error);
  }
};

export function validPortionCheck(array: Array<Record<string, any>>) {
  if (!Array.isArray(array) || array.length === 0) {
    return false;
  }
  return array.every(
    (item) =>
      item?.hasOwnProperty("price") &&
      item?.price !== "" &&
      item?.hasOwnProperty("name") &&
      item?.name !== "",
  );
}

export const exportToExcel = (salesData: any) => {
  const wb = XLSX.utils.book_new(); // New workbook
  const ws_data = [];

  // Add Gross Sale
  ws_data.push(["Gross Sale"]);
  ws_data.push(["", salesData.grossSale]);
  ws_data.push([]); // Empty row for spacing

  // Function to add labeled data to the worksheet
  const addLabeledData = (label, data, headers) => {
    ws_data.push([label]); // Section label
    ws_data.push(headers); // Column headers
    data.forEach((row: any) => ws_data.push(Object.values(row))); // Data rows
    ws_data.push([]); // Empty row for spacing
  };

  // Add each section of sales data
  addLabeledData("Total Sale", salesData.totalSale, [
    "Mode",
    "Amount",
    "Commission Percent",
    "Total Commission Sale",
  ]);
  addLabeledData("Charges", salesData.charges, [
    "Mode",
    "Amount",
    "Commission Percent",
    "Total Commission Sale",
  ]);
  addLabeledData("Discounts", salesData.discounts, [
    "Mode",
    "Amount",
    "Commission Percent",
    "Total Commission Sale",
  ]);
  addLabeledData(
    "Tips",
    salesData.tips.map((tip: any) => ({
      waiterName: tip.waiterName,
      tips: tip.tips,
    })),
    ["waiterName", "tips"],
  );
  addLabeledData(
    "Dues",
    salesData.dues.map((due: any) => ({
      customerName: due.customerName,
      dues: due.dues,
    })),
    ["customerName", "dues"],
  );

  // Create the worksheet from the ws_data array
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(wb, ws, "Sales Data");

  // Write the workbook and initiate download
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
  const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Sales_Report.xlsx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

function s2ab(s: any) {
  const buffer = new ArrayBuffer(s.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < s.length; i++) {
    view[i] = s.charCodeAt(i) & 0xff; // convert to octet
  }
  return buffer;
}

export function isElementInView(element: any) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return (
    rect.left >= 0 &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

export const generateQRCode = async (link: string) => {
  try {
    const url = await QRCode.toDataURL(link);
    return url;
  } catch (error) {
    console.error(error);
    return "";
  }
};

export async function downloadURI(
  id: string,
  name: string,
  zoneId: string,
  businessId: string,
) {
  const longUrl = `https://pro.hipal.life/r/${businessId}/explore?tableId=${id}&name=${name}&zoneId=${zoneId}`;
  const payload = {
    longUrl: longUrl,
  };
  console.log(longUrl);

  try {
    const response = await axios.post(
      "https://api.hipal.life/v1/users/usrShortner",
      payload,
      {
        withCredentials: true,
      },
    );
    const uri = await generateQRCode(response.data.shortUrl);
    const link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error(error);
  }
}

export const zoneType = [
  {
    id: 0,
    type: "select a zone type",
  },
  {
    id: 1,
    type: "Dine In",
  },
  {
    id: 2,
    type: "Take Away",
  },
  {
    id: 3,
    type: "Delivery",
  },
];

//apply cn
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export function timestampToDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const day = date.getDate();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = monthNames[date.getMonth()];

  // Determine the day suffix
  let daySuffix;
  switch (day) {
    case 1:
    case 21:
    case 31:
      daySuffix = "st";
      break;
    case 2:
    case 22:
      daySuffix = "nd";
      break;
    case 3:
    case 23:
      daySuffix = "rd";
      break;
    default:
      daySuffix = "th";
  }

  // Convert to 12-hour format
  const hourFormatted = hours % 12 || 12; // Converts 0 to 12 for midnight
  const minuteFormatted = minutes < 10 ? `0${minutes}` : minutes;
  const amPm = hours < 12 ? "AM" : "PM";

  return `${day}${daySuffix} ${month} ${hourFormatted}:${minuteFormatted} ${amPm}`;
}

export function filterPayload(
  payload: Record<string, any>,
): Record<string, any> {
  const filteredPayload = Object.fromEntries(
    Object.entries(payload).filter(
      ([_, value]) =>
        value !== null &&
        value !== "" &&
        value !== undefined &&
        !(Array.isArray(value) && value.length === 0),
    ),
  );
  return filteredPayload;
}

export const foodTypes = [
  { name: DishTypeEnum[0], icon: veg },
  { name: DishTypeEnum[1], icon: nonVeg },
  { name: DishTypeEnum[2], icon: egg },
  { name: DishTypeEnum[3], icon: vegan },
];

const MAX_WIDTH = 500;
const MAX_HEIGHT = 500;
const MIME_TYPE = "image/jpeg";
const QUALITY = 0.9;

export const compressArrayOfImages = (
  file: File,
  type: string,
  setImageFiles: SetImageFilesFunction,
  setImagePreviews: SetImagePreviewsFunction,
) => {
  const blobURL = URL.createObjectURL(file);
  const img = new Image();
  img.src = blobURL;
  img.onerror = () => {
    URL.revokeObjectURL(img.src);
    console.log("Cannot load image");
  };
  img.onload = () => {
    URL.revokeObjectURL(img.src);
    const [newWidth, newHeight] = calculateSize(img, MAX_WIDTH, MAX_HEIGHT);
    const canvas = document.createElement("canvas");
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: MIME_TYPE,
              lastModified: Date.now(),
            });
            setImageFiles((prev) => ({ ...prev, [type]: compressedFile }));
            const reader = new FileReader();
            reader.onload = () => {
              if (reader.result) {
                setImagePreviews((prev) => ({
                  ...prev,
                  [type]: reader.result,
                }));
              }
            };
            reader.readAsDataURL(compressedFile);
          }
        },
        MIME_TYPE,
        QUALITY,
      );
    }
  };
};

const calculateSize = (
  img: HTMLImageElement,
  maxWidth: number,
  maxHeight: number,
): [number, number] => {
  let width = img.width;
  let height = img.height;

  if (width > height) {
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      width = Math.round((width * maxHeight) / height);
      height = maxHeight;
    }
  }
  return [width, height];
};

export const handleCrop = async (
  cropping,
  cropperRef,
  imageFiles,
  setImageFiles,
  setImagePreviews,
  setShowCropper,
) => {
  const { image, type } = cropping;
  const cropper = cropperRef.current;
  if (cropper && image && type) {
    const coordinates = cropper?.getCoordinates();
    if (coordinates) {
      try {
        const croppedDataUrl = await cropImage(image, coordinates);
        if (typeof croppedDataUrl === "string") {
          const blob = await (await fetch(croppedDataUrl)).blob();
          const croppedFile = new File([blob], imageFiles[type]?.name, {
            type: "image/png",
          });
          compressArrayOfImages(
            croppedFile,
            type,
            setImageFiles,
            setImagePreviews,
          );
          setShowCropper(false);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }
};

export const updateImage = async (
  file: File,
  preview: string | undefined,
  currentImage: string | undefined,
) => {
  if (preview !== "" && file) {
    return await storeImageAfterSave(file, preview);
  }
  return currentImage;
};
