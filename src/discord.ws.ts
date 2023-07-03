import {
  MJConfig,
  WaitMjEvent,
  MJMessage,
  LoadingHandler,
  MJEmit,
  MJInfo,
  MJSettings,
  MJOptions,
  OnModal,
  MJShorten,
} from "./interfaces";

import { MidjourneyApi } from "./midjourne.api";
import {
  content2progress,
  content2prompt,
  formatInfo,
  formatOptions,
  formatPrompts,
  uriToHash,
} from "./utls";
import { VerifyHuman } from "./verify.human";
import WebSocket from "isomorphic-ws";
export class WsMessage {
  ws: WebSocket;
  //TODO add MJBotId to config
  MJBotId = "936929561302675456";
  private closed = false;
  private event: Array<{ event: string; callback: (message: any) => void }> =
    [];
  private waitMjEvents: Map<string, WaitMjEvent> = new Map();
  private reconnectTime: boolean[] = [];
  private heartbeatInterval = 0;

  constructor(public config: MJConfig, public MJApi: MidjourneyApi) {
    this.ws = new this.config.WebSocket(this.config.WsBaseUrl);
    this.ws.addEventListener("open", this.open.bind(this));
    this.onSystem("messageCreate", this.onMessageCreate.bind(this));
    this.onSystem("messageUpdate", this.onMessageUpdate.bind(this));
    this.onSystem("interactionSuccess", this.onInteractionSuccess.bind(this));
  }

