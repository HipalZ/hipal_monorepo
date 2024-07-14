import QRCode from 'qrcode';
import * as XLSX from 'xlsx';
import { BillsData } from '../types/businessData';
import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import axios from '@/axios';

export function convertToCSV(data: BillsData) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return '';
  }

  const headers = [
    'businessName',
    'customerName',
    'customerPhone',
    'paymentDate',
    'discount',
    'paymentMode',
    'serviceCharge',
    'sgst',
    'cgst',
    'subTotal',
    'tableName',
    'tips',
    'total',
    'waiterName',
  ];

  let csvContent = headers.join(',') + '\r\n';

  data.forEach((bill: any) => {
    const row = headers
      .map((fieldName) => {
        let field = bill[fieldName];
        if (field === undefined || field === null) {
          return '';
        }
        if (typeof field === 'object') {
          return JSON.stringify(field);
        }
        if (field.toString().includes(',')) {
          field = `"${field}"`;
        }
        return field;
      })
      .join(',');

    csvContent += row + '\r\n';
  });
  return csvContent;
}

export function downloadCSV(billsData: BillsData | null) {
  if (billsData) {
    const csv = convertToCSV(billsData);
    if (csv) {
      const blob = new Blob([csv], { type: 'text/csv' });
      const link = document.createElement('a');

      link.href = URL.createObjectURL(blob);
      link.download = 'bills_data.csv';
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
    const blobBin = atob(reader.result.toString().split(',')[1]);
    const array = [];
    for (let i = 0; i < blobBin.length; i++) {
      array.push(blobBin.charCodeAt(i));
    }
    const file = new Blob([new Uint8Array(array)], {
      type: image.type,
    });
    const formdata = new FormData();
    formdata.append('fileData', file);
    formdata.append('fileName', `${imageId}`);
    formdata.append('bucketName', 'assets');
    try {
     const res =  await axios.post(`https://api.hipal.life/v1/storage`, formdata);
     console.log('res',res)
      return `https://storage.hipal.life/minio/assets/${imageId}`;
    } catch (error) {
      console.log(error);
    }
  }
}

export async function storeImageAfterSave(image: File) {
  if (!image) return;
  const reader = new FileReader();
  reader.readAsDataURL(image);
  const imageId = crypto.randomUUID();
  await new Promise((resolve, reject) => {
    reader.onload = () => {
      resolve(reader.result);
    };
  });
  if (reader.result) {
    const blobBin = atob(reader.result.toString().split(',')[1]);
    const array = [];
    for (let i = 0; i < blobBin.length; i++) {
      array.push(blobBin.charCodeAt(i));
    }
    const file = new Blob([new Uint8Array(array)], {
      type: image.type,
    });
    const formdata = new FormData();
    formdata.append('fileData', file);
    formdata.append('fileName', `${imageId}`);
    formdata.append('bucketName', 'assets');
    try {
      await axios.post(`https://api.hipal.life/v1/storage`, formdata);
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
    console.error('Error fetching sales report:', error);
  }
};

export function validPortionCheck(array: Array<Record<string, any>>) {
  if (!Array.isArray(array) || array.length === 0) {
    return false;
  }
  return array.every((item) => item?.hasOwnProperty('price') && item?.price !== '' && item?.hasOwnProperty('name') && item?.name !== '');
}

export const exportToExcel = (salesData: any) => {
  const wb = XLSX.utils.book_new(); // New workbook
  const ws_data = [];

  // Add Gross Sale
  ws_data.push(['Gross Sale']);
  ws_data.push(['', salesData.grossSale]);
  ws_data.push([]); // Empty row for spacing

  // Function to add labeled data to the worksheet
  const addLabeledData = (label, data, headers) => {
    ws_data.push([label]); // Section label
    ws_data.push(headers); // Column headers
    data.forEach((row: any) => ws_data.push(Object.values(row))); // Data rows
    ws_data.push([]); // Empty row for spacing
  };

  // Add each section of sales data
  addLabeledData('Total Sale', salesData.totalSale, ['Mode', 'Amount', 'Commission Percent', 'Total Commission Sale']);
  addLabeledData('Charges', salesData.charges, ['Mode', 'Amount', 'Commission Percent', 'Total Commission Sale']);
  addLabeledData('Discounts', salesData.discounts, ['Mode', 'Amount', 'Commission Percent', 'Total Commission Sale']);
  addLabeledData(
    'Tips',
    salesData.tips.map((tip: any) => ({ waiterName: tip.waiterName, tips: tip.tips })),
    ['waiterName', 'tips'],
  );
  addLabeledData(
    'Dues',
    salesData.dues.map((due: any) => ({ customerName: due.customerName, dues: due.dues })),
    ['customerName', 'dues'],
  );

  // Create the worksheet from the ws_data array
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(wb, ws, 'Sales Data');

  // Write the workbook and initiate download
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
  const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Sales_Report.xlsx';
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
  return rect.left >= 0 && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
}

export const generateQRCode = async (link: string) => {
  try {
    const url = await QRCode.toDataURL(link);
    return url;
  } catch (error) {
    console.error(error);
    return '';
  }
};

export async function downloadURI(id: string, name: string, zoneId: string, businessId: string) {
  const longUrl = `https://pro.hipal.life/r/${businessId}/explore?tableId=${id}&name=${name}&zoneId=${zoneId}`;
  const payload = {
    longUrl: longUrl,
  };
  console.log(longUrl);

  try {
    const response = await axios.post('https://api.hipal.life/v1/users/usrShortner', payload, {
      withCredentials: true,
    });
    const uri = await generateQRCode(response.data.shortUrl);
    const link = document.createElement('a');
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
    type: 'select a zone type',
  },
  {
    id: 1,
    type: 'Dine In',
  },
  {
    id: 2,
    type: 'Take Away',
  },
  {
    id: 3,
    type: 'Delivery',
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
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const month = monthNames[date.getMonth()];

  // Determine the day suffix
  let daySuffix;
  switch (day) {
    case 1: case 21: case 31:
      daySuffix = "st";
      break;
    case 2: case 22:
      daySuffix = "nd";
      break;
    case 3: case 23:
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

export function filterPayload(payload: Record<string, any>): Record<string, any> {
  const filteredPayload = Object.fromEntries(
    Object.entries(payload).filter(([_, value]) => value !== null && value !== "")
  );
  return filteredPayload;
}