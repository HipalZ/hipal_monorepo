import {
  Heading1,
  Heading2,
  Pilcrow,
  Baseline,
  ImageIcon,
  MessageSquare,
  Calendar,
  CheckCircle,
  CheckSquare,
  ChevronDownSquare,
  ToggleRight,
} from "lucide-react";
import type { ContentType, ShortAnswerSubType } from "./types";
import type { ElementType } from "react";

export const contentConfig: Record<
  ContentType,
  { icon: ElementType; label: string }
> = {
  "large-heading": { icon: Heading1, label: "Large heading" },
  "small-heading": { icon: Heading2, label: "Small heading" },
  "body-text": { icon: Pilcrow, label: "Body" },
  caption: { icon: Baseline, label: "Caption" },
  image: { icon: ImageIcon, label: "Image" },
  "short-answer": { icon: MessageSquare, label: "Short answer" },
  paragraph: { icon: Pilcrow, label: "Paragraph" },
  datepicker: { icon: Calendar, label: "Date picker" },
  "single-choice": { icon: CheckCircle, label: "Single choice" },
  "multiple-choice": { icon: CheckSquare, label: "Multiple choice" },
  dropdown: { icon: ChevronDownSquare, label: "Drop-down" },
  "opt-in": { icon: ToggleRight, label: "Opt-in" },
};

export const shortAnswerSubTypes: {
  value: ShortAnswerSubType;
  label: string;
}[] = [
  { value: "text", label: "Text" },
  { value: "password", label: "Password" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
  { value: "passcode", label: "Passcode" },
  { value: "phone", label: "Phone" },
];
