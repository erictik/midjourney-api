import { DiscordImage, MJConfig } from "./interfaces";
import async from "async";
import { sleep } from "./utils";
export const Commands = [
  "ask",
  "blend",
  "describe",
  "fast",
  "help",
  "imagine",
  "info",
  "prefer",
  "private",
  "public",
  "relax",
  "settings",
  "show",
  "stealth",
  "shorten",
  "subscribe",
] as const;
export type CommandName = (typeof Commands)[number];
function getCommandName(name: string): CommandName | undefined {
  for (const command of Commands) {
    if (command === name) {
      return command;
    }
  }
}

export class Command {
  constructor(public config: MJConfig) {}
  cache: Partial<Record<CommandName, Command>> = {};

  async cacheCommand(name: CommandName) {
    if (this.cache[name] !== undefined) {
      return this.cache[name];
    }
    const command = await this.getCommand(name);
    console.log("=========", { command });
    this.cache[name] = command;
    return command;
    this.allCommand();
    return this.cache[name];
  }
  async allCommand() {
    let serverId = this.config.ServerId;
    if (!serverId) {
      serverId = this.config.ChannelId;
    }
    const url = `${this.config.DiscordBaseUrl}/api/v9/guilds/${serverId}/application-command-index`;
    const response = await this.safeFetch(url, {
      headers: { authorization: this.config.SalaiToken },
    });

    const data = await response.json();
    if (data?.application_commands) {
      data.application_commands.forEach((command: any) => {
        const name = getCommandName(command.name);
        if (name) {
          this.cache[name] = command;
        }
      });
    }
  }

  async getCommand(name: CommandName) {
    let serverId = this.config.ServerId;
    if (!serverId) {
      serverId = this.config.ChannelId;
    }
    const url = `${this.config.DiscordBaseUrl}/api/v9/guilds/${serverId}/application-command-index`;
    const response = await this.safeFetch(url, {
      headers: { authorization: this.config.SalaiToken },
    });
    const data = await response.json();
    if (data?.application_commands?.[0]) {
      return data.application_commands[0];
    }
    throw new Error(`Failed to get application_commands for command ${name}`);
  }
  private safeFetch(input: RequestInfo | URL, init?: RequestInit | undefined) {
    const request = this.config.fetch.bind(this, input, init);
    return new Promise<Response>((resolve, reject) => {
      this.fetchQueue.push(
        {
          request,
          callback: (res: Response) => {
            resolve(res);
          },
        },
        (error: any, result: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });
  }
  private async processFetchRequest({
    request,
    callback,
  }: {
    request: () => Promise<Response>;
    callback: (res: Response) => void;
  }) {
    const res = await request();
    callback(res);
    await sleep(1000 * 4);
  }
  private fetchQueue = async.queue(this.processFetchRequest, 1);

  async imaginePayload(prompt: string, nonce?: string) {
    const data = await this.commandData("imagine", [
      {
        type: 3,
        name: "prompt",
        value: prompt,
      },
    ]);
    return this.data2Paylod(data, nonce);
  }
  async PreferPayload(nonce?: string) {
    const data = await this.commandData("prefer", [
      {
        type: 1,
        name: "remix",
        options: [],
      },
    ]);
    return this.data2Paylod(data, nonce);
  }

  async shortenPayload(prompt: string, nonce?: string) {
    const data = await this.commandData("shorten", [
      {
        type: 3,
        name: "prompt",
        value: prompt,
      },
    ]);
    return this.data2Paylod(data, nonce);
  }
  async infoPayload(nonce?: string) {
    const data = await this.commandData("info");
    return this.data2Paylod(data, nonce);
  }
  async fastPayload(nonce?: string) {
    const data = await this.commandData("fast");
    return this.data2Paylod(data, nonce);
  }
  async relaxPayload(nonce?: string) {
    const data = await this.commandData("relax");
    return this.data2Paylod(data, nonce);
  }
  async settingsPayload(nonce?: string) {
    const data = await this.commandData("settings");
    return this.data2Paylod(data, nonce);
  }
  async describePayload(image: DiscordImage, nonce?: string) {
    const data = await this.commandData(
      "describe",
      [
        {
          type: 11,
          name: "image",
          value: image.id,
        },
      ],
      [
        {
          id: <string>image.id,
          filename: image.filename,
          uploaded_filename: image.upload_filename,
        },
      ]
    );
    return this.data2Paylod(data, nonce);
  }

  protected async commandData(
    name: CommandName,
    options: any[] = [],
    attachments: any[] = []
  ) {
    const command = await this.cacheCommand(name);
    const data = {
      version: command.version,
      id: command.id,
      name: command.name,
      type: command.type,
      options,
      application_command: command,
      attachments,
    };
    return data;
  }
  //TODO data type
  protected data2Paylod(data: any, nonce?: string) {
    const payload = {
      type: 2,
      application_id: data.application_command.application_id,
      guild_id: this.config.ServerId,
      channel_id: this.config.ChannelId,
      session_id: this.config.SessionId,
      nonce,
      data,
    };
    return payload;
  }
}
