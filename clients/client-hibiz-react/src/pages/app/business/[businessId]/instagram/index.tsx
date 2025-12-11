import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { apiRpc } from '@hi/common';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const InstagramLoginModal = () => {
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const appId = '646403858128150';
  const redirectUri = 'https://73dce91d6fff.ngrok-free.app/whatsapp/auth/instagram/callback';

  // Handle the callback after Instagram redirects back
  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (code || errorParam) {
      handleCallback();
    }
  }, [searchParams]);

  const handleCallback = async () => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (errorParam) {
      setError(`Instagram authorization failed: ${errorDescription || errorParam}`);
      return;
    }

    if (code) {
      try {
        setIsProcessing(true);
        setError(null);

        const response = await apiRpc.whatsapp.auth.instagram.callback.$post({
          json: { code },
        });

        const data = await response.json();
        console.log('data', data);
        if (response.ok && data.success) {
          navigate(`/app/business/${data.businessId}/instagram`);
        } else {
          // Token exchange failed
          throw new Error(data.error || 'Failed to connect Instagram account');
        }
      } catch (err) {
        console.error('Error during token exchange:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while connecting the Instagram account');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const loginWithInstagram = () => {
    try {
      const url = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights`;

      setError(null);
      setIsProcessing(true);

      setOpen(false);
      window.open(url, '_blank', 'width=500,height=600');
    } catch (err) {
      console.error('Error initiating Instagram login:', err);
      setError('Failed to initiate Instagram login');
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Connect Instagram</Button>

      <Dialog
        open={open || isProcessing}
        onOpenChange={(value) => {
          if (!isProcessing) {
            setOpen(value);
          }
        }}
      >
        <DialogContent>
          {error ? (
            <div className="space-y-4">
              <div className="text-sm text-red-600">
                <p>Error connecting Instagram account:</p>
                <p>{error}</p>
              </div>
              <Button onClick={() => setError(null)} className="w-full">
                Try Again
              </Button>
            </div>
          ) : isProcessing ? (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
              </div>
              <p>Processing Instagram connection...</p>
            </div>
          ) : (
            <>
              <p>Login to connect your Instagram Business account.</p>
              <Button onClick={loginWithInstagram} disabled={isProcessing} className="w-full">
                Continue with Instagram
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstagramLoginModal;
