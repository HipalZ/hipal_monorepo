import mongoose from "mongoose";
import { z } from "zod";

const ObjectIdSchema = z.instanceof(mongoose.Types.ObjectId).or(
  z
    .string()
    .refine((val) => mongoose.Schema.Types.ObjectId, {
      message: "Invalid ObjectId",
    })
    .transform((val) => new mongoose.Types.ObjectId(val)),
);

export const whatAppTemplateStatusEnum = [
  "APPROVED",
  "PENDING",
  "APPROVED",
  "REJECTED",
] as const;
export const whatAppTemplateCategoryEnum = [
  "UTILITY",
  "SERVICE",
  "MARKETING",
] as const;

export const whatAppTemplateSchema = z.object({
  businessId: ObjectIdSchema,
  templateId: z.number().max(30),
  date: z.coerce.number().default(Date.now()),
  variableSequence: z.array(z.string().min(1).max(150)),
  isDeleted: z.boolean().default(false),
});

export const headerSchemaForText = z
  .object({
    text: z.string().min(3).max(100),
    example: z
      .object({
        header_text: z.array(z.string().min(3).max(100)),
      })
      .optional(),
  })
  .optional();

export const headerSchemaForImage = z
  .object({
    example: z
      .object({
        header_handle: z.array(z.string().min(3).max(100)),
      })
      .optional(),
  })
  .optional();

export const headerSchemaForDocument = z
  .object({
    example: z
      .object({
        header_handle: z.array(z.string().min(3).max(100)),
      })
      .optional(),
  })
  .optional();

export const headerSchema = z
  .object({
    type: z.string().min(3).max(100).default("HEADER"),
    format: z.enum(["TEXT", "IMAGE", "DOCUMENT"]),
  })
  .and(
    z.union([
      headerSchemaForText,
      headerSchemaForImage,
      headerSchemaForDocument,
    ]),
  )
  .optional();

export const bodySchema = z.object({
  type: z.string().min(3).max(100).default("BODY"),
  text: z.string().min(3).max(800),
  example: z.object({
    body_text: z.array(z.string().min(3).max(100)),
  }),
});

export const footerSchema = z
  .object({
    type: z.string().min(3).max(100).default("FOOTER"),
    text: z.string().min(3).max(800),
  })
  .optional();

export const buttonPhoneTypeSchema = z
  .object({
    type: z.string().min(3).max(100).default("PHONE_NUMBER"),
    text: z.string().min(3).max(800),
    phone_number: z.string().min(3).max(100),
  })
  .optional();

export const buttonUrlTypeSchema = z
  .object({
    type: z.string().min(3).max(100).default("URL"),
    text: z.string().min(3).max(800),
    url: z.string().min(3).max(100).url(),
    example: z.array(z.string().min(3).max(100)).optional(),
  })
  .optional();

export const buttonSchema = z.object({
  type: z.string().min(3).max(100).default("BUTTONS"),
  buttons: z.array(z.union([buttonPhoneTypeSchema, buttonUrlTypeSchema])),
});

export const validateWhatAppTemplateSchema = z.object({
  name: z.string().min(3).max(100),
  parameter_format: z.string().min(3).max(100).default("POSITIONAL"),
  language: z.string().min(3).max(100).default("en_GB"),
  // status: z.enum(whatAppTemplateStatusEnum).default("PENDING"),
  category: z.enum(whatAppTemplateCategoryEnum).default("UTILITY"),
  // sub_category: z.string().min(3).max(100).default("CUSTOM"),
  components: z.array(
    z.union([
      headerSchema.optional(),
      bodySchema,
      footerSchema.optional(),
      buttonSchema.optional(),
    ]),
  ),
  bodyVariableSequence: z.array(z.string().min(1).max(100)).default([]),
  footerVariableSequence: z.array(z.string().min(1).max(100)).default([]),
  buttonVariableSequence: z.array(z.string().min(1).max(100)).default([]),
});

export type WhatAppTemplateType = z.infer<typeof whatAppTemplateSchema>;
export type ValidateWhatAppTemplateType = z.infer<
  typeof validateWhatAppTemplateSchema
>;
