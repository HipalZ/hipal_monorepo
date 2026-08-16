const DEFAULT_BACKEND_BASE_URL = "https://api.hipalz.com";

const normalizeBackendBaseUrl = (value?: string) => {
  const baseUrl = value?.trim() || DEFAULT_BACKEND_BASE_URL;

  try {
    const url = new URL(baseUrl);
    return url.origin;
  } catch {
    return DEFAULT_BACKEND_BASE_URL;
  }
};

export const getBackendBaseUrl = () =>
  normalizeBackendBaseUrl(process.env.BASE_URL || Bun.env.BASE_URL);

export const buildBackendUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getBackendBaseUrl()}${normalizedPath}`;
};
