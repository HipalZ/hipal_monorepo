import { AskNode } from '@/components/templates/whatsappTemplates/chatbots/askNode';
import { CondNode } from '@/components/templates/whatsappTemplates/chatbots/condNode';
import GoogleSheetNode from '@/components/templates/whatsappTemplates/chatbots/googleSheet';
import { InteractiveButtonNode } from '@/components/templates/whatsappTemplates/chatbots/interactiveButton';
import { InteractiveListNode } from '@/components/templates/whatsappTemplates/chatbots/interactiveList';
import { InteractiveReply } from '@/components/templates/whatsappTemplates/chatbots/interactiveReply';
import { SendNode } from '@/components/templates/whatsappTemplates/chatbots/sendNode';
import { TriggerNode } from '@/components/templates/whatsappTemplates/chatbots/triggerNode';
import { BaseEdge, getBezierPath } from '@xyflow/react';
import { FileSpreadsheet, GitBranch, HelpCircle, ListOrdered, MessageSquare, Share2, SquareCheck } from 'lucide-react';

export const NodeTypes = {
  SEND: 'send_message',
  ASK: 'ask_question',
  COND: 'set_condition',
  TRIGGER: 'trigger',
  INTERACTIVE: 'interactive',
  INTERACTIVE_BUTTON: 'interactive_button_message',
  INTERACTIVE_LIST: 'interactive_list_message',
  SHEET: 'google_sheet',
};

export const nid = () => Math.random().toString(36).slice(2, 10);

export const nodeTypes = {
  [NodeTypes.SEND]: SendNode,
  [NodeTypes.ASK]: AskNode,
  [NodeTypes.COND]: CondNode,
  [NodeTypes.TRIGGER]: TriggerNode,
  [NodeTypes.INTERACTIVE]: InteractiveReply,
  [NodeTypes.INTERACTIVE_BUTTON]: InteractiveButtonNode,
  [NodeTypes.INTERACTIVE_LIST]: InteractiveListNode,
  [NodeTypes.SHEET]: GoogleSheetNode,
};

export function ButtonEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
}: {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  markerEnd?: string;
}) {
  const [path] = getBezierPath({ sourceX, sourceY, targetX, targetY });
  return <BaseEdge id={id} path={path} markerEnd={markerEnd} />;
}
export const edgeTypes = {
  button: ButtonEdge,
};

