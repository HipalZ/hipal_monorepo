import { z } from "zod";
import { ObjectIdSchema } from "../common";

export const ButtonSchema = z.object({
  id: z.string().min(1).max(50),
  type: z.enum(["reply", "url"]),
  title: z.string(),
  url: z.string().optional(),
});

export const ListRowSchema = z.object({
  id: z.string().min(1).max(50),
  title: z.string(),
  description: z.string().optional(),
});

export const ListSectionSchema = z.object({
  id: z.string().min(1).max(50).optional(),
  title: z.string(),
  rows: z.array(ListRowSchema).default([]),
});

export const HeaderSchema = z.object({
  type: z.enum(["none", "image"]).default("none"),
  mediaUrl: z.string().optional(),
  useUpload: z.boolean().default(false),
});

export const NodeSchema = z.object({
  id: z.string().min(1).max(50),
  type: z.enum([
    "send_message",
    "ask_question",
    "interactive_message",
    "set_condition",
    "trigger",
    "interactive_button_message",
    "interactive_list_message",
  ]),

  next: z.string().nullable().optional(),
  variable: z.string().nullable().optional(),

  contentType: z.enum(["text", "image", "document"]).optional(),
  text: z.string().optional(),
  mediaUrl: z.string().optional(),
  fileName: z.string().optional(),
  caption: z.string().optional(),
  selectedVars: z.array(z.string()).optional(),

  prompt: z.string().optional(),
  inputType: z.enum(["text", "number", "phone", "email"]).optional(),
  required: z.boolean().optional(),

  layout: z.enum(["button", "list", "cta_url", "none"]).optional(),
  header: HeaderSchema.optional(),
  bodyText: z.string().optional(),
  footerText: z.string().optional(),
  buttons: z.array(ButtonSchema).optional(),
  list: z
    .object({
      buttonText: z.string().optional(),
      sections: z.array(ListSectionSchema).optional(),
    })
    .optional(),
  routes: z.record(z.string()).optional(),

  logic: z
    .array(
      z.object({
        var: z.string(),
        op: z.enum(["exists", "eq", "ne", "gt", "lt", "contains"]),
        value: z.string().optional(),
      }),
    )
    .optional(),
  trueNext: z.string().optional(),
  falseNext: z.string().optional(),
});

export const TriggerSchema = z.object({
  keywords: z.array(z.string()).default([]),
  start: z.string().nullable().optional(),
});

export const WhatsappChatbotSchema = z.object({
  businessId: ObjectIdSchema,
  chatbotName: z.string().min(1).default("My WhatsApp Chatbot"),
  version: z.number().default(2),
  triggers: z.array(TriggerSchema).default([]),
  variables: z.array(z.string()).default([]),
  nodes: z.array(NodeSchema).default([]),
  active: z.boolean().default(true),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type WhatsappChatbotType = z.infer<typeof WhatsappChatbotSchema>;
export type ButtonType = z.infer<typeof ButtonSchema>;
export type ListRowType = z.infer<typeof ListRowSchema>;
export type ListSectionType = z.infer<typeof ListSectionSchema>;
export type HeaderType = z.infer<typeof HeaderSchema>;
export type NodeType = z.infer<typeof NodeSchema>;
export type TriggerType = z.infer<typeof TriggerSchema>;
