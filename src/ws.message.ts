import { request } from "http";
import {
  MessageConfig,
  MessageConfigParam,
  DefaultMessageConfig,
  WaitMjEvent,
  MJMessage,
  LoadingHandler,
  WsEventMsg,
} from "./interfaces";
import { VerifyHuman } from "./verify.human";
import WebSocket from "isomorphic-ws";

export class WsMessage {
  ws: WebSocket;
  MJBotId = "936929561302675456";
  public config: MessageConfig;
  private event: Array<{ event: string; callback: (message: any) => void }> =
    [];
  private waitMjEvents: Map<string, WaitMjEvent> = new Map();
  private reconnectTime: boolean[] = [];
  private heartbeatInterval = 0;
  private DISCORD_GATEWAY: string;

  constructor(defaults: MessageConfigParam) {
    const { ChannelId, SalaiToken } = defaults;
    if (!ChannelId || !SalaiToken) {
      throw new Error("ChannelId and SalaiToken are required");
    }

    this.config = {
      ...DefaultMessageConfig,
      ...defaults,
    };
    this.DISCORD_GATEWAY = `${this.config.WsBaseUrl}/?v=9&encoding=json&compress=gzip-stream`;
    this.ws = new WebSocket(this.DISCORD_GATEWAY);
    this.ws.addEventListener("open", this.open.bind(this));
  }

  private async heartbeat(num: number) {
    if (this.reconnectTime[num]) return;
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
  private reconnect() {
    //reconnect
    this.ws = new WebSocket(this.DISCORD_GATEWAY);
    this.ws.on("open", this.open.bind(this));
  }
  // After opening ws
  private async open() {
    const num = this.reconnectTime.length;
    this.log("open", num);
    this.reconnectTime.push(false);
    this.auth();
    this.ws.on("message", this.parseMessage.bind(this));
    this.ws.onclose = () => {
      this.reconnectTime[num] = true;
      this.reconnect();
    };
    setTimeout(() => {
      this.heartbeat(num);
    }, 1000 * 10);
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
  private async messageCreate(message: any) {
    // this.log("messageCreate", message);
    const { application_id, embeds, id, nonce } = message;
    if (nonce) {
      this.log("waiting start image or info or error");
      this.updateMjEventIdByNonce(id, nonce);
      if (embeds && embeds.length > 0) {
        if (embeds[0].color === 16711680) {
          //error
          const error = new Error(embeds[0].description);
          this.EventError(id, error);
          return;
        } else if (embeds[0].color === 16776960) {
          //warning
          console.warn(embeds[0].description);
        }
        if (embeds[0].title.includes("continue")) {
          if (embeds[0].description.includes("verify you're human")) {
            //verify human
            await this.verifyHuman(message);
            return;
          }
        }
        if (embeds[0].title.includes("Invalid")) {
          //error
          const error = new Error(embeds[0].description);
          this.EventError(id, error);
          return;
        }
      }
    }
    //done image
    if (!nonce && !application_id) {
      this.log("done image");
      this.done(message);
      return;
    }
    this.processingImage(message);
  }
  private messageUpdate(message: any) {
    this.processingImage(message);
  }
  private processingImage(message: any) {
    const { content, id, nonce, attachments } = message;
    const event = this.getEventById(id);
    if (!event) {
      return;
    }
    event.prompt = content;
    //not image
    if (!attachments || attachments.length === 0) {
      // this.log("no image waiting", { id, nonce, content, event });
      return;
    }
    const MJmsg: MJMessage = {
      uri: attachments[0].url,
      content: content,
      progress: this.content2progress(content),
    };
    const eventMsg: WsEventMsg = {
      message: MJmsg,
    };
    this.emitImage(event.nonce, eventMsg);
  }

  // parse message from ws
  private parseMessage(data: string) {
    const msg = JSON.parse(data);
    // this.log("parseMessage333", msg.t, msg.d);
    if (msg.t === null || msg.t === "READY_SUPPLEMENTAL") return;
    if (msg.t === "READY") {
      this.emit("ready", null);
      return;
    }
    if (!(msg.t === "MESSAGE_CREATE" || msg.t === "MESSAGE_UPDATE")) return;

    const message = msg.d;
    const { channel_id, content, id, nonce, author } = message;
    if (!(author && author.id === this.MJBotId)) return;
    if (channel_id !== this.config.ChannelId) return;
    this.log("has message", content, nonce, id);

    if (msg.t === "MESSAGE_CREATE") {
      this.messageCreate(message);
      return;
    }
    if (msg.t === "MESSAGE_UPDATE") {
      this.messageUpdate(message);
      return;
    }
  }
  private async verifyHuman(message: any) {
    const { HuggingFaceToken } = this.config;
    if (HuggingFaceToken === "" || !HuggingFaceToken) {
      this.log("HuggingFaceToken is empty");
      return;
    }
    const { embeds, components } = message;
    const uri = embeds[0].image.url;
    const categories = components[0].components;
    const classify = categories.map((c: any) => c.label);
    const verifyClient = new VerifyHuman(HuggingFaceToken);
    const category = await verifyClient.verify(uri, classify);
    if (category) {
      const custom_id = categories.find(
        (c: any) => c.label === category
      ).custom_id;
      const httpStatus = await this.verifyHumanApi(custom_id, message.id);
      this.log("verifyHumanApi", httpStatus, custom_id, message.id);
      // this.log("verify success", category);
    }
  }
  private async verifyHumanApi(
    custom_id: string,
    message_id: string,
    nonce?: string
  ) {
    const payload = {
      type: 3,
      nonce,
      guild_id: this.config.ServerId,
      channel_id: this.config.ChannelId,
      message_flags: 64,
      message_id,
      application_id: "936929561302675456",
      session_id: this.config.SessionId,
      data: {
        component_type: 2,
        custom_id,
      },
    };
    return this.interactions(payload);
  }
  protected async interactions(
    payload: any,
    callback?: (result: number) => void
  ) {
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: this.config.SalaiToken,
      };
      const response = await fetch(
        `${this.config.DiscordBaseUrl}/api/v9/interactions`,
        {
          method: "POST",
          body: JSON.stringify(payload),
          headers: headers,
        }
      );
      callback && callback(response.status);
      //discord api rate limit
      if (response.status >= 400) {
        this.log("error config", { config: this.config });
      }
      return response.status;
    } catch (error) {
      console.log(error);
      callback && callback(500);
    }
  }
  private EventError(id: string, error: Error) {
    const event = this.getEventById(id);
    if (!event) {
      return;
    }
    const eventMsg: WsEventMsg = {
      error,
    };
    this.emit(event.nonce, eventMsg);
  }

