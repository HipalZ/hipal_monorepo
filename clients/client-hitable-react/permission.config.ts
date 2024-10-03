import type { CapacitorConfig } from "@capacitor/cli";

export interface PermCapacitorConfig extends CapacitorConfig {
  android?: {
    permissions?: string[];
    path?: string;
    webContentsDebuggingEnabled?: boolean;
  };
}