export function buildFinalFromGraph(nodes, edges) {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const metaById = Object.fromEntries(nodes.map((n) => [n.id, JSON.parse(JSON.stringify(n.data.meta || {}))]));

  const globalVars = new Set();
  for (const n of nodes) {
    const m = metaById[n.id] || {};
    const varName = (m.variable || '').trim();
    if (varName) globalVars.add(varName);
  }
  const variables = Array.from(globalVars);

  const runtimeNodes = [];
  const triggers = [];

  for (const e of edges) {
    const { source, target, data } = e;
    const sNode = byId[source];
    if (!sNode) continue;
    const m = metaById[source] || {};

    if (sNode.type === NodeTypes.COND) {
      if (data?.kind === 'cond:true') m.trueNext = target;
      else if (data?.kind === 'cond:false') m.falseNext = target;
    } else if (sNode.type === NodeTypes.TRIGGER && data?.kind === 'trigger:start') {
      m.startNext = target;
    } else if (sNode.type === NodeTypes.INTERACTIVE) {
      m.routes = m.routes || {};
      m.routes[e.sourceHandle] = target;
    } else {
      m.next = target;
    }
  }

  for (const n of nodes) {
    const m = metaById[n.id] || {};

    if (n.type === NodeTypes.TRIGGER) {
      triggers.push({ keywords: m.keywords || [], start: m.startNext || null });
      continue;
    }

    if (n.type === NodeTypes.SEND) {
      runtimeNodes.push({
        id: n.id,
        type: NodeTypes.SEND,
        next: m.next || null,
        contentType: m.contentType || 'text',
        text: m.text || '',
        mediaUrl: m.mediaUrl || '',
        fileName: m.fileName || '',
        caption: m.caption || '',
        selectedVars: m.selectedVars || [],
        variable: (m.variable || '').trim() || null,
      });
      continue;
    }

    if (n.type === NodeTypes.ASK) {
      runtimeNodes.push({
        id: n.id,
        type: NodeTypes.ASK,
        next: m.next || null,
        prompt: m.prompt || '',
        inputType: m.inputType || 'text',
        required: !!(m.required ?? true),
        variable: (m.variable || '').trim() || null,
      });
      continue;
    }

    if (n.type === NodeTypes.INTERACTIVE) {
      runtimeNodes.push({
        id: n.id,
        type: NodeTypes.INTERACTIVE,
        layout: m.layout || 'button',
        header: m.header || null,
        bodyText: m.bodyText || '',
        footerText: m.footerText || '',
        buttons: m.buttons || [],
        list: m.list || null,
        routes: m.routes || {},
        next: m.next || null,
        variable: null,
      });
    }
    if (n.type === NodeTypes.INTERACTIVE_BUTTON) {
      const m = n.data?.meta || {};
      const buttons = Array.isArray(m.buttons) ? m.buttons : [];
      runtimeNodes.push({
        id: n.id,
        type: NodeTypes.INTERACTIVE_BUTTON,
        headerText: m.headerText || '',
        bodyText: m.bodyText || '',
        footerText: m.footerText || '',
        buttons: buttons,
        routes: m.routes || {},
      });
    }

    if (n.type === NodeTypes.INTERACTIVE_LIST) {
      const m = n.data?.meta || {};
      const list = m.list || { buttonText: 'Choose', sections: [] };

      runtimeNodes.push({
        id: n.id,
        type: NodeTypes.INTERACTIVE_LIST,
        headerText: m.headerText || '',
        bodyText: m.bodyText || '',
        footerText: m.footerText || '',
        layout: 'list',
        list: {
          buttonText: list.buttonText || 'Choose',
          sections: Array.isArray(list.sections) ? list.sections : [],
        },
        routes: m.routes || {},
      });
    }

    if (n.type === NodeTypes.COND) {
      runtimeNodes.push({
        id: n.id,
        type: NodeTypes.COND,
        logic: m.logic || [],
        trueNext: m.trueNext || null,
        falseNext: m.falseNext || null,
      });
    }

    if (n.type === NodeTypes.SHEET) {
      const m = n.data?.meta || {};
      const sheet = m.sheet || {};

      runtimeNodes.push({
        id: n.id,
        type: 'google_sheet',
        next: m.next || null,
        variable: null,
        sheet: {
          spreadsheetId: sheet.spreadsheetId || '',
          sheetName: sheet.sheetName || 'Sheet1',
          cells: sheet.cells || [],
        },
      });
    }
  }

  return {
    version: 2,
    variables,
    triggers,
    nodes: runtimeNodes,
  };
}

export const categories = [
  {
    id: 'messages',
    title: 'Messages & Replies',
    icon: <MessageSquare className="h-4 w-4" />,
    color: 'from-emerald-400 to-teal-600',
    bg: 'bg-emerald-50 border-emerald-200',
    items: [
      { label: 'Ask a Question', type: NodeTypes.ASK, icon: <HelpCircle className="h-5 w-5" /> },
      { label: 'Send Message', type: NodeTypes.SEND, icon: <MessageSquare className="h-5 w-5" /> },
      { label: 'Interactive Reply', type: NodeTypes.INTERACTIVE, icon: <Share2 className="h-5 w-5" /> },
      { label: 'Buttons', type: NodeTypes.INTERACTIVE_BUTTON, icon: <SquareCheck className="h-5 w-5" /> },
      { label: 'Lists', type: NodeTypes.INTERACTIVE_LIST, icon: <ListOrdered className="h-5 w-5" /> },
    ],
  },
  {
    id: 'logic',
    title: 'Logic & Data',
    icon: <GitBranch className="h-4 w-4" />,
    color: 'from-violet-400 to-purple-600',
    bg: 'bg-violet-50 border-violet-200',
    items: [
      { label: 'Set a Condition', type: NodeTypes.COND, icon: <GitBranch className="h-5 w-5" /> },
      { label: 'Spreadsheet Action', type: NodeTypes.SHEET, icon: <FileSpreadsheet className="h-5 w-5" /> },
    ],
  },
];

