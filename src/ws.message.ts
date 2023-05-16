import WebSocket from "ws";
import { createInflate, Inflate, constants as ZlibConstants } from "zlib";
import {
  MessageConfig,
  MessageConfigParam,
  DefaultMessageConfig,
} from "./interfaces";

export class WsMessage {
  DISCORD_GATEWAY =
    "wss://gateway.discord.gg/?v=9&encoding=json&compress=zlib-stream";
  ws: WebSocket;
  MJId = "936929561302675456";
  private zlibChunks: Buffer[] = [];
  public config: MessageConfig;
  private inflate: Inflate;
  private event: Array<{ event: string; callback: (message: any) => void }> =
    [];
  private reconnectTime: boolean[] = [];
  private heartbeatInterval = 0;

  constructor(defaults: MessageConfigParam) {
    const { ChannelId, SalaiToken } = defaults;
    if (!ChannelId || !SalaiToken) {
      throw new Error("ChannelId and SalaiToken are required");
    }

    this.config = {
      ...DefaultMessageConfig,
      ...defaults,
    };
    this.ws = new WebSocket(this.DISCORD_GATEWAY);
    this.ws.on("open", this.open.bind(this));

    this.ws.on("message", this.incomingMessage.bind(this));

    this.inflate = createInflate({ flush: ZlibConstants.Z_SYNC_FLUSH });
    this.inflate.on("data", (data) => this.zlibChunks.push(data));
  }

  private reconnect() {
    //reconnect
    this.ws = new WebSocket(this.DISCORD_GATEWAY);
    this.ws.on("open", this.open.bind(this));
  }

  private async heartbeat(num: number) {
    if (this.reconnectTime[num]) return;
    if (this.ws.readyState !== WebSocket.OPEN) return;
    this.heartbeatInterval++;
    this.ws.send(
      JSON.stringify({
        op: 1,
        d: this.heartbeatInterval,
      })
    );
    await this.timeout(1000 * 40);
    this.heartbeat(num);
  }
  private async open() {
    const num = this.reconnectTime.length;
    this.log("open", num);
    this.reconnectTime.push(false);
    this.auth();
    this.ws.onclose = (event: WebSocket.CloseEvent) => {
      this.log("close", event);
      this.reconnectTime[num] = true;
      this.reconnect();
    };
    await this.timeout(1000 * 10);
    this.heartbeat(num);
  }
  private auth() {
    this.ws.send(
      JSON.stringify({
        op: 2,
        d: {
          token: this.config.SalaiToken,
          capabilities: 8189,
          properties: {
            os: "Mac OS X",
            browser: "Chrome",
            device: "",
          },
          compress: false,
        },
      })
    );
  }
  async timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  private incomingMessage(data: Buffer) {
    this.inflate.write(data);
    if (data.length >= 4 && data.readUInt32BE(data.length - 4) === 0x0ffff) {
      this.inflate.flush(
        ZlibConstants.Z_SYNC_FLUSH,
        this.handleFlushComplete.bind(this)
      );
    }
  }
  private handleFlushComplete() {
    const data =
      this.zlibChunks.length > 1
        ? Buffer.concat(this.zlibChunks)
        : this.zlibChunks[0];

    this.zlibChunks = [];
    this.parseMessage(data);
  }
  private parseMessage(data: Buffer) {
    var jsonString = data.toString();
    const messageInfo = JSON.parse(jsonString);
    this.log("has message");
    if (
      !(
        messageInfo.t === "MESSAGE_CREATE" || messageInfo.t === "MESSAGE_UPDATE"
      )
    )
      return;
    const message = messageInfo.d;
    const { author, content, channel_id, embeds } = message;
    if (author.id === this.MJId) return;
    if (channel_id !== this.config.ChannelId) return;
  }
  protected async log(...args: any[]) {
    this.config.Debug && console.info(...args, new Date().toISOString());
  }

  on(event: string, callback: (message: any) => void) {
    this.event.push({ event, callback });
  }
  once(event: string, callback: (message: any) => void) {
    const once = (message: any) => {
      this.remove(event, once);
      callback(message);
    };
    this.event.push({ event, callback: once });
  }
  remove(event: string, callback: (message: any) => void) {
    this.event = this.event.filter(
      (e) => e.event !== event && e.callback !== callback
    );
  }
  removeEvent(event: string) {
    this.event = this.event.filter((e) => e.event !== event);
  }
  onMessage(callback: (message: any) => void) {
    this.event.push({ event: "message", callback });
  }
  onInfo(callback: (message: any) => void) {
    this.event.push({ event: "info", callback });
  }
  onceInfo(callback: (message: any) => void) {
    const once = (message: any) => {
      this.remove("info", once);
      callback(message);
    };
    this.event.push({ event: "info", callback: once });
  }
  removeInfo(callback: (message: any) => void) {
    this.remove("info", callback);
  }
  onImagine(prompt: string, callback: (message: any) => void) {
    this.event.push({ event: "imagine", callback });
  }
  onceImagine(prompt: string, callback: (message: any) => void) {
    const once = (message: any) => {
      this.remove("imagine", once);
      callback(message);
    };
    this.event.push({ event: "imagine", callback: once });
  }
}
