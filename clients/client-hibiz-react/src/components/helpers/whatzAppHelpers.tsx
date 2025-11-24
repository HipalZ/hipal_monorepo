import { WHATSAPP_ID, WHATSAPP_TOKEN } from '@/configs';
import { apiRpc } from '@hi/common';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { parse } from 'papaparse';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import useBusinessData from '../store/useBusinessData';
import { useMessageRecipientsStore } from '../store/useMessageRecipientsStore';
import useWhatsapp from '../store/useWhatsapp';
import type { CropperRef } from '../types/businessData';

export const useWhatzappCroppedImg = () => {
  const { cropping, imageFiles, setShowCropper, setImagePreview, setImageFiles } = useWhatsapp((s) => ({
    cropping: s.cropping,
    imageFiles: s.imageFiles,
    setShowCropper: s.setShowCropper,
    setImagePreview: s.setImagePreview,
    setImageFiles: s.setImageFiles,
  }));
  // compressing the image
  const getCroppedImg = (imageSrc: string, pixelCrop, mimeType = 'image/webp', quality = 0.9) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;
      image.crossOrigin = 'anonymous';

      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
          resolve(canvas.toDataURL(mimeType, quality));
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      };

      image.onerror = (err) => {
        reject(err);
      };
    });
  };

  // cropping and setting the updated height n width's imageFile and image
  const handleCrop = async (cropperRef: CropperRef) => {
    const { image, type } = cropping;
    if (image && type) {
      const croppedAreaPixels = cropperRef.current?.getCroppedAreaPixels();
      if (croppedAreaPixels) {
        try {
          const mimeType = imageFiles?.type || 'image/webp';
          const isGif = imageFiles?.type?.includes('gif');

          let croppedData: Blob | string;
          if (isGif) {
            // croppedData = await compressGif(imageFiles, croppedAreaPixels);
            croppedData = image;
          } else {
            croppedData = await getCroppedImg(image, croppedAreaPixels, mimeType);
          }

          // Use croppedData directly as previewUrl
          const blob = await (await fetch(croppedData)).blob();
          const croppedFile = new File([blob], imageFiles?.name, {
            type: 'image/png',
          });
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader?.result);
            setImageFiles(croppedFile);
            setShowCropper(false);
          };
          reader.readAsDataURL(croppedFile);
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  return { handleCrop };
};

export const useAddTemplate = () => {
  const { setTemplateName, setBodyText } = useWhatsapp((s) => ({
    setTemplateName: s.setTemplateName,
    setBodyText: s.setBodyText,
  }));

  const addTemplateName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/[^a-zA-Z0-9_]/g, '') // Remove anything that is not a letter, number, or underscore
        .toLowerCase();

      setTemplateName(value);
    },
    [setTemplateName],
  );

  const handleBodyTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setBodyText(e.target.value.trimStart());
    },
    [setBodyText],
  );

  return { addTemplateName, handleBodyTextChange };
};

export const normalizeAndMapKeys = (obj: any, keyMap: { [key: string]: string }) => {
  const normalizeKey = (key: string) => {
    return key
      .replace(/[\s-_]+/g, ' ') // Replace spaces hyphens and underscores with spaces
      .toLowerCase()
      .replace(/\s+/g, '');
  };

  return Object.keys(obj).reduce((acc, key) => {
    const normalizedKey = normalizeKey(key);
    const newKey = keyMap[normalizedKey] || key;
    acc[newKey] = obj[key];
    return acc;
  }, {} as any);
};

export const normalizeInput = (value: string): string => {
  const trimmedValue = value.trimStart(); // Remove leading spaces
  const normalizedValue = trimmedValue.replace(/\s{3,}/g, ' '); // Replace more than two consecutive spaces with a single space
  return normalizedValue;
};

