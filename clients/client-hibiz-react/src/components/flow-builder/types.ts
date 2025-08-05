export type ShortAnswerSubType =
  | "text"
  | "password"
  | "email"
  | "number"
  | "passcode"
  | "phone";

export type ContentType =
  | "large-heading"
  | "small-heading"
  | "body-text"
  | "caption"
  | "image"
  | "short-answer"
  | "paragraph"
  | "datepicker"
  | "single-choice"
  | "multiple-choice"
  | "dropdown"
  | "opt-in";

export type ButtonAction = "next_screen" | "go_to_screen" | "submit";

export interface ContentComponent {
  id: string;
  type: ContentType;
  data: Record<string, any>;
}

export interface Screen {
  id: string;
  name: string;
  title: string;
  content: ContentComponent[];
  button: {
    text: string;
    action: ButtonAction;
    targetScreenId?: string;
  };
}
