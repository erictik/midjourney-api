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
  private zlibChunks: Buffer[] = [];
  public config: MessageConfig;
  private inflate: Inflate;

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
    this.ws.on("open", this.open);
    this.ws.on("message", this.incomingMessage);
    this.inflate = createInflate({ flush: ZlibConstants.Z_SYNC_FLUSH });
    this.inflate.on("data", (data) => this.zlibChunks.push(data));
  }
  heartbeatInterval = 0;
  private heartbeat() {
    console.log("heartbeat");
    if (this.ws.readyState !== WebSocket.OPEN) return;
    this.heartbeatInterval++;
    this.ws.send(
      JSON.stringify({
        op: 1,
        d: null,
      })
    );
    setTimeout(this.heartbeat, 1000 * 40);
  }
  private async open() {
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
    this.heartbeat();
  }
  async timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  private incomingMessage(data: Buffer) {
    this.inflate.write(data);
    if (data.length >= 4 && data.readUInt32BE(data.length - 4) === 0x0ffff) {
      this.inflate.flush(ZlibConstants.Z_SYNC_FLUSH, this.handleFlushComplete);
    }
  }
  private handleFlushComplete() {
    const data =
      this.zlibChunks.length > 1
        ? Buffer.concat(this.zlibChunks)
        : this.zlibChunks[0];

    this.zlibChunks = [];
    this.onMessage(data);
  }
  private onMessage(data: Buffer) {
    var jsonString = data.toString();
    console.log("jsonString", new Date().toJSON(), jsonString);
  }
  protected async log(...args: any[]) {
    this.config.Debug && console.debug(...args, new Date().toISOString());
  }
}
