export interface MJMessage {
  uri: string;
  proxy_url?: string;
  content: string;
  flags: number;
  id?: string;
  hash?: string;
  progress?: string;
  options?: MJOptions[];
  width?: number;
  height?: number;
}

export type LoadingHandler = (uri: string, progress: string) => void;
export type OnModal = (nonce: string, id: string) => Promise<string>;

export interface WaitMjEvent {
  nonce: string;
  prompt?: string;
  id?: string;
  del?: boolean; // is delete message
  onmodal?: OnModal;
}
export interface MJEmit {
  error?: Error;
  message?: MJMessage;
}

export interface MJInfo {
  subscription: string;
  jobMode: string;
  visibilityMode: string;
  fastTimeRemaining: string;
  lifetimeUsage: string;
  relaxedUsage: string;
  queuedJobsFast: string;
  queuedJobsRelax: string;
  runningJobs: string;
}

export interface MJOptions {
  label: string;
  type: number;
  style: number;
  custom: string;
}
export interface MJSettings {
  content: string;
  id: string;
  flags: number;
  options: MJOptions[];
}
export interface MJDescribe {
  id: string;
  flags: number;
  uri: string;
  proxy_url?: string;
  options: MJOptions[];
  descriptions: string[];
}

export interface MJShorten {
  description: string;
  id: string;
  flags: number;
  options: MJOptions[];
  prompts: string[];
}
