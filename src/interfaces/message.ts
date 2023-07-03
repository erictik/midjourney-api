export interface MJMessage {
  uri: string;
  content: string;
  flags: number;
  id?: string;
  hash?: string;
  progress?: string;
  options?: MJOptions[];
}

export type LoadingHandler = (uri: string, progress: string) => void;
export type OnModal = (nonce: string, id: string) =>  Promise<string>;

export interface WaitMjEvent {
  nonce: string;
  prompt?: string;
  id?: string;
  onmodal?:OnModal
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
