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

export interface WaitMjEvent {
  nonce: string;
  prompt?: string;
  id?: string;
  index?: number;
}
export interface WsEventMsg {
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
  type: string;
  custom: string;
}
