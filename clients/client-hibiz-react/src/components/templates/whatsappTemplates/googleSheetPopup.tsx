import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectItem } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function GoogleSheetPopup({ open, onClose, data }) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [spreadsheets, setSpreadsheets] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [cells, setCells] = useState([{ key: '', value: '' }]);

  // STEP 1: Trigger Google login
  const handleLogin = async () => {
    window.open('/api/google/login', '_blank', 'width=600,height=600');
    // after redirect, your backend should store token in session or localStorage
    setTimeout(() => setIsAuthed(true), 2000);
  };

  // STEP 2: Fetch spreadsheet list
  useEffect(() => {
    setSpreadsheets([]);
  }, []);

  // STEP 3: Fetch sheet tabs on spreadsheet selection
  const fetchSheets = async (id) => {
    setSpreadsheetId(id);
    const res = await api.get(`/api/google/sheets/${id}/tabs`);
    setSheets(res.data);
  };

  const handleAddCell = () => setCells([...cells, { key: '', value: '' }]);
  const handleRemoveCell = (index) => setCells(cells.filter((_, i) => i !== index));

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
