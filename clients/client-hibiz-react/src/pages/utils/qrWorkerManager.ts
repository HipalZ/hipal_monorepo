import type { ITable } from "@/components/store/useZone.ts";
import type { QRWorkerResponse } from "./qrWorker.ts";

// Define resolver type
type Resolver = {
  resolve: (blobUrl: string) => void;
  reject: (reason?: any) => void;
};

let pendingJobs = 0;
const resolvers = new Map<string, Resolver>();

// Create worker with Vite's worker syntax
const worker = new Worker(new URL('./qrWorker.ts', import.meta.url), {
  type: 'module',
  name: 'qr-worker'
});

// Define worker message handler
worker.onmessage = (event: MessageEvent<QRWorkerResponse>) => {
  const { jobId, blobUrl, error } = event.data;
  pendingJobs--;
  
  const resolver = resolvers.get(jobId);
  if (!resolver) return;
  
  if (blobUrl) {
    resolver.resolve(blobUrl);
  } else if (error) {
    resolver.reject(new Error(error));
  }
  
  resolvers.delete(jobId);
};

export const generateQR = (table:ITable): Promise<string> => {
  pendingJobs++;
  const jobId = `${table.name}-${Date.now()}`;
  
  return new Promise((resolve, reject) => {
    resolvers.set(jobId, { resolve, reject });
    worker.postMessage({ 
      table: {
        ...table,
        jobId
      }
    });
  });
};

export const hasPendingJobs = () => pendingJobs > 0;

export const terminateWorker = () => {
  worker.terminate();
};