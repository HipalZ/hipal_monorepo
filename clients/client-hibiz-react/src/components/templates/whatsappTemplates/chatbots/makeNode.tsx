import { NodeTypes } from '@/components/templates/whatsappTemplates/chatbots/chatbotHelpers';
import type { MakeNodeParams, NodeMeta } from './types';

export function makeNode({ id, type, position, patch, updateGlobalVariables, remove, variables }: MakeNodeParams): Node {
  let defaultMeta: NodeMeta;

  switch (type) {
    case NodeTypes.INTERACTIVE:
      defaultMeta = {
        layout: 'button',
        header: { type: 'none', mediaUrl: '', useUpload: false },
        bodyText: '',
        footerText: '',
        buttons: [{ id: `btn_${Math.random().toString(36).slice(2, 9)}`, type: 'reply', title: 'Option 1' }],
        list: { sections: [] },
        routes: {},
      };
      break;
    case NodeTypes.SEND:
      defaultMeta = { contentType: 'text', text: '', variable: '', mediaUrl: '', caption: '' };
      break;
    case NodeTypes.ASK:
      defaultMeta = { prompt: '', inputType: 'text', required: true, variable: '' };
      break;
    case NodeTypes.COND:
      defaultMeta = { logic: [] };
      break;
    case NodeTypes.TRIGGER:
      defaultMeta = { keywords: [] };
      break;
    case NodeTypes.SHEET:
      defaultMeta = {
        spreadsheetId: '',
        sheetName: 'Sheet1',
        cells: [{ key: 'name', value: '@userName' }],
      };
      break;
    default:
      defaultMeta = { contentType: 'text', text: '', variable: '', mediaUrl: '', caption: '' };
  }

  return {
    id,
    type,
    position,
    data: {
      id,
      onPatch: patch,
      variables,
      updateGlobalVariables,
      remove,
      meta: defaultMeta,
    },
  };
}
