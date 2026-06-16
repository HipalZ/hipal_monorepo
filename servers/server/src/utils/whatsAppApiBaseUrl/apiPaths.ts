const whatsAppApiBaseUrl = {
  BASE_URL: 'https://graph.facebook.com/',
};

export default whatsAppApiBaseUrl;

export const isWhatsAppConfigEnabled = (whatsAppConfig?: { whatsAppEnabled?: boolean } | null) => whatsAppConfig?.whatsAppEnabled === true;

export const WHATSAPP_BUSINESS_DISABLED_MESSAGE =
  'Your WhatsApp account is currently under review. Please contact the administrator to enable your account.';
