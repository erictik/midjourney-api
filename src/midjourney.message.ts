import { LoadingHandler, MJMessage } from "./interfaces";
import { CreateQueue } from "./queue";
import { sleep } from "./utls";

export class MidjourneyMessage {
  private magApiQueue = CreateQueue(1);
  constructor(
    public ChannelId: string,
    protected SalaiToken: string,
    public debug = false,
    public Limit = 50,
    public maxWait = 100
  ) {
    this.log("MidjourneyMessage constructor");
  }
  protected log(...args: any[]) {
    this.debug && console.log(...args, new Date().toISOString());
  }
  async FilterMessages(
    prompt: string,
    loading?: LoadingHandler,
    options?: string,
    index?: number
  ) {
    const data = await this.safeRetrieveMessages(this.Limit);
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (
        item.author.id === "936929561302675456" &&
        item.content.includes(`**${prompt}`)
      ) {
        this.log(JSON.stringify(item));
        // Upscaled or Variation
        if (
          options &&
          !(
            item.content.includes(options) ||
            (options === "Upscaled" && item.content.includes(`Image #${index}`))
          )
        ) {
          this.log("no options");
          continue;
        }
        if (item.attachments.length === 0) {
          this.log("no attachment");
          break;
        }
        const imageUrl = item.attachments[0].url;
        //waiting
        if (
          item.attachments[0].filename.startsWith("grid") ||
          item.components.length === 0
        ) {
          this.log(`content`, item.content);
          const regex = /\(([^)]+)\)/; // matches the value inside the first parenthesis
          const match = item.content.match(regex);
          let progress = "wait";
          if (match) {
            progress = match[1];
          } else {
            this.log("No match found");
          }
          loading?.(imageUrl, progress);
          break;
        }
        //finished
        const content = item.content.split("**")[1];
        const msg: MJMessage = {
          id: item.id,
          uri: imageUrl,
          hash: this.UriToHash(imageUrl),
          content: content,
          progress: "done",
        };
        return msg;
      }
    }
    return null;
  }
  UriToHash(uri: string) {
    return uri.split("_").pop()?.split(".")[0] ?? "";
  }
  async WaitMessage(prompt: string, loading?: LoadingHandler) {
    for (let i = 0; i < this.maxWait; i++) {
      const msg = await this.FilterMessages(prompt, loading);
      if (msg !== null) {
        return msg;
      }
      this.log(i, "wait no message found");
      await sleep(1000 * 2);
    }
  }

  async WaitOptionMessage(
    content: string,
    options: string,
    loading?: LoadingHandler
  ) {
    for (let i = 0; i < this.maxWait; i++) {
      const msg = await this.FilterMessages(content, loading, options);
      if (msg !== null) {
        return msg;
      }
      this.log(i, content, "wait no message found");
      await sleep(1000 * 2);
    }
  }
  async WaitUpscaledMessage(
    content: string,
    index: number,
    loading?: LoadingHandler
  ) {
    for (let i = 0; i < this.maxWait; i++) {
      const msg = await this.FilterMessages(
        content,
        loading,
        "Upscaled",
        index
      );
      if (msg !== null) {
        return msg;
      }
      this.log(i, content, "wait no message found");
      await sleep(1000 * 2);
    }
  }

  // limit the number of concurrent interactions
  protected async safeRetrieveMessages(limit = 50) {
    return this.magApiQueue.addTask(() => this.RetrieveMessages(limit));
  }
  async RetrieveMessages(limit = 50) {
    const headers = { authorization: this.SalaiToken };
    const response = await fetch(
      `https://discord.com/api/v10/channels/${this.ChannelId}/messages?limit=${limit}`,
      {
        headers: headers,
      }
    );
    const data = await response.json();
    return data;
  }
}
