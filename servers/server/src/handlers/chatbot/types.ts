export type BaseNode = {
  id: string;
  type: string;
  next?: string | null;
  trueNext?: string | null;
  falseNext?: string | null;
};

export type SendMessageNode = BaseNode & {
  type: "send_message";
  contentType: "text" | "image" | "video" | "document";
  text?: string;
  mediaUrl?: string;
  caption?: string;
  bodyText?: string;
  fileName?: string;
};

export type AskQuestionNode = BaseNode & {
  type: "ask_question";
  prompt: string;
  variable: string;
};

export type ConditionRule = {
  join: "if" | "and" | "or";
  var: string;
  op: "exists" | "eq" | "ne" | "gt" | "lt" | "contains";
  value?: string;
};

export type ConditionNode = BaseNode & {
  type: "set_condition";
  logic: ConditionRule[];
};

export type ListRow = { id: string; title: string; description?: string };
export type ListSection = { title: string; rows: ListRow[] };

export type InteractiveListNode = BaseNode & {
  type: "interactive_list_message";
  layout: "list";
  bodyText: string;
  footerText?: string;
  header?: { type: "image"; mediaUrl: string } | null;
  list: {
    buttonText: string;
    sections: ListSection[];
  };
  routes?: Record<string, string>;
};

export type InteractiveButtonNode = BaseNode & {
  type: "interactive_button_message";
  layout: "button";
  bodyText: string;
  footerText?: string;
  header?: { type: "image"; mediaUrl: string } | null;
  buttons: Array<{ id: string; type: "reply"; title: string }>;
  routes?: Record<string, string>;
};

export type InteractiveCtaUrlNode = BaseNode & {
  type: "interactive";
  layout: "cta_url";
  bodyText: string;
  footerText?: string;
  header?: { type: "image"; mediaUrl: string } | null;
  cta?: { url: string; label: string };
  routes?: Record<string, string>;
};

export type GoogleSheetNode = BaseNode & {
  type: "google_sheet";
  sheet: {
    spreadsheetId: string;
    sheetName: string;
    cells: { value: string }[];
  };
};

export type AnyNode =
  | SendMessageNode
  | AskQuestionNode
  | ConditionNode
  | InteractiveListNode
  | InteractiveButtonNode
  | InteractiveCtaUrlNode
  | GoogleSheetNode;

export type SessionState = {
  _id?: string;
  userId: string;
  currentNodeId: string | null;
  waitingFor: null | "ask" | "interactive";
  variables: Record<string, any>;
  interactiveCtx?: { routes: Record<string, string | null> };
  userName?: string;
  nodeStartTime?: number;
};

export type ChatbotFlow = {
  _id: string;
  isDefault?: boolean;
  triggers?: { keywords: string[]; start: string }[];
  nodes: AnyNode[];
};

export type LoadedFlow = {
  flow: ChatbotFlow;
  NODE_BY_ID: Map<string, AnyNode>;
  lastLoaded: number;
};

export type ConditionRow = {
  var: string;
  op: "exists" | "eq" | "ne" | "gt" | "lt" | "contains";
  value?: string;
  join?: "and" | "or";
};

export interface InteractiveCTANode extends BaseNode {
  type: "interactive";
  layout: "cta_url";
  bodyText: string;
  footerText?: string;
  header?: any;
  cta: { url: string; label: string };
}

export interface AskNodeParams {
  textBody: string;
  sessionState: SessionState;
  chatbotList: LoadedFlow[];
  whatsAppBusinessConfigData: any;
  from: string;
  contactName: string;
  c: any;
}

export interface InteractiveParams {
  interactiveTitleOrId: string;
  session: SessionState;
  chatbotList: LoadedFlow[];
  whatsAppBusinessConfigData: any;
  from: string;
  contactName: string;
  c: any;
}