// Helper function to clean and normalize phone numbers
const normalizePhoneNumber = (phone: string): string | null => {
  const cleanedPhone = phone
    .replace(/^\+91/, '') // Remove +91 prefix only if it exists
    .replace(/\D+/g, '') // Remove all spaces
    .trim(); // Remove leading and trailing spaces
  // Exclude 12-digit numbers
  if (cleanedPhone.length !== 10) {
    return null; // Invalid number
  }

  return cleanedPhone;
};

// Helper function to remove duplicate objects by phone number
const removeDuplicateContacts = (contacts: any[]): any[] => {
  const uniqueContacts = new Map();
  for (const contact of contacts) {
    const normalizedPhone = normalizePhoneNumber(contact.phone);
    if (!uniqueContacts.has(normalizedPhone)) {
      uniqueContacts.set(normalizedPhone, contact);
    }
  }
  return Array.from(uniqueContacts.values());
};

export const calculateCreditScore = (contactsLength: number, balance: number, templateType: string) => {
  const creditScore = contactsLength * (templateType === 'MARKETING' ? 0.9 : 0.2);
  if (creditScore > balance) {
    toast.error(`You have need ${creditScore} credits to send this message.`);
  } else {
    toast.success(`This operation will remove ${creditScore} credits from your balance.`);
  }
};

function parseDobToTimestamp(dob: string | number): number | undefined {
  if (dob === null || dob === undefined || dob === '') return undefined;

  // Keep 0 as-is
  if (dob === 0 || dob === '0') return 0;

  // Normalize separators
  const str = String(dob).trim().replace(/-/g, '/');
  const parts = str.split('/');

  if (parts.length === 3) {
    const [dayStr, monthStr, yearStr] = parts;
    const day = Number.parseInt(dayStr, 10);
    const month = Number.parseInt(monthStr, 10) - 1;
    const year = Number.parseInt(yearStr.length === 2 ? `20${yearStr}` : yearStr, 10);

    // Create UTC midnight (neutral date)
    const utc = Date.UTC(year, month, day);
    return utc;
  }

  return undefined;
}

export const useBulkUploadContacts = () => {
  const queryClient = useQueryClient();

  const { walletBalance, templateType } = useWhatsapp((s) => ({
    walletBalance: s.walletBalance,
    templateType: s.templateType,
  }));

  const { setUploadedFileName, setBulkCustomers } = useMessageRecipientsStore((s) => ({
    setUploadedFileName: s.setUploadedFileName,
    setBulkCustomers: s.setBulkCustomers,
  }));

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (file: File) => {
      return new Promise((resolve, reject) => {
        setUploadedFileName(file.name);

        parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: async (result) => {
            try {
              // 🔹 Step 1: Normalize header keys (handle Name/Phone/DOB variations)
              const firstRow = result.data[0];
              if (!firstRow) throw new Error('File is empty or invalid.');

              const availableKeys = Object.keys(firstRow).map((k) => k.toLowerCase());
              const hasName = availableKeys.includes('name');
              const hasPhone = availableKeys.includes('phone');

              if (!hasName || !hasPhone) {
                throw new Error("Invalid file format. Please ensure the file contains 'name' and 'phone' columns.");
              }

              // 🔹 Step 2: Normalize and validate each row
              const data = result.data.map((item: Record<string, any>) => {
                const lowerKeys: Record<string, any> = {};
                Object.keys(item).forEach((k) => {
                  lowerKeys[k.toLowerCase()] = item[k];
                });

                const name = lowerKeys['name']?.trim();
                const phone = lowerKeys['phone']?.toString().trim();
                const dobRaw = lowerKeys['dob']?.trim();

                const dobTimestamp = dobRaw ? parseDobToTimestamp(dobRaw) : undefined;

                const normalized = {
                  name,
                  phone,
                  ...(dobTimestamp && { dob: dobTimestamp }),
                };

                if (normalized.phone) {
                  normalized.phone = normalizePhoneNumber(normalized.phone);
                }

                return normalized;
              });

              // 🔹 Step 3: Filter valid entries
              const validData = data.filter((item) => item.name && item.phone && item.phone !== null && Object.keys(item).length > 0);

              if (validData.length === 0) {
                throw new Error('No valid contacts found in the file. Please check the file format and data.');
              }

              // 🔹 Step 4: Remove duplicates
              const uniqueContacts = removeDuplicateContacts(validData);

              // 🔹 Step 5: (Optional) Validate wallet balance
              // calculateCreditScore(uniqueContacts.length, walletBalance, templateType);

              // 🔹 Step 6: Save parsed contacts
              setBulkCustomers(uniqueContacts);
              resolve('Contacts uploaded successfully');
            } catch (error: any) {
              toast.error(error.message || 'File processing failed');
              reject(error);
            }
          },
          error: (err) => {
            toast.error('Failed to parse CSV file');
            reject(err);
          },
        });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getAllPeoples'] });
    },
    onError: () => {
      toast.error('Failed to upload contacts');
    },
  });

  return { mutate: mutateAsync, isPending };
};

