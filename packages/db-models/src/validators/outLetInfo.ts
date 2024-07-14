import mongoose from 'mongoose';
import { z } from 'zod';

const ObjectIdSchema = z.instanceof(mongoose.Types.ObjectId).or(
  z
    .string()
    .refine((val) => mongoose.Schema.Types.ObjectId, {
      message: 'Invalid ObjectId',
    })
    .transform((val) => new mongoose.Types.ObjectId(val)),
);

export const Amenities = [
  'SMOKING SECTION',
  'BUFFET',
  'PARKING',
  'HI SPEED WIFI',
  'CHILD FRIENDLY',
  'ALCOHOL',
  'DELIVERY',
  'TAKEAWAY',
  'DINEIN',
  'RESERVATION',
] as const;

export const SocialMedia = z.object({
  icon: z.string().min(4).max(30),
  link: z.string().url().min(10).max(100),
});

export const outLetInfoSchema = z.object({
  name: z.string().min(4).max(50),
  businessId: ObjectIdSchema,
  fssai: z.string({ message: 'add valid fssai number' }).min(26).max(50).optional(),
  gst: z.string({ message: 'add valid gst number' }).min(15).max(26).optional(),
  specialBannerUrl: z.string().url({ message: 'add valid url' }).min(10).max(100).optional(),
  endBannerUrl: z.string().url({ message: 'add valid url' }).min(10).max(100).optional(),
  logoUrl: z.string().url({ message: 'add valid url' }).min(10).max(100).optional(),
  description: z.string().min(4).max(100).optional(),
  tags: z.array(z.string().min(4).max(30)).optional(),
  phone: z.string({ message: 'enter valid 10 digit phone' }).min(10).max(10).optional(),
  location: z.string({ message: 'valid url address' }).url().min(10).max(100).optional(),
  amenities: z.enum(Amenities).array().optional(),
  timing: z.array(z.object({
    openTime: z.string(),
    closedTime: z.string()
  })).optional(),
  fixOpenTime: z.string().min(2).max(4).optional(),
  fixCloseTime: z.string().min(2).max(4).optional(),
  footerDescription: z.string().min(10).max(200).optional(),
  socialMediaLinks: z.array(SocialMedia).optional(),
  billingStartTime: z.string().min(4).max(30).optional(),
  billingEndTime: z.string().min(4).max(30).optional(),
  brandName: z.string().min(4).max(30).optional(),
  branchName: z.string().min(4).max(30).optional(),
  customTiming: z.boolean().optional(),
});

export type OutLetInfoType = z.infer<typeof outLetInfoSchema>;
