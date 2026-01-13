import { fromZodError } from "zod-validation-error";
import { ZodError } from "zod";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const transformZodError = (e: ZodError) => {
  const error = fromZodError(e);
  toast.error(error.message);
  return error;
};

export function cn(...classes: ClassValue[]) {
  return twMerge(clsx(...classes));
}

export const handleCatchErrors = (e: unknown) => {
  if (e instanceof ZodError) {
    const validationError = fromZodError(e);
    return toast.error(validationError.message);
  }
  if (e instanceof AxiosError) return toast.error(e?.response?.data?.message || e?.response?.data?.error || e?.message || "Failed to Login!");

  if (e instanceof Error) return toast.error(e?.message || "Some Unexpected Error has occurred!");
};
