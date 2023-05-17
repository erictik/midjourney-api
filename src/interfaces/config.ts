export interface MessageConfig {
  ChannelId: string;
  SalaiToken: string;
  Debug: boolean;
  Limit: number;
  MaxWait: number;
  Ws?: boolean;
}
export interface MessageConfigParam {
  ChannelId: string;
  SalaiToken: string;
  Debug?: boolean;
  Limit?: number;
  MaxWait?: number;
  Ws?: boolean;
}
export interface MidjourneyConfig extends MessageConfig {
  ServerId: string;
  SessionId: string;
}

export interface MidjourneyConfigParam extends MessageConfigParam {
  ServerId: string;
  SessionId?: string;
}
export const DefaultMessageConfig: MessageConfig = {
  ChannelId: "",
  SalaiToken: "",
  Debug: false,
  Limit: 50,
  MaxWait: 100,
};
export const DefaultMidjourneyConfig: MidjourneyConfig = {
  ...DefaultMessageConfig,
  ServerId: "",
  SessionId: "8bb7f5b79c7a49f7d0824ab4b8773a81",
};