export const useGetAllGroups = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);
  const { setGroups } = useMessageRecipientsStore((s) => ({
    setGroups: s.setGroups,
  }));
  const fetchAllGroups = async () => {
    const res = await apiRpc.groups.$get({
      query: {
        businessId: businessId || '',
      },
    });

    const response = await res.json();
    setGroups(response.data);
    return response.data;
  };
  return { fetchAllGroups };
};

export enum ISelectedFlowType {
  SAME_DAY = 'sameday',
  COME_BACK = 'comeback',
  SCAN = 'scan',
}

export const flowOptions = [
  { id: ISelectedFlowType.SAME_DAY, label: 'Same Day Flow' },
  { id: ISelectedFlowType.COME_BACK, label: 'Comeback Day Flow' },
  { id: ISelectedFlowType.SCAN, label: 'Scan Flow' },
];

export const formatTriggerTime = (triggerAt: number, selectedFlowType: string) => {
  if (selectedFlowType === ISelectedFlowType.COME_BACK) {
    const weeks = triggerAt / (24 * 60 * 60 * 1000);
    return `${weeks.toFixed(2)} week${weeks > 1 ? 's' : ''}`;
  }
  if (triggerAt >= 3600 * 1000) {
    const hours = triggerAt / (60 * 60 * 1000);
    return `${hours.toFixed(2)} hour${hours > 1 ? 's' : ''}`;
  }
  const minutes = triggerAt / (60 * 1000);
  return `${minutes.toFixed(2)} minute${minutes > 1 ? 's' : ''}`;
};

export async function CreateWhatsAppFlow(flowJson: any, flowName: string) {
  if (!WHATSAPP_ID || !WHATSAPP_TOKEN) {
    return {
      success: false,
      error: 'Missing WhatsApp Business Account ID or Access Token in environment variables.',
    };
  }

  const apiUrl = `https://graph.facebook.com/v21.0/${WHATSAPP_ID}/flows`;

  const requestBody = {
    name: flowName.replace(/\s+/g, '_').toLowerCase(),
    categories: ['LEAD_GENERATION'],
    flow_json: JSON.stringify(flowJson),
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('API Error:', responseData);
      const errorMessage =
        responseData.error?.error_user_title && responseData.error?.error_user_msg
          ? `${responseData.error.error_user_title}: ${responseData.error.error_user_msg}`
          : responseData.error?.message || 'An unknown API error occurred.';
      return { success: false, error: errorMessage };
    }

    return { success: true, data: responseData };
  } catch (error: any) {
    console.error('Fetch Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to connect to the API.',
    };
  }
}

export const useGetFlows = () => {
  const getFlows = async () => {
    const res = await fetch(`https://graph.facebook.com/v21.0/${WHATSAPP_ID}/flows`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData?.error?.message || 'Failed to fetch flows');
    }

    const data = await res.json();
    return data.data;
  };

  const {
    data: flows,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['whatsapp-flows'],
    queryFn: getFlows,
  });
  return { flows, isLoading, error };
};
