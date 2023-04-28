import axios from "axios";
import { MidjourneyMessage } from "./midjourney.message";
import { CreateQueue, QueueTask } from "./queue";
import { random, sleep } from "./utls";
import { QueueObject, tryEach } from "async";

export class Midjourney extends MidjourneyMessage {
  ApiQueue: QueueObject<QueueTask<any>>;
  constructor(
    public ServerId: string,
    public ChannelId: string,
    protected SalaiToken: string,
    public debug = false
  ) {
    super(ChannelId, SalaiToken, debug);
    this.log("Midjourney constructor");
    this.ApiQueue = CreateQueue(1);
  }

  async Imagine(prompt: string, loading?: (uri: string) => void) {
    //if prompt not include --seed, use it
    if (!prompt.includes("--seed")) {
      const speed = random(1000, 9999);
      prompt = `${prompt} --seed ${speed}`;
    }

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
    const httpStatus: number = await new Promise((resolve, reject) => {
      this.ApiQueue.push(
        {
          task: this.interactions.bind(this, payload, (res) => {
            resolve(res);
          }),
        },
        (err) => {
          reject(err);
        }
      );
    });
    return httpStatus;
  }

  protected async interactions(
    payload: any,
    callback: (result: number) => void
  ) {
    const headers = { authorization: this.SalaiToken };
    const t0 = performance.now();
    try {
      const response = await axios.post(
        "https://discord.com/api/v9/interactions",
        payload,
        {
          headers,
        }
      );
      const t1 = performance.now();
      this.log(`Execution time: ${t1 - t0} milliseconds.`);
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
      guild_id: this.ServerId,
      channel_id: this.ChannelId,
      session_id: "2fb980f65e5c9a77c96ca01f2c242cf6",
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
    loading?: (uri: string) => void
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
      guild_id: this.ServerId,
      channel_id: this.ChannelId,
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
    loading?: (uri: string) => void
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
    return await this.WaitOptionMessage(content, `Upscaled`, loading);
  }

  async UpscaleApi(index: number, messageId: string, messageHash: string) {
    const payload = {
      type: 3,
      guild_id: this.ServerId,
      channel_id: this.ChannelId,
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
      guild_id: this.ServerId,
      channel_id: this.ChannelId,
      message_flags: 0,
      message_id: messageId,
      application_id: "936929561302675456",
      session_id: "ec6524c8d2926e285a8232f7ed1ced98",
      data: {
        component_type: 2,
        custom_id: customId,
      },
    };
    return this.safeIteractions(payload);
  }
}
