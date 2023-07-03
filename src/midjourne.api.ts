import { CustomZoomModalSubmitID, DescribeModalSubmitID, DiscordImage, MJConfig, ModalSubmitID, RemixModalSubmitID, ShortenModalSubmitID, UploadParam, UploadSlot } from "./interfaces";
import { CreateQueue } from "./queue";
import { nextNonce, sleep } from "./utls";
import * as fs from "fs";
import path from "path";
import * as mime from "mime";
import { Command } from "./command";
export class MidjourneyApi extends Command {
  private apiQueue = CreateQueue(1);
  UpId = Date.now() % 10; // upload id
  constructor(public config: MJConfig) {
    super(config);
  }
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
    const payload = await this.imaginePayload(prompt, nonce);
    return this.safeIteractions(payload);
  }
  async ShortenApi(prompt: string, nonce: string = nextNonce()) {
    const payload = await this.shortenPayload(prompt, nonce);
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
    msgId,
    customId,
    flags,
    nonce = nextNonce(),
  }: {
    msgId: string;
    customId: string;
    flags: number;
    nonce?: string;
  }) {
    const payload = {
      type: 3,
      nonce,
      guild_id: this.config.ServerId,
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

  async ModalSubmitApi({
    nonce ,
    msgId,
    customId,
    prompt,
    submitCustomId
  }:{
    nonce: string;
    msgId: string;
    customId: string;
    prompt: string;
    submitCustomId:ModalSubmitID;
  }) {
    var payload = {
      type: 5,
      application_id: "936929561302675456",
      guild_id: this.config.ServerId,
      channel_id: this.config.ChannelId,
      session_id: this.config.SessionId,
      nonce,
      data: {
        id:msgId,
        custom_id: customId,
        components: [
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: submitCustomId,
                value:prompt,
              },
            ],
          },
        ],
      },
    }
    return this.safeIteractions(payload);
  }
  async RemixApi({
    nonce ,
    msgId,
    customId,
    prompt,
  }:{
    nonce: string;
    msgId: string;
    customId: string;
    prompt: string;
  }) {
    return this.ModalSubmitApi({
      nonce,
      msgId,
      customId,
      prompt,
      submitCustomId:RemixModalSubmitID
    })
  }
  async ShortenImagineApi({
    nonce ,
    msgId,
    customId,
    prompt,
  }:{
    nonce: string;
    msgId: string;
    customId: string;
    prompt: string;
  }){
    return this.ModalSubmitApi({
      nonce,
      msgId,
      customId,
      prompt,
      submitCustomId:ShortenModalSubmitID
    })
  }


  
  async DescribeImagineApi({
    nonce ,
    msgId,
    customId,
    prompt,
  }:{
    nonce: string;
    msgId: string;
    customId: string;
    prompt: string;
  }){
    return this.ModalSubmitApi({
      nonce,
      msgId,
      customId,
      prompt,
      submitCustomId:DescribeModalSubmitID
    })
  }

  async  CustomZoompi({
    nonce ,
    msgId,
    customId,
    prompt,
  }:{
    nonce: string;
    msgId: string;
    customId: string;
    prompt: string;
  }){
    return this.ModalSubmitApi({
      nonce,
      msgId,
      customId,
      prompt,
      submitCustomId:CustomZoomModalSubmitID
    })
  }


  async InfoApi(nonce?: string) {
    const payload = await this.infoPayload(nonce);
    return this.safeIteractions(payload);
  }
  async SettingsApi(nonce?: string) {
    const payload = await this.settingsPayload(nonce);
    return this.safeIteractions(payload);
  }
  async FastApi(nonce?: string) {
    const payload = await this.fastPayload(nonce);
    return this.safeIteractions(payload);
  }
  async RelaxApi(nonce?: string) {
    const payload = await this.relaxPayload(nonce);
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
    const { SalaiToken, DiscordBaseUrl, ChannelId, fetch } = this.config;
    const headers = {
      Authorization: SalaiToken,
      "content-type": "application/json",
    };
    const url = new URL(
      `${DiscordBaseUrl}/api/v9/channels/${ChannelId}/attachments`
    );
    const body = { files };
    const response = await this.config.fetch(url, {
      headers,
      method: "POST",
      body: JSON.stringify(body),
    });
    if (response.status === 200) {
      return (await response.json()) as { attachments: UploadSlot[] };
    }
    const error = `Attachments return ${response.status} ${
      response.statusText
    } ${await response.text()}`;
    throw new Error(error);
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
  async DescribeApi(image: DiscordImage, nonce?: string) {
    const payload = await this.describePayload(image, nonce);
    return this.safeIteractions(payload);
  }
}
