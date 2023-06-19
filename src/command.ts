import { DiscordImage, MJConfig } from "./interfaces";

type CommandName =
  | "imagine"
  | "describe"
  | "info"
  | "fast"
  | "relax"
  | "settings";
export class Command {
  constructor(public config: MJConfig) {}
  private cache: Record<CommandName, any> = {
    imagine: undefined,
    describe: undefined,
    info: undefined,
    fast: undefined,
    relax: undefined,
    settings: undefined,
  };

  async cacheCommand(name: CommandName) {
    if (this.cache[name] !== undefined) {
      return this.cache[name];
    }
    const command = await this.getCommand(name);
    this.cache[name] = command;
    return command;
  }
  async getCommand(name: CommandName) {
    const searchParams = new URLSearchParams({
      type: "1",
      query: name,
      limit: "1",
      include_applications: "false",
    });

    const url = `${this.config.DiscordBaseUrl}/api/v9/channels/${this.config.ChannelId}/application-commands/search?${searchParams}`;

    const response = await fetch(url, {
      headers: { authorization: this.config.SalaiToken },
    });

    const data = await response.json();

    if ("application_commands" in data) {
      const application_commands = data.application_commands;
      if (application_commands[0]) {
        // console.log(
        //   `got ${name} application_commands`,
        //   application_commands[0]
        // );
        return application_commands[0];
      }
    }

    throw new Error(`Failed to get application_commands for command ${name}`);
  }
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

  protected data2Paylod(data: any, nonce?: string) {
    const payload = {
      type: 2,
      application_id: "936929561302675456",
      guild_id: this.config.ServerId,
      channel_id: this.config.ChannelId,
      session_id: this.config.SessionId,
      nonce,
      data,
    };
    return payload;
  }
}
