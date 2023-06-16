import { MJConfig } from "./interfaces";

export const CommandNames = [
  "imagine",
  "describe",
  "info",
  "fast",
  "relax",
  "settings",
] as const;
export type commandName = (typeof CommandNames)[number];

export class Command {
  constructor(public config: MJConfig) {}
  async getCommand(name: commandName): Promise<Command> {
    // get from discord
    const url = `${this.config.DiscordBaseUrl}/api/v9/channels/${this.config.ChannelId}/application-commands/search?type=1&query=${name}&limit=1&include_applications=false`;
    const response = await fetch(url, {
      headers: { authorization: this.config.SalaiToken },
    });
    const data = await response.json();
    console.log({ data });
    // if ("application_commands" in data) {
    //   const application_commands = data.application_commands;
    //   if (application_commands[0]) {
    //     // command = application_commands[0];
    //     // if (cacheFile) {
    //     //   await Deno.writeTextFile(
    //     //     cacheFile,
    //     //     JSON.stringify(command, undefined, 2)
    //     //   );
    //     // }
    //   }
    // }
    throw Error(`Failed to get application_commands for command ${name}`);
  }
}
