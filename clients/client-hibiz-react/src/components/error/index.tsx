// components/ErrorPopup.tsx
import { useOwnerLogin } from '@/components/store/useOwnerLogin';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/components/utils/helper';
import { apiRpc } from '@hi/common';
import { useUserToken } from '@hi/common/src/useUserToken';
import { memo, useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { PiSealWarningBold } from 'react-icons/pi';
import PopUp from '../atom/popUp';
import { useError } from '../store/useError';

const ReAuthFields = ({ onClose }: { onClose: () => void }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [validPhone, setValidPhone] = useState(true);
  const [validPassword, setValidPassword] = useState(true);
  const [loading, setLoading] = useState(false);

  const { setUser } = useOwnerLogin((s) => ({ setUser: s.setUser }));
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
      const response = await apiRpc.users.ownerSignIn.$post({
        query: { verifyOtp: 'false' },
        json: { phone, password },
      });

      const user = (await response.json()) as {
        data?: {
          accessToken: string;
          refreshToken: string;
          user: any;
        };
        message?: string;
      };

      if (response.status >= 400) {
        toast.error(user?.message || 'Check credentials');
        return;
      }

      // success
      setAccessToken(user!.data!.accessToken);
      setRefreshToken(user!.data!.refreshToken);
      setUser(user!.data!.user);
      toast.success('Logged in successfully');
      onClose(); // close the error modal
    } catch (e: any) {
      toast.error(e?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }, [phone, password, validPhoneNumber, setAccessToken, setRefreshToken, setUser, onClose]);

  return (
    <div className="mx-auto mt-6 w-full max-w-md text-center">
      <h2 className="text-xl font-semibold text-red-800">Session Has Been Expired</h2>
      <h3 className="mb-4 text-lg font-semibold">Please login again</h3>

      <div className="space-y-4 p-4">
        <div>
          {!validPhone && (
            <small className="flex items-center text-[#F2634C]">
              <PiSealWarningBold />
              &nbsp; Enter a valid number
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
  console.log('Rendering ErrorPopup:', { openErrorModal, error, requireReauth });

  const onClose = () => {
    resetErrorStates();
  };

  return (
    <PopUp
      hide={requireReauth}
      rightTopBack={!requireReauth}
      width="w-[30rem]"
      height="h-[50dvh] lg:h-[22rem]"
      onClose={onClose}
      show={openErrorModal}
    >
      {requireReauth ? (
        <ReAuthFields onClose={onClose} />
      ) : (
        <Card className="mx-auto mt-12 w-full max-w-md border-none text-center shadow-none">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-red-600">{error}</CardTitle>
          </CardHeader>
        </Card>
      )}
    </PopUp>
  );
};

const ErrorPopup = memo(MemoErrorPopup);
export default ErrorPopup;
