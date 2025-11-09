import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectItem } from '@/components/ui/select';
import { apiRpc } from '@hi/common';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function GoogleSheetPopup({ open, onClose, data }) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [spreadsheets, setSpreadsheets] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [cells, setCells] = useState([{ key: '', value: '' }]);

  // 🧩 Handle Google Login (popup-based)
  const handleLogin = async () => {
    console.log('clicked on login');
    try {
      // Step 1: Get Google OAuth URL from backend
      const res = await apiRpc.google_sheets.auth.url.$get({});
      const response = await res.json();
      console.log('Response from auth URL request:', response);
      const authUrl = response.url;
      console.log('Auth URL:', authUrl);
      // Step 2: Open popup for login
      const popup = window.open(authUrl, 'googleLogin', 'width=600,height=700');

      // Step 3: Poll until closed or redirected
      const pollTimer = window.setInterval(async () => {
        try {
          if (!popup || popup.closed) {
            window.clearInterval(pollTimer);

            // Extract `code` from redirected popup
            const params = new URLSearchParams(popup?.location.search);
            const code = params.get('code');
            console.log('Authorization code:', code);
            if (code) {
              // Exchange code for tokens
              const exchangeRes = await apiRpc.google_sheets.auth.exchange.$post({
                json: { code },
              });
              const result = await exchangeRes.json();
              console.log('Exchange result:', result);
              if (result?.success) {
                setIsAuthed(true);
                await fetchSpreadsheets();
              }
            }
          }
        } catch {
          // ignore CORS issues while popup redirecting
        }
      }, 500);
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  // 📄 Fetch spreadsheet list
  const fetchSpreadsheets = async () => {
    try {
      const res = await apiRpc.google_sheets.list.$get({});
      const response = await res.json();
      setSpreadsheets(response.data || []);
    } catch (err) {
      console.error('Error fetching spreadsheets:', err);
    }
  };

  // 📄 Fetch tabs (sheet names) for a spreadsheet
  const fetchSheets = async (id) => {
    try {
      setSpreadsheetId(id);
      const res = await apiRpc.google_sheets.tabs[':spreadsheetId'].$get({
        param: { spreadsheetId: id },
      });
      const response = await res.json();
      setSheets(response.data || []);
    } catch (err) {
      console.error('Error fetching sheet tabs:', err);
    }
  };

  const handleAddCell = () => setCells([...cells, { key: '', value: '' }]);
  const handleRemoveCell = (index) => setCells(cells.filter((_, i) => i !== index));

  // 💾 Save node data to flow builder
  const handleSave = () => {
    data.onPatch({
      meta: {
        type: 'google_sheet',
        spreadsheetId,
        sheetName,
        cells,
      },
    });
    onClose();
  };

  useEffect(() => {
    if (isAuthed) fetchSpreadsheets();
  }, [isAuthed]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Google Sheets Integration</DialogTitle>
        </DialogHeader>

        {!isAuthed ? (
          <div className="space-y-4 text-center">
            <p>Connect your Google account to continue.</p>
            <Button onClick={handleLogin} className="bg-green-600 hover:bg-green-700">
              Login with Google
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-700">Spreadsheet</label>
              <Select onValueChange={fetchSheets}>
                {spreadsheets.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {sheets.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-700">Sheet Name</label>
                <Select onValueChange={setSheetName}>
                  {sheets.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            )}

            {sheetName && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Add Cell Mapping</label>
                {cells.map((cell, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      placeholder="A1"
                      value={cell.key}
                      onChange={(e) => {
                        const c = [...cells];
                        c[i].key = e.target.value;
                        setCells(c);
                      }}
                    />
                    <Input
                      placeholder="@variable or static value"
                      value={cell.value}
                      onChange={(e) => {
                        const c = [...cells];
                        c[i].value = e.target.value;
                        setCells(c);
                      }}
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
            )}

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700">
                Save
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
