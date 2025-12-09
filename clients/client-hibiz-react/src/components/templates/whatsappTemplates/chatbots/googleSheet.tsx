import useBusinessData from '@/components/store/useBusinessData';
import type { SendNodeProps } from '@/components/templates/whatsappTemplates/chatbots/types';
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
import { lazy, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { v4 as uuid } from 'uuid';

const DeleteButton = lazy(() => import('../deleteButton'));

export default function GoogleSheetNode({ data, selected }: SendNodeProps) {
  const businessId = useBusinessData((s) => s?.outletInfo?.businessId);

  const [isAuthed, setIsAuthed] = useState(false);
  const [sessionKey, setSessionKey] = useState(uuid());

  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [selectedSpreadsheetName, setSelectedSpreadsheetName] = useState('');
  const [sheets, setSheets] = useState([]);
  const [sheetName, setSheetName] = useState('');
  const [cells, setCells] = useState([{ key: '', value: '' }]);

  const pollRef = useRef<any>(null);
  const pollAttempts = useRef(0);

  const { submitToSheet } = useSubmitGoogleSheet();

  /* ----------------------------------------------------------------------------
   * 🟢 LOGIN + CONTROLLED POLLING FOR STATUS
   * -------------------------------------------------------------------------- */
  const handleLogin = async () => {
    try {
      const res = await apiRpc.google_sheets.auth.url.$get({
        query: { businessId, sessionKey },
      });

      const { url } = await res.json();
      const popup = window.open(url, 'googleLogin', 'width=600,height=700');

      // Clear any existing interval
      if (pollRef.current) clearInterval(pollRef.current);
      pollAttempts.current = 0;

      pollRef.current = setInterval(async () => {
        pollAttempts.current++;

        const statusRes = await apiRpc.google_sheets.status.$get({
          query: { businessId, sessionKey },
        });

        const { loggedIn } = await statusRes.json();

        // If success
        if (loggedIn) {
          clearInterval(pollRef.current);
          pollRef.current = null;

          popup?.close();
          setIsAuthed(true);
          refetch();
        }

        // If popup closed manually
        if (popup?.closed) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }

        // Timeout after 60 seconds
        if (pollAttempts.current > 30) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }, 2000);
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  /* ----------------------------------------------------------------------------
   * 🟡 FETCH SHEETS INSIDE SPREADSHEET
   * -------------------------------------------------------------------------- */
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

      // 🟢 AFTER SHEETS API SUCCEEDS → RECHECK STATUS
      const statusCheck = await apiRpc.google_sheets.status.$get({
        query: { businessId, sessionKey },
      });
      const { loggedIn } = await statusCheck.json();
      if (loggedIn) setIsAuthed(true);
    } catch (err) {
      console.error('Error fetching sheet tabs:', err);
    }
  };

  /* ----------------------------------------------------------------------------
   * 🟤 FETCH USER SHEETS (TRIGGERED ONLY WHEN AUThed)
   * -------------------------------------------------------------------------- */
  const { data: spreadsheets = [], refetch } = useQuery({
    queryKey: ['googleSheetsList'],
    queryFn: async () => {
      const res = await apiRpc.google_sheets.sheets.$get({
        query: { businessId, sessionKey },
      });

      const json = await res.json();

      // 🟢 IF FETCH SUCCESS, RECHECK STATUS
      const statusRes = await apiRpc.google_sheets.status.$get({
        query: { businessId, sessionKey },
      });
      const { loggedIn } = await statusRes.json();
      if (loggedIn) setIsAuthed(true);

      return json.data || [];
    },
    enabled: isAuthed,
    refetchOnWindowFocus: false,
  });

  /* ----------------------------------------------------------------------------
   * 🔥 CLEANUP (Avoid infinite polling)
   * -------------------------------------------------------------------------- */
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  /* ----------------------------------------------------------------------------
   * 🔵 ADD CELL
   * -------------------------------------------------------------------------- */
  const handleAddCell = () => setCells([...cells, { key: '', value: '' }]);
  const handleRemoveCell = (i: number) => setCells(cells.filter((_, index) => index !== i));

  /* ----------------------------------------------------------------------------
   * 🔴 SAVE TO NODE META + SHEET APPEND
   * -------------------------------------------------------------------------- */
  const handleSave = async () => {
    try {
      if (!spreadsheetId || !sheetName) {
        toast.error('Please select spreadsheet & sheet name');
        return;
      }

      data.onPatch({
        meta: {
          type: 'google_sheet',
          sheet: { spreadsheetId, sheetName, cells },
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
      console.error(err);
      toast.error('Failed to save');
    }
  };

  /* ----------------------------------------------------------------------------
   * RENDER UI
   * -------------------------------------------------------------------------- */
  if (spreadsheets.length === 0 && isAuthed) {
    return (
      <div className="text-center">
        <p>No Google Sheets found.</p>
        <p>Create one & refresh.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="z-50 !h-5 !w-5 !border-4 !border-white !bg-gray-600 shadow-xl" />

      <DeleteButton data={data} />

      <Card className={cn('w-96 border-2 shadow-2xl transition-all', selected ? 'border-blue-500 ring-4 ring-blue-300/30' : 'border-gray-300')}>
        <div className="flex items-center gap-3 rounded-t-lg bg-gradient-to-r from-green-600 to-emerald-600 p-5 text-white">
          <MessageCircle className="h-6 w-6" />
          <h3 className="text-lg font-bold">Google Spreadsheet</h3>
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
              {/* Spreadsheet */}
              <div>
                <label className="text-xs font-medium text-gray-700">Spreadsheet</label>
                <Select value={spreadsheetId} onValueChange={fetchSheets}>
                  <SelectTrigger className="w-full">
                    <span>{selectedSpreadsheetName || 'Select Spreadsheet'}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {spreadsheets.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tabs */}
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

              {/* Cell Mapping */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Add Cell Mapping</label>

                {cells.map((cell, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      placeholder="A1"
                      value={cell.key}
                      onChange={(e) => {
                        const copy = [...cells];
                        copy[i].key = e.target.value;
                        setCells(copy);
                      }}
                    />

                    <VariableDropdown
                      value={cell.value}
                      onChange={(v) => {
                        const copy = [...cells];
                        copy[i].value = v;
                        setCells(copy);
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

      <Handle id="next" type="source" position={Position.Right} className="z-50 !h-[0.75rem] !w-[0.75rem] bg-gray-400" />
    </div>
  );
}
