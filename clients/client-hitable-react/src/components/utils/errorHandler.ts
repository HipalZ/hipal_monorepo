import { ZodError } from 'zod';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { fromZodError } from 'zod-validation-error';

export type FormattedError = Record<string, string>;

export const handleZodErrors = (error: ZodError): FormattedError => {
  if (!error) return {};
  const formattedError = error.format();
  const errors: FormattedError = {};

  for (const key in formattedError) {
    if (key === '_errors') continue;
    const fieldError = formattedError[key as keyof typeof formattedError];
    errors[key] = fieldError ? ('_errors' in fieldError ? (fieldError._errors as string) : '') : '';
  }

  return errors;
};

export type ExtendedError =
  | {
      name: string;
      meta: any;
    }
  | {
      schema: string;
      detail: string;
      code: number;
    }
  | AxiosError
  | ZodError
  | Error
  | unknown;

export function handleCatchErrors<X extends ExtendedError>(e: X, cb?: () => void): X | void {
  if (!cb) cb = () => {};
  let err = {
    message: '500: Some Unexpected Error has occurred!',
    code: 500,
    cause: 'Internal Server Error',
  };
  console.log({ e });
  if (e instanceof ZodError) {
    const validationError = fromZodError(e);
    toast.error(validationError.message);
  } else if (e instanceof AxiosError) {
    err = { message: e?.response?.data?.error || e?.response?.data?.message || e?.message || 'API: Failed to Login!', code: 400, cause: 'API Error' };
    toast.error(err.message);
    if (e.response?.data?.statusCode === 403) return cb();
    return;
  } else if (e && typeof e === 'object' && 'name' in e && 'meta' in e && e?.name === 'TRPCClientError') {
    if ((e?.meta as any).responseJSON?.error?.message?.includes('403')) {
      return cb();
    }
    err = {
      message:
        (e?.meta as any).responseJSON[0]?.error?.message?.at?.(0)?.message ||
        (e?.meta as any).responseJSON[0]?.error?.message ||
        (e?.meta as any).responseJSON?.error?.message ||
        (e?.meta as any).responseJSON?.error ||
        'RPC Error!',
      code: 400,
      cause: 'TRPC Error',
    };
    toast.error(err.message);
  } else if (e && typeof e === 'object' && 'schema' in e && 'detail' in e && 'code' in e && e?.schema === 'public') {
    err = {
      cause: 'Payload Error: Invalid fields or missing required fields!',
      message: e?.detail as string,
      code: e?.code as number,
    };
    toast.error(err.message);
  }

  return e;
}

export const transformZodError = (e: ZodError) => fromZodError(e);
