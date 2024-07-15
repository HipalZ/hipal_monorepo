import { useCallback } from 'react';
import toast from 'react-hot-toast';

interface ZodError {
  issues: Array<{
    validation: string;
    code: string;
    message: string;
    path: Array<string | number>;
  }>;
  name: string;
}

const useShowErrorToasts = () => {
  return useCallback((error: ZodError) => {
    error.issues.forEach(issue => {
      toast.error(issue.message);
    });
  }, []);
};

export default useShowErrorToasts;
