import useBusinessData from '@/components/store/useBusinessData';
import useWhatsapp from '@/components/store/useWhatsapp';
import { categories, edgeTypes, nodeTypes, NodeTypes } from '@/components/templates/whatsappTemplates/chatbots/chatbotHelpers';
import { makeNode } from '@/components/templates/whatsappTemplates/chatbots/makeNode';
import { PaletteItem } from '@/components/templates/whatsappTemplates/chatbots/nodePalette';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useChatBot } from '@/components/utils/chatbotHelper';
import { cn } from '@/lib/utils';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, Keyboard, PanelLeftOpen, Save, X } from 'lucide-react';
import { useCallback, useMemo, useRef, useState, type DragEvent, type MouseEvent } from 'react';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { buildFinalFromGraph } from './chatbots/chatbotHelpers';
import type {
  CategoryHeaderProps,
  CategoryItem,
  ContextMenuProps,
  ContextMenuState,
  FinalObject,
  FlowAreaProps,
  JSONPanelProps,
  Position,
  SidebarProps,
} from './chatbots/types';

const nid = (): string => `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

const useCategoryToggle = (initial: string[]) => {
  const [open, setOpen] = useState<string[]>(initial);
  const toggle = useCallback((id: string) => setOpen((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])), []);
  return { open, toggle };
};

/* -------------------------------------------------------
   MAIN EDITOR
------------------------------------------------------- */
function EditorShell(): JSX.Element {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const { createChatbot } = useChatBot();
  const setOpenBot = useWhatsapp((s) => s.setOpenBot);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const { search } = useLocation();
  const chatbotId = new URLSearchParams(search).get('chatbotId');

  const [chatbotName, setChatbotName] = useState<string>('My Chatbot');
  const [rfNodes, setRfNodes] = useState<Node[]>([]);
  const [rfEdges, setRfEdges] = useState<Edge[]>([]);
  const [variables, setVariables] = useState<string[]>([]);
  const [leftOpen, setLeftOpen] = useState<boolean>(true);

  const { open: openCategories, toggle: toggleCategory } = useCategoryToggle(['triggers', 'messages', 'logic']);

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  /* -------------------------------------------------------
     GLOBAL HELPERS
  ------------------------------------------------------- */
  const updateGlobalVariables = useCallback((newVars: string[]) => {
    setVariables((prev) => {
      const merged = Array.from(new Set([...prev, ...newVars]));
      setRfNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, variables: merged },
        })),
      );
      return merged;
    });
  }, []);

  const patchNode = useCallback(
    (id: string, patch: Record<string, unknown>) => {
      setRfNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? {
                ...n,
                data: {
                  ...n.data,
                  ...patch,
                  meta: { ...n.data.meta, ...(patch.meta || {}) },
                  remove: () => removeNode(id),
                  onVariableAdd: updateGlobalVariables,
                },
              }
            : n,
        ),
      );
    },
    [updateGlobalVariables],
  );

  const removeNode = useCallback((id: string) => {
    setRfNodes((nds) => nds.filter((n) => n.id !== id));
    setRfEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  }, []);

  /* -------------------------------------------------------
     NODE + EDGE HANDLING
  ------------------------------------------------------- */
  const onNodesChange: OnNodesChange = useCallback((changes) => setRfNodes((nds) => applyNodeChanges(changes, nds)), []);

  const onEdgesChange: OnEdgesChange = useCallback((changes) => setRfEdges((eds) => applyEdgeChanges(changes, eds)), []);

  const onConnect = useCallback((params: Connection) => {
    const id = `e-${nid()}`;
    const kind =
      params.sourceHandle === 'true'
        ? 'cond:true'
        : params.sourceHandle === 'false'
          ? 'cond:false'
          : params.sourceHandle === 'start'
            ? 'trigger:start'
            : 'normal';

    const edge: Edge = {
      ...params,
      id,
      data: { kind },
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 3 },
    };

    setRfEdges((eds) => addEdge(edge, eds));

    // 🔥 MOST IMPORTANT LOGIC — updates node routes
    setRfNodes((nds) =>
      nds.map((n) => {
        if (n.id !== params.source) return n;
        const m = n.data.meta || {};
        return {
          ...n,
          data: {
            ...n.data,
            meta: {
              ...m,
              routes: {
                ...(m.routes || {}),
                [params.sourceHandle || 'default']: params.target,
              },
            },
          },
        };
      }),
    );
  }, []);

  const addNode = useCallback(
    (type: string, position: Position): string => {
      const id = nid();
      const node = makeNode({
        id,
        type,
        position,
        variables,
        patch: (p) => patchNode(id, p),
        updateGlobalVariables,
        remove: () => removeNode(id),
      });

      setRfNodes((nds) => [...nds, node]);
      return id;
    },
    [variables, patchNode, removeNode, updateGlobalVariables],
  );

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      addNode(type, position);
    },
    [screenToFlowPosition, addNode],
  );

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  /* -------------------------------------------------------
     CONTEXT MENU LOGIC
  ------------------------------------------------------- */
  const openContextMenu = useCallback((event: MouseEvent, node: Node) => {
    event.preventDefault();
    const target = (event.target as HTMLElement).closest('[data-handleid]') as HTMLElement;
    if (target && target.getAttribute('data-handlepos') !== 'right') return;

    const rect = target ? target.getBoundingClientRect() : (event.target as HTMLElement).getBoundingClientRect();

    setContextMenu({
      nodeId: node.id,
      handleId: target?.getAttribute('data-handleid') || null,
      clientX: rect.right,
      clientY: rect.top,
    });
  }, []);

  const addNodeFromContext = useCallback(
    (item: CategoryItem, contextMenu: ContextMenuState) => {
      const pos = screenToFlowPosition({
        x: contextMenu.clientX + 80,
        y: contextMenu.clientY - 80,
      });

      const newNodeId = addNode(item.type, pos);

      const newEdge: Edge = {
        id: `e-${contextMenu.nodeId}-${newNodeId}`,
        source: contextMenu.nodeId,
        target: newNodeId,
        sourceHandle: contextMenu.handleId || undefined,
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 3 },
        data: {
          kind:
            contextMenu.handleId === 'true'
              ? 'cond:true'
              : contextMenu.handleId === 'false'
                ? 'cond:false'
                : contextMenu.handleId === 'start'
                  ? 'trigger:start'
                  : 'normal',
        },
      } as Edge;

      setRfEdges((eds) => addEdge(newEdge, eds));

      setRfNodes((nds) =>
        nds.map((n) =>
          n.id === contextMenu.nodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  meta: {
                    ...(n.data.meta || {}),
                    routes: {
                      ...(n.data.meta?.routes || {}),
                      [contextMenu.handleId || 'next']: newNodeId,
                    },
                  },
                },
              }
            : n,
        ),
      );

      toast.success(`${item.label} connected via "${contextMenu.handleId || 'default'}"`);
      setContextMenu(null);
    },
    [addNode, screenToFlowPosition],
  );

  /* -------------------------------------------------------
     FINAL JSON PREVIEW
  ------------------------------------------------------- */
  const finalObject: FinalObject = useMemo(
    () => ({
      chatbotName,
      businessId,
      ...buildFinalFromGraph(rfNodes, rfEdges),
    }),
    [chatbotName, businessId, rfNodes, rfEdges],
  );

  const handleSaveFlow = useCallback(() => {
    createChatbot(finalObject);
  }, [finalObject, createChatbot]);

  const handleOpenChatbot = useCallback(() => setOpenBot(false), [setOpenBot]);

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */
  return (
    <div className="inter flex h-full w-full overflow-hidden bg-gray-50">
      {/* LEFT SIDEBAR */}
      <Sidebar
        leftOpen={leftOpen}
        setLeftOpen={setLeftOpen}
        chatbotName={chatbotName}
        setChatbotName={setChatbotName}
        categories={categories}
        openCategories={openCategories}
        toggleCategory={toggleCategory}
        handleOpenChatbot={handleOpenChatbot}
        handleSaveFlow={handleSaveFlow}
        disablePublish={rfNodes.length === 0 || rfEdges.length === 0}
      />

      {/* MAIN FLOW AREA */}
      <FlowArea
        rfNodes={rfNodes}
        rfEdges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        contextMenu={contextMenu}
        openContextMenu={openContextMenu}
        setContextMenu={setContextMenu}
        addNodeFromContext={addNodeFromContext}
        categories={categories}
      />

      {/* OUTPUT JSON */}
      <JSONPanel finalObject={finalObject} />
    </div>
  );
}

/* -------------------------------------------------------
   SIDEBAR COMPONENT
------------------------------------------------------- */
function Sidebar({
  leftOpen,
  setLeftOpen,
  chatbotName,
  setChatbotName,
  categories,
  openCategories,
  toggleCategory,
  handleOpenChatbot,
  handleSaveFlow,
  disablePublish,
}: SidebarProps): JSX.Element {
  return (
    <div className={cn('relative flex-shrink-0 border-r border-gray-200 bg-white transition-all duration-300', leftOpen ? 'w-80 shadow-xl' : 'w-12')}>
      <div role="button" tabIndex={0} onClick={() => setLeftOpen((v) => !v)} className="absolute right-[-18px] top-6 z-10">
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-white shadow-lg hover:text-blue-600">
          {leftOpen ? <ChevronLeft /> : <PanelLeftOpen />}
        </Button>
      </div>

      {leftOpen && (
        <div className="flex h-[90dvh] flex-col">
          <Card className="rounded-none border-b border-gray-100 bg-slate-50 shadow-none">
            <CardHeader className="p-4 pb-3">
              <div className="mb-3 flex items-center gap-2">
                <ChevronsLeft onClick={handleOpenChatbot} className="h-8 w-8 cursor-pointer hover:text-blue-600" />
                <CardTitle className="text-2xl font-semibold">Chat Bot Flow Editor</CardTitle>
              </div>
              <Input value={chatbotName} onChange={(e) => setChatbotName(e.target.value)} placeholder="Flow name..." className="h-9 text-sm" />
            </CardHeader>
          </Card>

          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            <span className="text-sm font-semibold text-slate-600">Node Palette</span>
            <div className="space-y-4">
              <PaletteItem label="Trigger Keyword" type={NodeTypes.TRIGGER} icon={<Keyboard />} gradient="from-orange-400 to-red-500" />

              {categories.map((category) => {
                const isOpen = openCategories.includes(category.id);
                return (
                  <motion.div key={category.id} layout className={cn('overflow-hidden rounded-xl border bg-white shadow-sm', category.bg)}>
                    <button
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-white/60"
                    >
                      <CategoryHeader category={category} />
                      {isOpen ? <ChevronDown /> : <ChevronRight />}
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="border-t p-4 pb-5">
                          {category.items.map((item, idx) => (
                            <motion.div
                              key={item.type}
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                            >
                              <PaletteItem label={item.label} type={item.type} icon={item.icon} gradient={category.color} />
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="shadow-up border-t bg-white p-4">
            <Button disabled={disablePublish} onClick={handleSaveFlow} className="w-full bg-blue-600 hover:bg-blue-700">
              <Save className="mr-2 h-4 w-4" /> Publish Flow
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------
   FLOW AREA COMPONENT
------------------------------------------------------- */
function FlowArea({
  rfNodes,
  rfEdges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onDrop,
  onDragOver,
  nodeTypes,
  edgeTypes,
  contextMenu,
  openContextMenu,
  setContextMenu,
  addNodeFromContext,
  categories,
}: FlowAreaProps): JSX.Element {
  return (
    <div className="relative h-[85dvh] flex-1">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-gray-100"
        proOptions={{ hideAttribution: true }}
        onNodeContextMenu={openContextMenu}
        onPaneClick={() => setContextMenu(null)}
        onNodeClick={() => setContextMenu(null)}
      >
        <Background variant="dots" gap={12} size={1} className="bg-gray-50" />
        <Controls className="rounded-lg border bg-white shadow-lg" />

        {contextMenu && (
          <ContextMenu categories={categories} contextMenu={contextMenu} setContextMenu={setContextMenu} addNodeFromContext={addNodeFromContext} />
        )}
      </ReactFlow>
    </div>
  );
}

/* -------------------------------------------------------
   CONTEXT MENU COMPONENT
------------------------------------------------------- */
function ContextMenu({ categories, contextMenu, setContextMenu, addNodeFromContext }: ContextMenuProps): JSX.Element {
  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" onClick={() => setContextMenu(null)}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="pointer-events-auto absolute max-h-[50vh] w-96 overflow-y-auto rounded-2xl border-4 bg-white p-6 shadow-2xl"
        style={{ left: contextMenu.clientX + 10, top: contextMenu.clientY + 10 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Add Node via {contextMenu.handleId ?? 'Default'}</h3>
          <button type="button" onClick={() => setContextMenu(null)} className="rounded-full p-2 hover:bg-gray-100">
            <X />
          </button>
        </div>

        {categories.map((category) => (
          <div key={category.id} className="space-y-3">
            <CategoryHeader category={category} />

            <div className="grid grid-cols-2 gap-3 pl-1">
              {category.items.map((item) => (
                <button
                  type="button"
                  key={item.type}
                  onClick={() => addNodeFromContext(item, contextMenu)}
                  className="group flex flex-col items-center gap-3 rounded-xl border bg-gradient-to-br from-gray-50 p-4 transition-all hover:scale-105"
                >
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white shadow-lg`}>
                    {item.icon}
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function CategoryHeader({ category }: CategoryHeaderProps): JSX.Element {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center text-white shadow-md`}>
        {category.icon}
      </div>
      <h4 className="font-semibold text-gray-700">{category.title}</h4>
      <span className="ml-2 text-xs text-gray-500">{category.items.length}</span>
    </div>
  );
}

/* -------------------------------------------------------
   JSON PANEL COMPONENT
------------------------------------------------------- */
function JSONPanel({ finalObject }: JSONPanelProps): JSX.Element {
  return (
    <Card className="h-full max-w-xs flex-shrink-0 overflow-y-auto rounded-none border-0 shadow-lg">
      <CardHeader className="border-b p-3">
        <CardTitle className="text-sm font-semibold">Output JSON</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <pre className="max-h-[85vh] overflow-auto rounded-lg bg-slate-900 p-3 font-mono text-xs text-slate-200">
          {JSON.stringify(finalObject, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------
   EXPORT
------------------------------------------------------- */
export default function WhatsAppChatBot(): JSX.Element {
  return (
    <ReactFlowProvider>
      <EditorShell />
    </ReactFlowProvider>
  );
}
