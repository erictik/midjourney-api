import {
  DefaultMidjourneyConfig,
  LoadingHandler,
  MidjourneyConfig,
  MidjourneyConfigParam,
} from "./interfaces";
import { MidjourneyMessage } from "./midjourney.message";
import { CreateQueue } from "./queue";
import { random, sleep } from "./utls";
export class Midjourney extends MidjourneyMessage {
  private ApiQueue = CreateQueue(1);
  public config: MidjourneyConfig;
  constructor(defaults: MidjourneyConfigParam) {
    super(defaults);
    this.config = {
      ...DefaultMidjourneyConfig,
      ...defaults,
    };
  }

  async Imagine(prompt: string, loading?: LoadingHandler) {
    if (!prompt.includes("--seed")) {
      const speed = random(1000, 9999);
      prompt = `${prompt} --seed ${speed}`;
    }
    this.log(`Imagine`, prompt);
    const httpStatus = await this.ImagineApi(prompt);
    if (httpStatus !== 204) {
      throw new Error(`ImagineApi failed with status ${httpStatus}`);
    }
    this.log(`await generate image`);
    const msg = await this.WaitMessage(prompt, loading);
    this.log(`image generated`, prompt, msg?.uri);
    return msg;
  }
  // limit the number of concurrent interactions
  protected async safeIteractions(payload: any) {
    return this.ApiQueue.addTask(
      () =>
        new Promise<number>((resolve) => {
          this.interactions(payload, (res) => {
            resolve(res);
          });
        })
    );
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
      const response = await fetch("https://discord.com/api/v9/interactions", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: headers,
      });
      callback && callback(response.status);
      //discord api rate limit
      await sleep(950);
      return response.status;
    } catch (error) {
      console.log(error);
      callback && callback(500);
    }
  }

  async ImagineApi(prompt: string) {
    const payload = {
      type: 2,
      application_id: "936929561302675456",
      guild_id: this.config.ServerId,
      channel_id: this.config.ChannelId,
      session_id: this.config.SessionId,
      data: {
        version: "1077969938624553050",
        id: "938956540159881230",
        name: "imagine",
        type: 1,
        options: [
          {
            type: 3,
            name: "prompt",
            value: prompt,
          },
        ],
        application_command: {
          id: "938956540159881230",
          application_id: "936929561302675456",
          version: "1077969938624553050",
          default_permission: true,
          default_member_permissions: null,
          type: 1,
          nsfw: false,
          name: "imagine",
          description: "Create images with Midjourney",
          dm_permission: true,
          options: [
            {
              type: 3,
              name: "prompt",
              description: "The prompt to imagine",
              required: true,
            },
          ],
        },
        attachments: [],
      },
    };
    return this.safeIteractions(payload);
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
    const httpStatus = await this.VariationApi(index, msgId, msgHash);
    if (httpStatus !== 204) {
      throw new Error(`VariationApi failed with status ${httpStatus}`);
    }
    this.log(`await generate image`);
    return await this.WaitOptionMessage(content, `Variations`, loading);
  }
  async VariationApi(index: number, messageId: string, messageHash: string) {
    const payload = {
      type: 3,
      guild_id: this.config.ServerId,
      channel_id: this.config.ChannelId,
      message_flags: 0,
      message_id: messageId,
      application_id: "936929561302675456",
      session_id: "1f3dbdf09efdf93d81a3a6420882c92c",
      data: {
        component_type: 2,
        custom_id: `MJ::JOB::variation::${index}::${messageHash}`,
      },
    };
    return this.safeIteractions(payload);
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
    const httpStatus = await this.UpscaleApi(index, msgId, msgHash);
    if (httpStatus !== 204) {
      throw new Error(`VariationApi failed with status ${httpStatus}`);
    }
    this.log(`await generate image`);
    return await this.WaitUpscaledMessage(content, index, loading);
  }

  async UpscaleApi(index: number, messageId: string, messageHash: string) {
    const payload = {
      type: 3,
      guild_id: this.config.ServerId,
      channel_id: this.config.ChannelId,
      message_flags: 0,
      message_id: messageId,
      application_id: "936929561302675456",
      session_id: "ec6524c8d2926e285a8232f7ed1ced98",
      data: {
        component_type: 2,
        custom_id: `MJ::JOB::upsample::${index}::${messageHash}`,
      },
    };
    return this.safeIteractions(payload);
  }
  async UpscaleByCustomID(messageId: string, customId: string) {
    const payload = {
      type: 3,
      guild_id: this.config.ServerId,
      channel_id: this.config.ChannelId,
      message_flags: 0,
      message_id: messageId,
      application_id: "936929561302675456",
      session_id: this.config.SessionId,
      data: {
        component_type: 2,
        custom_id: customId,
      },
    };
    return this.safeIteractions(payload);
  }
}
