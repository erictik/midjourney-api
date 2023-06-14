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
        this.log(`ws ready`);
        resolve(this);
      });
    });
  }
  async Imagine(prompt: string, loading?: LoadingHandler) {
    prompt = prompt.trim();
    if (!prompt.includes("--seed")) {
      const seed = random(10000000, 999999999);
      prompt = `${prompt} --seed ${seed}`;
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
    return null;
  }

  async Fast() {
    const nonce = nextNonce();
    const httpStatus = await this.MJApi.FastApi(nonce);
    if (httpStatus !== 204) {
      throw new Error(`FastApi failed with status ${httpStatus}`);
    }
    return null;
  }
  async Relax() {
    const nonce = nextNonce();
    const httpStatus = await this.MJApi.RelaxApi(nonce);
    if (httpStatus !== 204) {
      throw new Error(`RelaxApi failed with status ${httpStatus}`);
    }
    return null;
  }
  async Describe(imgUri: string) {
    const nonce = nextNonce();
    const DcImage = await this.MJApi.UploadImage(imgUri);
    this.log(`Describe`, DcImage, "nonce", nonce);
    const httpStatus = await this.MJApi.DescribeApi(DcImage, nonce);
    if (httpStatus !== 204) {
      throw new Error(`DescribeApi failed with status ${httpStatus}`);
    }
    if (this.wsClient) {
      return this.wsClient.waitDescribe(nonce);
    }
    return null;
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

  Close() {
    if (this.wsClient) {
      this.wsClient.close();
      this.wsClient = undefined;
    }
  }
}
