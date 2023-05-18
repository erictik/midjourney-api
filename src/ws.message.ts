import WebSocket from "ws";
import { createInflate, Inflate, constants as ZlibConstants } from "zlib";
import {
  MessageConfig,
  MessageConfigParam,
  DefaultMessageConfig,
  WaitMjEvent,
  MJMessage,
  LoadingHandler,
  WsEventMsg,
  ImageEventType,
} from "./interfaces";
import { error } from "console";

export class WsMessage {
  DISCORD_GATEWAY =
    "wss://gateway.discord.gg/?v=9&encoding=json&compress=zlib-stream";
  ws: WebSocket;
  MJBotId = "936929561302675456";
  private zlibChunks: Buffer[] = [];
  public config: MessageConfig;
  private inflate: Inflate;
  private event: Array<{ event: string; callback: (message: any) => void }> =
    [];
  private waitMjEvent: Array<WaitMjEvent> = [];
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
  // After opening ws
  private async open() {
    const num = this.reconnectTime.length;
    this.log("open", num);
    this.reconnectTime.push(false);
    this.auth();
    this.ws.on("message", this.incomingMessage.bind(this));
    this.ws.onclose = (event: WebSocket.CloseEvent) => {
      this.log("close", event);
      this.reconnectTime[num] = true;
      this.reconnect();
    };
    await this.timeout(1000 * 10);
    this.heartbeat(num);
  }
  // auth
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
  // parse message from ws
  private parseMessage(data: Buffer) {
    var jsonString = data.toString();
    const msg = JSON.parse(jsonString);
    if (msg.t === null || msg.t === "READY_SUPPLEMENTAL") return;
    if (msg.t === "READY") {
      this.emit("ready", null);
      return;
    }
    if (!(msg.t === "MESSAGE_CREATE" || msg.t === "MESSAGE_UPDATE")) return;
    const message = msg.d;
    const {
      channel_id,
      content,
      application_id,
      embeds,
      id,
      nonce,
      author,
      attachments,
    } = message;
    if (!(author && author.id === this.MJBotId)) return;
    if (channel_id !== this.config.ChannelId) return;
    this.log("has message", content, nonce, id);

    //waiting start image or info or error
    if (nonce && msg.t === "MESSAGE_CREATE") {
      this.log("waiting start image or info or error");
      this.updateMjEventIdByNonce(id, nonce);
      if (
        embeds &&
        embeds.length > 0 &&
        embeds[0].title === "Invalid parameter"
      ) {
        //error
        const error = new Error(embeds[0].description);
        this.EventError(id, error);
      }
    }
    //done image
    if (msg.t === "MESSAGE_CREATE" && !nonce && !application_id) {
      this.log("done image");
      this.done(message);
      return;
    }

    //processing image
    {
      this.log("processing image");
      const index = this.waitMjEvent.findIndex((e) => e.id === id);
      if (index < 0 || !this.waitMjEvent[index]) {
        return;
      }
      const event = this.waitMjEvent[index];
      this.waitMjEvent[index].prompt = content;
      if (!attachments || attachments.length === 0) {
        this.log("wait", {
          id,
          nonce,
          content,
          event,
        });
        return;
      }
      const MJmsg: MJMessage = {
        uri: attachments[0].url,
        content,
        progress: this.content2progress(content),
      };
      const eventMsg: WsEventMsg = {
        message: MJmsg,
      };
      this.emitImage(<ImageEventType>event.type, eventMsg);
    }
  }
  private EventError(id: string, error: Error) {
    this.log("EventError", id, error);
    const index = this.waitMjEvent.findIndex((e) => e.id === id);
    if (index < 0 || !this.waitMjEvent[index]) {
      return;
    }
    const event = this.waitMjEvent[index];
    const eventMsg: WsEventMsg = {
      error,
    };
    this.emit(event.type, eventMsg);
  }

  private done(message: any) {
    const { content, id, attachments } = message;
    const MJmsg: MJMessage = {
      id,
      hash: this.uriToHash(attachments[0].url),
      progress: "done",
      uri: attachments[0].url,
      content,
    };
    this.filterMessages(MJmsg);
    return;
  }

  protected content2progress(content: string) {
    const regex = /\(([^)]+)\)/; // matches the value inside the first parenthesis
    const match = content.match(regex);
    let progress = "";
    if (match) {
      progress = match[1];
    }
    return progress;
  }

  matchContent(content: string | undefined) {
    if (!content) return "";
    const pattern = /\*\*(.*?)\*\*/; // Match **middle content
    const matches = content.match(pattern);
    if (matches && matches.length > 1) {
      return matches[1]; // Get the matched content
    } else {
      this.log("No match found.", content);
      return "";
    }
  }

  private filterMessages(MJmsg: MJMessage) {
    // this.log("filterMessages", MJmsg, this.waitMjEvent);
    const index = this.waitMjEvent.findIndex(
      (e) => this.matchContent(e.prompt) === this.matchContent(MJmsg.content)
    );
    if (index < 0) {
      this.log("FilterMessages not found", MJmsg, this.waitMjEvent);
      return;
    }
    const event = this.waitMjEvent[index];
    if (!event) {
      this.log("FilterMessages not found", MJmsg, this.waitMjEvent);
      return;
    }
    const eventMsg: WsEventMsg = {
      message: MJmsg,
    };
    this.emitImage(<ImageEventType>event.type, eventMsg);
  }

  private updateMjEventIdByNonce(id: string, nonce: string) {
    const index = this.waitMjEvent.findIndex((e) => e.nonce === nonce);
    if (index < 0) return;
    this.waitMjEvent[index].id = id;
    this.log("updateMjEventIdByNonce success", this.waitMjEvent[index]);
  }
  uriToHash(uri: string) {
    return uri.split("_").pop()?.split(".")[0] ?? "";
  }

  protected async log(...args: any[]) {
    this.config.Debug && console.info(...args, new Date().toISOString());
  }

  emit(event: string, message: any) {
    this.event
      .filter((e) => e.event === event)
      .forEach((e) => e.callback(message));
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
  private removeWaitMjEvent(nonce: string) {
    this.waitMjEvent = this.waitMjEvent.filter((e) => e.nonce !== nonce);
  }

  private emitImage(type: ImageEventType, message: WsEventMsg) {
    this.emit(type, message);
  }
  onceImage(
    type: ImageEventType,
    nonce: string,
    callback: (data: WsEventMsg) => void
  ) {
    const once = (data: WsEventMsg) => {
      const { message, error } = data;
      if (error || (message && message.progress === "done")) {
        this.log("onceImage", type, "done", data, error);
        this.remove(type, once);
        this.removeWaitMjEvent(nonce);
      }
      callback(data);
    };
    this.waitMjEvent.push({ type, nonce });
    this.event.push({ event: type, callback: once });
  }
  onceImagine(nonce: string, callback: (data: WsEventMsg) => void) {
    this.onceImage("imagine", nonce, callback);
  }

  async waitMessage(
    type: ImageEventType,
    nonce: string,
    loading?: LoadingHandler
  ) {
    return new Promise<MJMessage | null>((resolve, reject) => {
      this.onceImage(type, nonce, ({ message, error }) => {
        if (error) {
          reject(error);
          return;
        }
        if (message && message.progress === "done") {
          resolve(message);
          return;
        }
        message && loading && loading(message.uri, message.progress || "");
      });
    });
  }
}
