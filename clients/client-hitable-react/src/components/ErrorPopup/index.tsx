// components/captain/ErrorPopup.tsx (or wherever you keep it)
import { useHiClientZ } from '@/components/store/useHiClientzData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { apiRpc } from '@hi/common';
import { useUserToken } from '@hi/common/src/useUserToken';
import { memo, useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { PiSealWarningBold } from 'react-icons/pi';
import { useError } from '../store/useError';

const CaptainReAuthFields = ({ onClose }: { onClose: () => void }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [validPhone, setValidPhone] = useState(true);
  const [validPassword, setValidPassword] = useState(true);
  const [loading, setLoading] = useState(false);

  const setCaptainData = useHiClientZ((s) => s.setCaptainData);
  const setAccessToken = useUserToken.getState().setAccessToken;
  const setRefreshToken = useUserToken.getState().setRefreshToken;

  const validPhoneNumber = useCallback(() => /^[6-9]\d{9}$/.test(phone), [phone]);

  const handleSubmit = useCallback(async () => {
    const phoneOk = validPhoneNumber();
    setValidPhone(phoneOk);
    setValidPassword(password.length > 0);
    if (!phoneOk || password.length === 0) return;

    try {
      setLoading(true);

      const res = await apiRpc.users[':id'].stafflogin.$post({
        json: {
          phone,
          password,
        },
      });

      const body = (await res.json()) as {
        data?: {
          accessToken: string;
          refreshToken: string;
          user: any;
        };
        message?: string;
      };

      if (res.status >= 400 || !body?.data) {
        toast.error(body?.message || 'Check credentials');
        return;
      }

      // success: restore captain session
      setCaptainData(body.data.user);
      setAccessToken(body.data.accessToken);
      setRefreshToken(body.data.refreshToken);

      toast.success(`Hi ${body.data.user.name}! You're back on HiClientZ`);
      onClose();
    } catch (e: any) {
      toast.error(e?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }, [phone, password, validPhoneNumber, setCaptainData, setAccessToken, setRefreshToken, onClose]);

  return (
    <div className="mx-auto mt-2 w-full max-w-md text-center">
      <h2 className="text-xl font-semibold text-red-800">Session Expired</h2>
      <h3 className="mb-4 text-lg font-semibold">Please login again</h3>

      <div className="space-y-4 p-2">
        <div>
          {!validPhone && (
            <small className="flex items-center text-[#F2634C]">
              <PiSealWarningBold />
              &nbsp; Enter a valid phone number
            </small>
          )}
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
            className={cn(
              'w-full rounded-2xl border px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2',
              validPhone ? 'border-black focus:ring-black' : 'border-red-500 focus:ring-red-500',
            )}
            placeholder="Enter phone number"
            required
          />
        </div>

        <div>
          {!validPassword && (
            <small className="flex items-center text-[#F2634C]">
              <PiSealWarningBold />
              &nbsp; Password is required
            </small>
          )}
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(
              'w-full rounded-2xl border px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2',
              validPassword ? 'border-black focus:ring-black' : 'border-red-500 focus:ring-red-500',
            )}
            placeholder="Password"
            required
          />
        </div>

        <button
          type="button"
          className="w-full rounded-2xl bg-black py-3 font-semibold text-white disabled:opacity-60"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </div>
  );
};

const MemoErrorPopup = () => {
  const openErrorModal = useError((s) => s.openErrorModal);
  const error = useError((s) => s.error);
  const resetErrorStates = useError((s) => s.resetErrorStates);
  const requireReauth = useError((s) => s.requireReauth);

  const onClose = () => {
    resetErrorStates();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  return (
    <Dialog open={openErrorModal} onOpenChange={handleOpenChange}>
      <DialogContent className="min-h-[10rem] sm:max-w-md">
        {requireReauth ? (
          <CaptainReAuthFields onClose={onClose} />
        ) : (
          <DialogHeader>
            <DialogTitle className="mt-6 text-xl font-semibold text-red-600">
              {error || 'Access denied. Please contact your administrator.'}
            </DialogTitle>
          </DialogHeader>
        )}
      </DialogContent>
    </Dialog>
  );
};

const ErrorPopup = memo(MemoErrorPopup);
export default ErrorPopup;
