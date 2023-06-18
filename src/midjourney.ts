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
  async Connect() {
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
  async init() {
    return this.Connect();
  }
  async Imagine(prompt: string, loading?: LoadingHandler) {
    prompt = prompt.trim();
    if (!this.wsClient) {
      const seed = random(1000000000, 9999999999);
      prompt = `[${seed}] ${prompt}`;
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

  async Variation({
    index,
    msgId,
    hash,
    content,
    flags,
    loading,
  }: {
    index: 1 | 2 | 3 | 4;
    msgId: string;
    hash: string;
    content?: string;
    flags: number;
    loading?: LoadingHandler;
  }) {
    const nonce = nextNonce();
    const httpStatus = await this.MJApi.VariationApi({
      index,
      msgId,
      hash,
      flags,
      nonce,
    });
    if (httpStatus !== 204) {
      throw new Error(`VariationApi failed with status ${httpStatus}`);
    }
    if (this.wsClient) {
      return await this.wsClient.waitImageMessage(nonce, loading);
    }
    if (content === undefined || content === "") {
      throw new Error(`content is required`);
    }
    return await this.WaitMessage(content, loading);
  }

  async Upscale({
    index,
    msgId,
    hash,
    content,
    flags,
    loading,
  }: {
    index: 1 | 2 | 3 | 4;
    msgId: string;
    hash: string;
    content?: string;
    flags: number;
    loading?: LoadingHandler;
  }) {
    const nonce = nextNonce();
    const httpStatus = await this.MJApi.UpscaleApi({
      index,
      msgId,
      hash,
      flags,
      nonce,
    });
    if (httpStatus !== 204) {
      throw new Error(`UpscaleApi failed with status ${httpStatus}`);
    }
    if (this.wsClient) {
      return await this.wsClient.waitImageMessage(nonce, loading);
    }
    if (content === undefined || content === "") {
      throw new Error(`content is required`);
    }
    return await this.WaitMessage(content, loading);
  }

  async Reroll({
    msgId,
    hash,
    content,
    flags,
    loading,
  }: {
    msgId: string;
    hash: string;
    content?: string;
    flags: number;
    loading?: LoadingHandler;
  }) {
    const nonce = nextNonce();
    const httpStatus = await this.MJApi.RerollApi({
      msgId,
      hash: hash,
      flags,
      nonce,
    });
    if (httpStatus !== 204) {
      throw new Error(`RerollApi failed with status ${httpStatus}`);
    }
    if (this.wsClient) {
      return await this.wsClient.waitImageMessage(nonce, loading);
    }
    if (content === undefined || content === "") {
      throw new Error(`content is required`);
    }
    return await this.WaitMessage(content, loading);
  }

  Close() {
    if (this.wsClient) {
      this.wsClient.close();
      this.wsClient = undefined;
    }
  }
}
