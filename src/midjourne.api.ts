import { MJConfig } from "./interfaces";
import { CreateQueue } from "./queue";
import { nextNonce, sleep } from "./utls";
export class MidjourneyApi {
  private ApiQueue = CreateQueue(1);
  constructor(public config: MJConfig) {}
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
      await sleep(950);
      if (response.status >= 400) {
        console.error("api.error.config", { config: this.config });
      }
      return response.status;
    } catch (error) {
      console.error(error);
      callback && callback(500);
    }
  }
  async ImagineApi(prompt: string, nonce: string = nextNonce()) {
    const guild_id = this.config.ServerId;
    const payload = {
      type: 2,
      application_id: "936929561302675456",
      guild_id,
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
      nonce,
    };
    return this.safeIteractions(payload);
  }
  async VariationApi(
    index: number,
    messageId: string,
    messageHash: string,
    nonce?: string
  ) {
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
      nonce,
    };
    return this.safeIteractions(payload);
  }
  async UpscaleApi(
    index: number,
    messageId: string,
    messageHash: string,
    nonce?: string
  ) {
    const guild_id = this.config.ServerId;
    const payload = {
      type: 3,
      guild_id,
      channel_id: this.config.ChannelId,
      message_flags: 0,
      message_id: messageId,
      application_id: "936929561302675456",
      session_id: "ec6524c8d2926e285a8232f7ed1ced98",
      data: {
        component_type: 2,
        custom_id: `MJ::JOB::upsample::${index}::${messageHash}`,
      },
      nonce,
    };
    return this.safeIteractions(payload);
  }

  async ClickBtnApi(messageId: string, customId: string, nonce?: string) {
    const guild_id = this.config.ServerId;
    const payload = {
      type: 3,
      nonce,
      guild_id,
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
  async InfoApi(nonce?: string) {
    const guild_id = this.config.ServerId;
    const payload = {
      type: 2,
      application_id: "936929561302675456",
      guild_id,
      channel_id: this.config.ChannelId,
      session_id: "b8365bc80a004e656afbd4e48113509f",
      data: {
        version: "987795925764280356",
        id: "972289487818334209",
        name: "info",
        type: 1,
        options: [],
        application_command: {
          id: "972289487818334209",
          application_id: "936929561302675456",
          version: "987795925764280356",
          default_member_permissions: null,
          type: 1,
          nsfw: false,
          name: "info",
          description: "View information about your profile.",
          dm_permission: true,
          contexts: null,
        },
        attachments: [],
      },
      nonce,
    };
    return this.safeIteractions(payload);
  }
  async FastApi(nonce?: string) {
    const guild_id = this.config.ServerId;
    const payload = {
      type: 2,
      application_id: "936929561302675456",
      guild_id,
      channel_id: this.config.ChannelId,
      session_id: "b8365bc80a004e656afbd4e48113509f",
      data: {
        version: "987795926183731231",
        id: "972289487818334212",
        name: "fast",
        type: 1,
        options: [],
        application_command: {
          id: "972289487818334212",
          application_id: "936929561302675456",
          version: "987795926183731231",
          default_member_permissions: null,
          type: 1,
          nsfw: false,
          name: "fast",
          description: "Switch to fast mode",
          dm_permission: true,
          contexts: null,
        },
        attachments: [],
      },
      nonce,
    };
    return this.safeIteractions(payload);
  }
  async RelaxApi(nonce?: string) {
    const guild_id = this.config.ServerId;
    const channel_id = this.config.ChannelId;
    const payload = {
      type: 2,
      application_id: "936929561302675456",
      guild_id,
      channel_id,
      session_id: "b8365bc80a004e656afbd4e48113509f",
      data: {
        version: "987795926183731232",
        id: "972289487818334213",
        name: "relax",
        type: 1,
        options: [],
        application_command: {
          id: "972289487818334213",
          application_id: "936929561302675456",
          version: "987795926183731232",
          default_member_permissions: null,
          type: 1,
          nsfw: false,
          name: "relax",
          description: "Switch to relax mode",
          dm_permission: true,
          contexts: null,
        },
        attachments: [],
      },
      nonce,
    };
    return this.safeIteractions(payload);
  }
}