  private done(message: any) {
    const { content, id, attachments } = message;
    const MJmsg: MJMessage = {
      id,
      hash: this.uriToHash(attachments[0].url),
      progress: "done",
      uri: attachments[0].url,
      content: content,
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

  content2prompt(content: string | undefined) {
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
    const event = this.getEventByContent(MJmsg.content);
    if (!event) {
      this.log("FilterMessages not found", MJmsg, this.waitMjEvents);
      return;
    }
    const eventMsg: WsEventMsg = {
      message: MJmsg,
    };
    this.emitImage(event.nonce, eventMsg);
  }
  private getEventByContent(content: string) {
    const prompt = this.content2prompt(content);
    for (const [key, value] of this.waitMjEvents.entries()) {
      if (prompt === this.content2prompt(value.prompt)) {
        return value;
      }
    }
  }

  private getEventById(id: string) {
    for (const [key, value] of this.waitMjEvents.entries()) {
      if (value.id === id) {
        return value;
      }
    }
  }
  private updateMjEventIdByNonce(id: string, nonce: string) {
    if (nonce === "" || id === "") return;
    let event = this.waitMjEvents.get(nonce);
    if (!event) return;
    event.id = id;
    this.log("updateMjEventIdByNonce success", this.waitMjEvents.get(nonce));
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
    this.waitMjEvents.delete(nonce);
  }

  private emitImage(type: string, message: WsEventMsg) {
    this.emit(type, message);
  }
  onceImage(nonce: string, callback: (data: WsEventMsg) => void) {
    const once = (data: WsEventMsg) => {
      const { message, error } = data;
      if (message) {
        // message.content = this.content2prompt(message.content);
      }
      if (error || (message && message.progress === "done")) {
        // this.log("onceImage", type, "done", data, error);
        this.remove(nonce, once);
        this.removeWaitMjEvent(nonce);
      }
      callback(data);
    };
    this.waitMjEvents.set(nonce, { nonce });
    this.event.push({ event: nonce, callback: once });
  }

  async waitMessage(nonce: string, loading?: LoadingHandler) {
    return new Promise<MJMessage | null>((resolve, reject) => {
      this.onceImage(nonce, ({ message, error }) => {
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
