import type {
  Edge,
  EdgeTypes,
  NodeTypes,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
} from "@xyflow/react";
import type { DragEvent } from "react";

export interface SendNodeMeta {
  contentType: "text" | "image" | "document";
  text?: string;
  mediaUrl?: string;
  fileName?: string;
  caption?: string;
  useUpload?: boolean;
  storeVariable?: string;
  variable?: string;
}

export interface SendNodeData {
  meta?: SendNodeMeta;
  variables?: string[];
  onPatch: (updates: { meta: SendNodeMeta }) => void;
  onVariableAdd?: (variables: string[]) => void;
}

export interface SendNodeProps {
  data: SendNodeData;
  selected: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface HeaderMeta {
  type: "none" | "text" | "image" | "video" | "document";
  mediaUrl?: string;
  useUpload?: boolean;
}

export interface Button {
  id: string;
  type: "reply" | "url";
  title: string;
  url?: string;
}

export interface ListSection {
  title: string;
  rows: Array<{
    id: string;
    title: string;
    description?: string;
  }>;
}

export interface InteractiveMeta {
  layout: "button" | "list";
  header: HeaderMeta;
  bodyText: string;
  footerText: string;
  buttons: Button[];
  list: {
    sections: ListSection[];
  };
  routes: Record<string, string>;
}

export interface SendMeta {
  contentType: "text" | "image" | "video" | "document";
  text: string;
  variable: string;
  mediaUrl: string;
  caption: string;
}

export interface AskMeta {
  prompt: string;
  inputType: "text" | "number" | "email";
  required: boolean;
  variable: string;
}

export interface CondMeta {
  logic: Array<{
    variable: string;
    operator: string;
    value: string;
    next?: string;
  }>;
}

export interface TriggerMeta {
  keywords: string[];
}

export interface SheetMeta {
  spreadsheetId: string;
  sheetName: string;
  cells: Array<{
    key: string;
    value: string;
  }>;
}

export type NodeMeta =
  | InteractiveMeta
  | SendMeta
  | AskMeta
  | CondMeta
  | TriggerMeta
  | SheetMeta;

export interface MakeNodeParams {
  id: string;
  type: NodeTypes;
  position: Position;
  patch: (updates: { meta: NodeMeta }) => void;
  updateGlobalVariables: (variables: string[]) => void;
  remove: () => void;
  variables: string[];
}

export interface NodeData {
  id: string;
  onPatch: (updates: { meta: NodeMeta }) => void;
  variables: string[];
  updateGlobalVariables: (variables: string[]) => void;
  remove: () => void;
  meta: NodeMeta;
}

export interface Node {
  id: string;
  type: NodeTypes;
  position: Position;
  data: NodeData;
}

export interface ListRow {
  id: string;
  title: string;
  description?: string;
}

export interface ListSection {
  id: string;
  title: string;
  rows: ListRow[];
}

export interface ListData {
  buttonText: string;
  sections: ListSection[];
}

export interface InteractiveListMeta {
  type: "interactive_list_message";
  layout: "list";
  headerText?: string;
  bodyText?: string;
  footerText?: string;
  list: ListData;
  routes: Record<string, string>;
}

export interface InteractiveListNodeData {
  meta?: Partial<InteractiveListMeta>;
  onPatch: (updates: { meta: InteractiveListMeta }) => void;
}

export interface InteractiveListNodeProps {
  data: InteractiveListNodeData;
  selected: boolean;
}

export interface ButtonItem {
  id: string;
  type: "reply" | "url";
  title: string;
  url?: string;
}

export interface HeaderData {
  type: "none" | "text" | "image" | "video" | "document";
  mediaUrl?: string;
  useUpload?: boolean;
}

export interface ListSection {
  id: string;
  title: string;
  rows: Array<{
    id: string;
    title: string;
    description?: string;
  }>;
}

export interface InteractiveButtonMeta {
  layout: "button";
  header: HeaderData;
  bodyText: string;
  footerText: string;
  buttons: ButtonItem[];
  list: {
    sections: ListSection[];
  };
  routes: Record<string, string>;
}

export interface InteractiveButtonNodeData {
  meta?: Partial<InteractiveButtonMeta>;
  onPatch: (updates: { meta: InteractiveButtonMeta }) => void;
}

export interface InteractiveButtonNodeProps {
  data: InteractiveButtonNodeData;
  selected: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface ContextMenuState {
  nodeId: string;
  handleId: string | null;
  clientX: number;
  clientY: number;
}

export interface CategoryItem {
  type: string;
  label: string;
  icon: React.ReactNode;
}

export interface Category {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  items: CategoryItem[];
}

export interface FinalObject {
  chatbotName: string;
  businessId: string | undefined;
  [key: string]: unknown;
}

export interface SidebarProps {
  leftOpen: boolean;
  setLeftOpen: React.Dispatch<React.SetStateAction<boolean>>;
  chatbotName: string;
  setChatbotName: React.Dispatch<React.SetStateAction<string>>;
  categories: Category[];
  openCategories: string[];
  toggleCategory: (id: string) => void;
  handleOpenChatbot: () => void;
  handleSaveFlow: () => void;
  disablePublish: boolean;
}

export interface FlowAreaProps {
  rfNodes: Node[];
  rfEdges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  nodeTypes: NodeTypes;
  edgeTypes: EdgeTypes;
  contextMenu: ContextMenuState | null;
  openContextMenu: (event: MouseEvent, node: Node) => void;
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenuState | null>>;
  addNodeFromContext: (
    item: CategoryItem,
    contextMenu: ContextMenuState,
  ) => void;
  categories: Category[];
}

export interface ContextMenuProps {
  categories: Category[];
  contextMenu: ContextMenuState;
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenuState | null>>;
  addNodeFromContext: (
    item: CategoryItem,
    contextMenu: ContextMenuState,
  ) => void;
}

export interface CategoryHeaderProps {
  category: Category;
}

export interface JSONPanelProps {
  finalObject: FinalObject;
}

export type ConditionJoin = "if" | "and" | "or";

export interface ConditionRow {
  join: ConditionJoin; // if | and | or
  var: string; // variable name
  op: string; // eq, ne, exists, etc.
  value: string; // user input
}

export interface CondNodeMeta {
  logic: ConditionRow[];
}

export interface CondNodeData {
  meta: CondNodeMeta;
  variables: string[];
  onPatch: (patch: Partial<CondNodeData>) => void;
}
