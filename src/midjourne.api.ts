import { DiscordImage, MJConfig, UploadParam, UploadSlot } from "./interfaces";
import { CreateQueue } from "./queue";
import { nextNonce, sleep } from "./utls";
import * as fs from "fs";
import path from "path";
import * as mime from "mime";
export class MidjourneyApi {
  private apiQueue = CreateQueue(1);
  UpId = Date.now() % 10; // upload id
  constructor(public config: MJConfig) {}
  // limit the number of concurrent interactions
  protected async safeIteractions(payload: any) {
    return this.apiQueue.addTask(
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
      const response = await this.config.fetch(
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
        console.error("api.error.config", { payload, config: this.config });
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
        version: "1118961510123847772",
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
          version: "1118961510123847772",
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
  async VariationApi({
    index,
    msgId,
    hash,
    nonce = nextNonce(),
    flags = 0,
  }: {
    index: 1 | 2 | 3 | 4;
    msgId: string;
    hash: string;
    nonce?: string;
    flags?: number;
  }) {
    return this.CustomApi({
      msgId,
      customId: `MJ::JOB::variation::${index}::${hash}`,
      flags,
      nonce,
    });
  }
  async UpscaleApi({
    index,
    msgId,
    hash,
    nonce = nextNonce(),
    flags,
  }: {
    index: 1 | 2 | 3 | 4;
    msgId: string;
    hash: string;
    nonce?: string;
    flags: number;
  }) {
    return this.CustomApi({
      msgId,
      customId: `MJ::JOB::upsample::${index}::${hash}`,
      flags,
      nonce,
    });
  }
  async RerollApi({
    msgId,
    hash,
    nonce = nextNonce(),
    flags,
  }: {
    msgId: string;
    hash: string;
    nonce?: string;
    flags: number;
  }) {
    return this.CustomApi({
      msgId,
      customId: `MJ::JOB::reroll::0::${hash}::SOLO`,
      flags,
      nonce,
    });
  }

  async CustomApi({
    msgId: msgId,
    customId,
    flags,
    nonce = nextNonce(),
  }: {
    msgId: string;
    customId: string;
    flags: number;
    nonce?: string;
  }) {
    const guild_id = this.config.ServerId;
    const payload = {
      type: 3,
      nonce,
      guild_id,
      channel_id: this.config.ChannelId,
      message_flags: flags,
      message_id: msgId,
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
      session_id: this.config.SessionId,
      data: {
        version: "1118961510123847776",
        id: "972289487818334209",
        name: "info",
        type: 1,
        options: [],
        application_command: {
          id: "972289487818334209",
          application_id: "936929561302675456",
          version: "972289487818334209",
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
      session_id: this.config.SessionId,
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
      session_id: this.config.SessionId,
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
  /**
   *
   * @param fileUrl http or local file path
   * @returns
   */
  async UploadImage(fileUrl: string) {
    let fileData;
    let mimeType;
    let filename;
    let file_size;

    if (fileUrl.startsWith("http")) {
      const response = await this.config.fetch(fileUrl);
      fileData = await response.arrayBuffer();
      mimeType = response.headers.get("content-type");
      filename = path.basename(fileUrl) || "image.png";
      file_size = fileData.byteLength;
    } else {
      fileData = await fs.promises.readFile(fileUrl);
      mimeType = mime.getType(fileUrl);
      filename = path.basename(fileUrl);
      file_size = (await fs.promises.stat(fileUrl)).size;
    }
    if (!mimeType) {
      throw new Error("Unknown mime type");
    }
    const { attachments } = await this.attachments({
      filename,
      file_size,
      id: this.UpId++,
    });
    const UploadSlot = attachments[0];
    await this.uploadImage(UploadSlot, fileData, mimeType);
    const response: DiscordImage = {
      id: UploadSlot.id,
      filename: path.basename(UploadSlot.upload_filename),
      upload_filename: UploadSlot.upload_filename,
    };
    return response;
  }

  /**
   * prepare an attachement to upload an image.
   */
  private async attachments(
    ...files: UploadParam[]
  ): Promise<{ attachments: UploadSlot[] }> {
    const headers = {
      Authorization: this.config.SalaiToken,
      "content-type": "application/json",
    };
    const url = new URL(
      `${this.config.DiscordBaseUrl}/api/v9/channels/${this.config.ChannelId}/attachments`
    );
    const body = { files };
    const response = await this.config.fetch(url.toString(), {
      headers,
      method: "POST",
      body: JSON.stringify(body),
    });
    if (response.status === 200) {
      return (await response.json()) as { attachments: UploadSlot[] };
    }
    throw new Error(
      `Attachments return ${response.status} ${
        response.statusText
      } ${await response.text()}`
    );
  }
  private async uploadImage(
    slot: UploadSlot,
    data: ArrayBuffer,
    contentType: string
  ): Promise<void> {
    const body = new Uint8Array(data);
    const headers = { "content-type": contentType };
    const response = await this.config.fetch(slot.upload_url, {
      method: "PUT",
      headers,
      body,
    });
    if (!response.ok) {
      throw new Error(
        `uploadImage return ${response.status} ${
          response.statusText
        } ${await response.text()}`
      );
    }
  }
  async DescribeApi(data: DiscordImage, nonce?: string) {
    const payload = {
      type: 2,
      application_id: "936929561302675456",
      guild_id: this.config.ServerId,
      channel_id: this.config.ChannelId,
      session_id: this.config.SessionId,
      data: {
        version: "1118961510123847774",
        id: "1092492867185950852",
        name: "describe",
        type: 1,
        options: [{ type: 11, name: "image", value: data.id }],
        application_command: {
          id: "1092492867185950852",
          application_id: "936929561302675456",
          version: "1092492867185950853",
          default_member_permissions: null,
          type: 1,
          nsfw: false,
          name: "describe",
          description: "Writes a prompt based on your image.",
          dm_permission: true,
          contexts: null,
          options: [
            {
              type: 11,
              name: "image",
              description: "The image to describe",
              required: true,
            },
          ],
        },
        attachments: [
          {
            id: <string>data.id,
            filename: data.filename,
            uploaded_filename: data.upload_filename,
          },
        ],
      },
      nonce,
    };
    return this.safeIteractions(payload);
  }
}
