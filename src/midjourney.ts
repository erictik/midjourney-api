import {
  DefaultMJConfig,
  LoadingHandler,
  MJConfig,
  MJConfigParam,
} from "./interfaces";
import { MidjourneyApi } from "./midjourne.api";
import { MidjourneyMessage } from "./midjourney.message";
import { nextNonce, random } from "./utls";
import { WsMessage } from "./ws.message";
export class Midjourney extends MidjourneyMessage {
  public config: MJConfig;
  private wsClient?: WsMessage;
  public MJApi: MidjourneyApi;
  constructor(defaults: MJConfigParam) {
    const { SalaiToken } = defaults;
    if (!SalaiToken) {
      throw new Error("SalaiToken are required");
    }
    super(defaults);
    this.config = {
      ...DefaultMJConfig,
      ...defaults,
    };
    this.MJApi = new MidjourneyApi(this.config);
  }
  async init() {
    if (!this.config.Ws) {
      return this;
    }
    if (this.wsClient) return this;
    return new Promise<Midjourney>((resolve) => {
      this.wsClient = new WsMessage(this.config, this.MJApi);
      this.wsClient.once("ready", () => {
        resolve(this);
      });
    });
  }
  async Imagine(prompt: string, loading?: LoadingHandler) {
    if (!prompt.includes("--seed")) {
      const speed = random(1000, 9999);
      prompt = `${prompt} --seed ${speed}`;
    }

    const nonce = nextNonce();
    this.log(`Imagine`, prompt, "nonce", nonce);
    const httpStatus = await this.MJApi.ImagineApi(prompt, nonce);
    if (httpStatus !== 204) {
      throw new Error(`ImagineApi failed with status ${httpStatus}`);
    }
    if (this.wsClient) {
      return await this.wsClient.waitImageMessage(nonce, loading);
    } else {
      this.log(`await generate image`);
      const msg = await this.WaitMessage(prompt, loading);
      this.log(`image generated`, prompt, msg?.uri);
      return msg;
    }
  }

  async Info() {
    const nonce = nextNonce();
    const httpStatus = await this.MJApi.InfoApi(nonce);
    if (httpStatus !== 204) {
      throw new Error(`ImagineApi failed with status ${httpStatus}`);
    }
    if (this.wsClient) {
      return this.wsClient.waitInfo();
    }
  }

  async Variation(
    content: string,
    index: number,
    msgId: string,
    msgHash: string,
    loading?: LoadingHandler
  ) {
    // index is 1-4
    if (index < 1 || index > 4) {
      throw new Error(`Variation index must be between 1 and 4, got ${index}`);
    }
    const nonce = nextNonce();
    const httpStatus = await this.MJApi.VariationApi(
      index,
      msgId,
      msgHash,
      nonce
    );
    if (httpStatus !== 204) {
      throw new Error(`VariationApi failed with status ${httpStatus}`);
    }
    if (this.wsClient) {
      return await this.wsClient.waitImageMessage(nonce, loading);
    } else {
      return await this.WaitOptionMessage(content, `Variations`, loading);
    }
  }

  async Upscale(
    content: string,
    index: number,
    msgId: string,
    msgHash: string,
    loading?: LoadingHandler
  ) {
    // index is 1-4
    if (index < 1 || index > 4) {
      throw new Error(`Variation index must be between 1 and 4, got ${index}`);
    }
    const nonce = nextNonce();
    const httpStatus = await this.MJApi.UpscaleApi(
      index,
      msgId,
      msgHash,
      nonce
    );
    if (httpStatus !== 204) {
      throw new Error(`VariationApi failed with status ${httpStatus}`);
    }
    this.log(`await generate image`);
    if (this.wsClient) {
      return await this.wsClient.waitImageMessage(nonce, loading);
    }
    return await this.WaitUpscaledMessage(content, index, loading);
  }
}