export function convertDbNodesToFlow(
  nodes: any[],
  helpers: {
    patchNode: (id: string, patch: any) => void;
    removeNode: (id: string) => void;
    variables: string[];
    updateGlobalVariables: (v: string[]) => void;
  },
) {
  return nodes.map((n, index) => ({
    id: n.id,
    type: n.type,
    position: {
      x: n.x ?? 250,
      y: n.y ?? index * 180,
    },
    data: {
      ...n,
      meta: { ...n }, // clone, don’t reference
      variables: helpers.variables,
      onPatch: (patch) => helpers.patchNode(n.id, patch),
      patch: (patch) => helpers.patchNode(n.id, patch),
      remove: () => helpers.removeNode(n.id),
      onVariableAdd: helpers.updateGlobalVariables,
    },
  }));
}

export function convertDbEdges(nodes: any[], triggers: any[] = []): Edge[] {
  const edges: Edge[] = [];

  const baseEdgeStyle = {
    animated: true,
    style: { stroke: '#6366f1', strokeWidth: 3 },
  };

  /* -------------------------------
     1️⃣ Node → Node edges
  -------------------------------- */
  for (const n of nodes) {
    // Plain "next" edge
    if (n.next) {
      edges.push({
        id: `e-${n.id}-${n.next}`,
        source: n.id,
        target: n.next,
        data: { kind: 'normal' },
        ...baseEdgeStyle,
      });
    }

    // Condition edges
    if (n.trueNext) {
      edges.push({
        id: `e-${n.id}-${n.trueNext}-true`,
        source: n.id,
        target: n.trueNext,
        sourceHandle: 'true',
        data: { kind: 'cond:true' },
        ...baseEdgeStyle,
      });
    }

    if (n.falseNext) {
      edges.push({
        id: `e-${n.id}-${n.falseNext}-false`,
        source: n.id,
        target: n.falseNext,
        sourceHandle: 'false',
        data: { kind: 'cond:false' },
        ...baseEdgeStyle,
      });
    }

    // Interactive routes (buttons / lists)
    const routes = n.routes || {};
    for (const [handleId, targetId] of Object.entries(routes)) {
      if (!targetId) continue;

      const kind = handleId === 'true' ? 'cond:true' : handleId === 'false' ? 'cond:false' : handleId === 'start' ? 'trigger:start' : 'normal';

      edges.push({
        id: `e-${n.id}-${targetId}-${handleId}`,
        source: n.id,
        target: targetId as string,
        sourceHandle: handleId,
        data: { kind },
        ...baseEdgeStyle,
      });
    }
  }

  /* -------------------------------
     2️⃣ Trigger → Start edges
  -------------------------------- */
  for (const t of triggers) {
    if (!t.start) continue;

    const triggerNodeId = t.id || `trigger_${t.start}`;

    edges.push({
      id: `e-${triggerNodeId}-${t.start}`,
      source: triggerNodeId,
      target: t.start,
      sourceHandle: 'start',
      data: { kind: 'trigger:start' },
      ...baseEdgeStyle,
    });
  }

  return edges;
}

export function convertTriggersToNodes(triggers) {
  if (!triggers || triggers.length === 0) return [];

  return triggers.map((t, i) => ({
    id: `trigger_${i}`,
    type: NodeTypes.TRIGGER,
    position: { x: 100, y: 100 + i * 200 },
    data: {
      meta: {
        keywords: t.keywords || [],
        routes: {
          start: t.start, // connect trigger → first node
        },
      },
      onPatch: () => {}, // you may patch this if needed
      remove: () => {},
    },
  }));
}

export function convertTriggerEdges(triggers) {
  if (!triggers) return [];

  return triggers.map((t, i) => ({
    id: `e_trigger_${i}`,
    source: `trigger_${i}`,
    target: t.start,
    sourceHandle: 'start',
    animated: true,
    style: { stroke: '#f97316', strokeWidth: 3 },
    data: { kind: 'trigger:start' },
  }));
}