  private async heartbeat(num: number) {
    if (this.reconnectTime[num]) return;
    //check if ws is closed
    if (this.closed) return;
    if (this.ws.readyState !== this.ws.OPEN) {
      this.reconnect();
      return;
    }
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
  close() {
    this.closed = true;
    this.ws.close();
  }

  //try reconnect
  private reconnect() {
    if (this.closed) return;
    this.ws = new this.config.WebSocket(this.config.WsBaseUrl);
    this.heartbeatInterval = 0;
    this.ws.addEventListener("open", this.open.bind(this));
  }
  // After opening ws
  private async open() {
    const num = this.reconnectTime.length;
    this.log("open.time", num);
    this.reconnectTime.push(false);
    this.auth();
    this.ws.addEventListener("message", (event) => {
      this.parseMessage(event.data as string);
    });
    this.ws.addEventListener("error", (event) => {
      this.reconnectTime[num] = true;
      this.reconnect();
    });
    this.ws.addEventListener("close", (event) => {
      this.reconnectTime[num] = true;
      this.reconnect();
    });
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
    const { embeds, id, nonce, components, attachments } = message;
    if (nonce) {
      this.log("waiting start image or info or error");
      this.updateMjEventIdByNonce(id, nonce);

      if (embeds?.[0]) {
        const { color, description, title } = embeds[0];
        this.log("embeds[0].color", color);
        switch (color) {
          case 16711680: //error
            const error = new Error(description);
            this.EventError(id, error);
            return;

          case 16776960: //warning
            console.warn(description);
            break;

          default:
            if (
              title?.includes("continue") &&
              description?.includes("verify you're human")
            ) {
              //verify human
              await this.verifyHuman(message);
              return;
            }

            if (title?.includes("Invalid")) {
              //error
              const error = new Error(description);
              this.EventError(id, error);
              return;
            }
        }
      }
    }

    if (!nonce && attachments?.length > 0 && components?.length > 0) {
      this.done(message);
      return;
    }

    this.messageUpdate(message);
  }
  private messageUpdate(message: any) {
    // this.log("messageUpdate",message);
    const {
      content,
      embeds,
      interaction = {},
      nonce,
      id,
      components,
    } = message;

    if (!nonce) {
      const { name } = interaction;

      switch (name) {
        case "settings":
          this.emit("settings", message);
          return;
        case "describe":
          this.emitMJ(id, {
            descriptions: embeds?.[0]?.description.split("\n\n"),
            options: formatOptions(components),
          });
          break;
        case "prefer remix":
          if (content != "") {
            this.emit("prefer-remix", content);
          }
          break;
        case "shorten":
          const shorten: MJShorten = {
            description: embeds?.[0]?.description,
            prompts: formatPrompts(embeds?.[0]?.description as string),
            options: formatOptions(components),
            id,
            flags: message.flags,
          };
          this.emitMJ(id, shorten);
          break;
        case "info":
          this.emit("info", embeds?.[0]?.description);
          return;
      }
    }
    if (content) {
      this.processingImage(message);
    }
  }

  //interaction success
  private async onInteractionSuccess({
    nonce,
    id,
  }: {
    nonce: string;
    id: string;
  }) {
    this.log("interactionSuccess", nonce, id);
    const event = this.getEventByNonce(nonce);
    if (!event) {
      return;
    }
    event.onmodal && event.onmodal(nonce, id);
  }

  private async onMessageCreate(message: any) {
    const { channel_id, author } = message;
    if (!(author && author.id === this.MJBotId)) return;
    if (channel_id !== this.config.ChannelId) return;
    this.messageCreate(message);
  }
  private async onMessageUpdate(message: any) {
    const { channel_id, author } = message;
    if (!(author && author.id === this.MJBotId)) return;
    if (channel_id !== this.config.ChannelId) return;
    this.messageUpdate(message);
  }

  // parse message from ws
  private parseMessage(data: string) {
    const msg = JSON.parse(data);
    if (!msg.t) {
      return;
    }
    const message = msg.d;
    this.log("has message", msg.t);
    switch (msg.t) {
      case "READY":
        this.emitSystem("ready", message.user);
        break;
      case "MESSAGE_CREATE":
        this.emitSystem("messageCreate", message);
        break;
      case "MESSAGE_UPDATE":
        this.emitSystem("messageUpdate", message);
        break;
      case "INTERACTION_SUCCESS":
        if (message.nonce) {
          this.emitSystem("interactionSuccess", message);
        }
        break;
      case "INTERACTION_CREATE":
        if (message.nonce) {
          this.emitSystem("interactionCreate", message);
        }
    }
  }
  private async verifyHuman(message: any) {
    const { HuggingFaceToken } = this.config;
    if (HuggingFaceToken === "" || !HuggingFaceToken) {
      this.log("HuggingFaceToken is empty");
      return;
    }
    const { embeds, components, id, flags } = message;
    const uri = embeds[0].image.url;
    const categories = components[0].components;
    const classify = categories.map((c: any) => c.label);
    const verifyClient = new VerifyHuman(this.config);
    const category = await verifyClient.verify(uri, classify);
    if (category) {
      const custom_id = categories.find(
        (c: any) => c.label === category
      ).custom_id;
      const httpStatus = await this.MJApi.CustomApi({
        msgId: id,
        customId: custom_id,
        flags,
      });
      this.log("verifyHumanApi", httpStatus, custom_id, message.id);
    }
  }
  private EventError(id: string, error: Error) {
    const event = this.getEventById(id);
    if (!event) {
      return;
    }
    const eventMsg: MJEmit = {
      error,
    };
    this.emit(event.nonce, eventMsg);
  }

  private done(message: any) {
    const { content, id, attachments, components, flags } = message;
    const MJmsg: MJMessage = {
      id,
      flags,
      content,
      hash: uriToHash(attachments[0].url),
      progress: "done",
      uri: attachments[0].url,
      options: formatOptions(components),
    };
    this.filterMessages(MJmsg);
    return;
  }
  private processingImage(message: any) {
    const { content, id, attachments, flags } = message;
    if (!content) {
      return;
    }
    const event = this.getEventById(id);
    if (!event) {
      return;
    }
    event.prompt = content;
    //not image
    if (!attachments || attachments.length === 0) {
      return;
    }
    const MJmsg: MJMessage = {
      uri: attachments[0].url,
      content: content,
      flags: flags,
      progress: content2progress(content),
    };
    const eventMsg: MJEmit = {
      message: MJmsg,
    };
    this.emitImage(event.nonce, eventMsg);
  }

  private filterMessages(MJmsg: MJMessage) {
    const event = this.getEventByContent(MJmsg.content);
    if (!event) {
      this.log("FilterMessages not found", MJmsg, this.waitMjEvents);
      return;
    }
    const eventMsg: MJEmit = {
      message: MJmsg,
    };
    this.emitImage(event.nonce, eventMsg);
  }
  private getEventByContent(content: string) {
    const prompt = content2prompt(content);
    for (const [key, value] of this.waitMjEvents.entries()) {
      if (prompt === content2prompt(value.prompt as string)) {
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
  private getEventByNonce(nonce: string) {
    for (const [key, value] of this.waitMjEvents.entries()) {
      if (value.nonce === nonce) {
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

  protected async log(...args: any[]) {
    this.config.Debug && console.info(...args, new Date().toISOString());
  }

  emit(event: string, message: any) {
    this.event
      .filter((e) => e.event === event)
      .forEach((e) => e.callback(message));
  }
  private emitImage(type: string, message: MJEmit) {
    this.emit(type, message);
  }
  //FIXME: emitMJ rename
  private emitMJ(id: string, data: any) {
    const event = this.getEventById(id);
    if (!event) return;
    this.emit(event.nonce, data);
  }

  on(event: string, callback: (message: any) => void) {
    this.event.push({ event, callback });
  }
  onSystem(
    event: "ready" | "messageCreate" | "messageUpdate" | "interactionSuccess",
    callback: (message: any) => void
  ) {
    this.on(event, callback);
  }
  private emitSystem(
    type:
      | "ready"
      | "messageCreate"
      | "messageUpdate"
      | "interactionSuccess"
      | "interactionCreate",
    message: MJEmit
  ) {
    this.emit(type, message);
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
  //FIXME: USE ONCE
  onceInfo(callback: (message: any) => void) {
    const once = (message: any) => {
      this.remove("info", once);
      callback(message);
    };
    this.event.push({ event: "info", callback: once });
  }
  //FIXME: USE ONCE
  onceSettings(callback: (message: any) => void) {
    const once = (message: any) => {
      this.remove("settings", once);
      callback(message);
    };
    this.event.push({ event: "settings", callback: once });
  }
  onceMJ(nonce: string, callback: (data: any) => void) {
    const once = (message: any) => {
      this.remove(nonce, once);
      //FIXME: removeWaitMjEvent
      this.removeWaitMjEvent(nonce);
      callback(message);
    };
    //FIXME: addWaitMjEvent
    this.waitMjEvents.set(nonce, { nonce });
    this.event.push({ event: nonce, callback: once });
  }

  private removeWaitMjEvent(nonce: string) {
    this.waitMjEvents.delete(nonce);
  }
  onceImage(nonce: string, callback: (data: MJEmit) => void) {
    const once = (data: MJEmit) => {
      const { message, error } = data;
      if (error || (message && message.progress === "done")) {
        this.remove(nonce, once);
      }
      callback(data);
    };
    this.event.push({ event: nonce, callback: once });
  }

  async waitImageMessage({
    nonce,
    prompt,
    onmodal,
    loading,
  }: {
    nonce: string;
    prompt?: string;
    onmodal?: OnModal;
    loading?: LoadingHandler;
  }) {
    return new Promise<MJMessage | null>((resolve, reject) => {
      const handleImageMessage = ({ message, error }: MJEmit) => {
        if (error) {
          this.removeWaitMjEvent(nonce);
          reject(error);
          return;
        }
        if (message && message.progress === "done") {
          this.removeWaitMjEvent(nonce);
          resolve(message);
          return;
        }
        message && loading && loading(message.uri, message.progress || "");
      };
      this.waitMjEvents.set(nonce, {
        nonce,
        prompt,
        onmodal: async (nonce, id) => {
          if (onmodal === undefined) {
            // reject(new Error("onmodal is not defined"))
            return "";
          }
          var nonce = await onmodal(nonce, id);
          if (nonce === "") {
            // reject(new Error("onmodal return empty nonce"))
            return "";
          }
          this.removeWaitMjEvent(nonce);
          this.waitMjEvents.set(nonce, { nonce });
          this.onceImage(nonce, handleImageMessage);
          return nonce;
        },
      });
      this.onceImage(nonce, handleImageMessage);
    });
  }
  async waitDescribe(nonce: string) {
    return new Promise<{
      options: MJOptions[];
      descriptions: string[];
    } | null>((resolve) => {
      this.onceMJ(nonce, (message) => {
        resolve(message);
      });
    });
  }
  async waitShorten(nonce: string) {
    return new Promise<MJShorten | null>((resolve) => {
      this.onceMJ(nonce, (message) => {
        resolve(message);
      });
    });
  }
  async waitContent(event: string) {
    return new Promise<string | null>((resolve) => {
      this.once(event, (message) => {
        resolve(message);
      });
    });
  }
  async waitInfo() {
    return new Promise<MJInfo | null>((resolve, reject) => {
      this.onceInfo((message) => {
        resolve(formatInfo(message));
      });
    });
  }
  async waitSettings() {
    return new Promise<MJSettings | null>((resolve, reject) => {
      this.onceSettings((message) => {
        resolve({
          id: message.id,
          flags: message.flags,
          content: message,
          options: formatOptions(message.components),
        });
      });
    });
  }
}
