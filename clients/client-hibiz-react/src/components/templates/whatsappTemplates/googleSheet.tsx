import useBusinessData from '@/components/store/useBusinessData';
import { VariableDropdown } from '@/components/templates/whatsappTemplates/chatbots/variableDropDown';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { useSubmitGoogleSheet } from '@/hooks/useChatbot';
import { cn } from '@/lib/utils';
import { apiRpc } from '@hi/common';
import { useQuery } from '@tanstack/react-query';
import { Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { MessageCircle, Plus, X } from 'lucide-react';
import { lazy, useState } from 'react';
import toast from 'react-hot-toast';
import { v4 as uuid } from 'uuid';
import type { SendNodeProps } from './chatbots/chatbotHelpers';

const DeleteButton = lazy(() => import('./deleteButton'));

export default function GoogleSheetNode({ data, selected }: SendNodeProps) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [selectedSpreadsheetName, setSelectedSpreadsheetName] = useState('');
  const [sheets, setSheets] = useState([]);
  const [sheetName, setSheetName] = useState('');
  const [cells, setCells] = useState([{ key: '', value: '' }]);
  const { submitToSheet } = useSubmitGoogleSheet();
  const businessId = useBusinessData((state) => state?.outletInfo?.businessId);
  const [sessionKey, setSessionKey] = useState(uuid());
  /* -------------------------------------------------------------------------- */
  /* 🟢 GOOGLE LOGIN */
  /* -------------------------------------------------------------------------- */
  const handleLogin = async () => {
    try {
      const res = await apiRpc.google_sheets.auth.url.$get({
        query: { businessId, sessionKey: sessionKey },
      });
      const { url } = await res.json();
      const popup = window.open(url, 'googleLogin', 'width=600,height=700');

      const poll = setInterval(async () => {
        const statusRes = await apiRpc.google_sheets.status.$get({
          query: { businessId, sessionKey: sessionKey },
        });
        const { loggedIn } = await statusRes.json();

        if (loggedIn) {
          clearInterval(poll);
          popup?.close();
          setIsAuthed(true);
          refetch();
        }
      }, 10000);
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 🟡 FETCH TABS INSIDE SPREADSHEET */
  /* -------------------------------------------------------------------------- */
  const fetchSheets = async (id: string) => {
    try {
      setSpreadsheetId(id);
      const selected = spreadsheets.find((s) => s.id === id);
      setSelectedSpreadsheetName(selected?.name || '');

      const res = await apiRpc.google_sheets.sheets[':id'].tabs.$get({
        param: { id },
        query: { businessId, sessionKey },
      });

      const json = await res.json();
      setSheets(json.data || []);
    } catch (err) {
      console.error('Error fetching sheet tabs:', err);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 🔵 ADD / REMOVE CELLS */
  /* -------------------------------------------------------------------------- */
  const handleAddCell = () => setCells([...cells, { key: '', value: '' }]);
  const handleRemoveCell = (index: number) => setCells(cells.filter((_, i) => i !== index));

  /* -------------------------------------------------------------------------- */
  /* 🔴 SAVE GOOGLE SHEET DATA INTO NODE META */
  /* -------------------------------------------------------------------------- */
  const handleSave = async () => {
    try {
      if (!spreadsheetId || !sheetName) {
        toast.error('Please select spreadsheet & sheet name');
        return;
      }

      data.onPatch({
        meta: {
          type: 'google_sheet',
          sheet: {
            spreadsheetId,
            sheetName,
            cells,
          },
        },
      });

      toast.success('Google Sheet config saved');

      const payload = {
        spreadsheetId,
        range: `${sheetName}!A1`,
        cells,
        storeVariables: data.variablesMap || {},
        sessionKey,
        businessId,
      };

      await submitToSheet(payload);
      toast.success('Sheet updated successfully');
    } catch (err) {
      console.error('Sheet submit error:', err);
      toast.error('Failed to save');
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 🟤 FETCH USER SHEETS */
  /* -------------------------------------------------------------------------- */
  const { data: spreadsheets = [], refetch } = useQuery({
    queryKey: ['googleSheetsList'],
    queryFn: async () => {
      const res = await apiRpc.google_sheets.sheets.$get({
        query: { businessId, sessionKey },
      });
      const response = await res.json();
      return response.data || [];
    },
    enabled: isAuthed,
    refetchOnWindowFocus: false,
  });

  if (spreadsheets.length === 0 && isAuthed) {
    return (
      <div className="text-center">
        <p>No Google Sheets found in your account.</p>
        <p>Please create one and refresh.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Incoming connection */}
      <Handle type="target" position={Position.Left} className="z-50 !h-5 !w-5 !border-4 !border-white !bg-gray-600 shadow-xl" />

      <DeleteButton data={data} />

      <Card className={cn('w-96 border-2 shadow-2xl transition-all', selected ? 'border-blue-500 ring-4 ring-blue-300/30' : 'border-gray-300')}>
        {/* Header */}
        <div className="rounded-t-lg bg-gradient-to-r from-green-600 to-emerald-600 p-5 text-white">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6" />
            <h3 className="text-lg font-bold">Google Spreadsheet</h3>
          </div>
        </div>

        <CardContent className="space-y-5 p-4">
          {!isAuthed ? (
            <div className="space-y-4 text-center">
              <p>Connect your Google account to continue.</p>
              <Button onClick={handleLogin} className="bg-green-600 hover:bg-green-700">
                Login with Google
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Spreadsheet selector */}
              <div>
                <label className="text-xs font-medium text-gray-700">Spreadsheet</label>
                <Select value={spreadsheetId} onValueChange={fetchSheets}>
                  <SelectTrigger className="w-full">
                    <span>{selectedSpreadsheetName || 'Select Spreadsheet'}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {spreadsheets?.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sheet name dropdown */}
              {sheets.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-700">Sheet Name</label>
                  <Select value={sheetName} onValueChange={setSheetName}>
                    <SelectTrigger className="w-full">
                      <span>{sheetName || 'Select Sheet'}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {sheets.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Cell mapping */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Add Cell Mapping</label>
                {cells.map((cell, i) => (
                  <div key={i?.toString()} className="flex items-center gap-2">
                    <Input
                      placeholder="A1"
                      value={cell.key}
                      onChange={(e) => {
                        const c = [...cells];
                        c[i].key = e.target.value;
                        setCells(c);
                      }}
                    />
                    <VariableDropdown
                      value={cell.value}
                      onChange={(v) => {
                        const c = [...cells];
                        c[i].value = v;
                        setCells(c);
                      }}
                      variables={data.variables || []}
                      flowParams={(data.variables || []).map((x) => `@${x}`)}
                      placeholder="Select variable"
                    />

                    <Button size="icon" variant="ghost" onClick={() => handleRemoveCell(i)}>
                      <X />
                    </Button>
                  </div>
                ))}

                <Button onClick={handleAddCell} variant="outline">
                  <Plus className="mr-1" /> Add Cell
                </Button>
              </div>

              {/* Save */}
              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700">
                  Save
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* OUTGOING connection handle (IMPORTANT) */}
      <Handle id="next" type="source" position={Position.Right} className="z-50 !h-[0.75rem] !w-[0.75rem] bg-gray-400" />
    </div>
  );
}
