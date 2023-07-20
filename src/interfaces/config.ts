import WebSocket from "isomorphic-ws";

export type FetchFn = typeof fetch;
export type WebSocketCl = typeof WebSocket;
export const MJBot = "936929561302675456";
export const NijiBot = "1022952195194359889";
export interface MJConfig {
  ChannelId: string;
  SalaiToken: string;
  BotId: typeof MJBot | typeof NijiBot;
  Debug: boolean;
  Limit: number;
  MaxWait: number;
  SessionId: string;
  ServerId?: string;
  Ws?: boolean;
  Remix?: boolean;
  HuggingFaceToken?: string;
  DiscordBaseUrl: string;
  WsBaseUrl: string;
  fetch: FetchFn;
  ApiInterval: number;
  WebSocket: WebSocketCl;
  ImageProxy: string;
}
export interface MJConfigParam {
  SalaiToken: string; //DISCORD_TOKEN
  ChannelId?: string; //DISCORD_CHANNEL_ID
  ServerId?: string; //DISCORD_SERVER_ID
  BotId?: typeof MJBot | typeof NijiBot; //DISCORD_BOT_ID MJBot OR NijiBot
  Debug?: boolean; // print log
  ApiInterval?: number; //ApiInterval request api interval
  Limit?: number; //Limit of get message list
  MaxWait?: number;
  Ws?: boolean; //Ws:true use websocket get discord message (ephemeral message)
  HuggingFaceToken?: string; //HuggingFaceToken for verify human
  SessionId?: string;
  DiscordBaseUrl?: string;
  ImageProxy?: string;
  WsBaseUrl?: string;
  fetch?: FetchFn; //Node.js<18 need node.fetch Or proxy
  WebSocket?: WebSocketCl; //isomorphic-ws Or proxy
}

export const DefaultMJConfig: MJConfig = {
  BotId: MJBot,
  ChannelId: "1077800642086703114",
  SalaiToken: "",
  ApiInterval: 350,
  SessionId: "8bb7f5b79c7a49f7d0824ab4b8773a81",
  Debug: false,
  Limit: 50,
  Ws: true,
  MaxWait: 200,
  ImageProxy: "",
  DiscordBaseUrl: "https://discord.com",
  WsBaseUrl: "wss://gateway.discord.gg/?encoding=json&v=9",
  fetch: fetch,
  WebSocket: WebSocket,
};
