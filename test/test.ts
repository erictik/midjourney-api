import "dotenv/config";
import { Command, DefaultMJConfig, Midjourney, WsMessage } from "../src";
/**
 *
 * a simple example of how to use the imagine command
 * ```
 * npx tsx test/test.ts
 * ```
 */

async function test2() {
  const config = {
    ...DefaultMJConfig,
    ...{
      ServerId: <string>process.env.SERVER_ID,
      ChannelId: <string>process.env.CHANNEL_ID,
      SalaiToken: <string>process.env.SALAI_TOKEN,
    },
  };

  const command = new Command(config);
  const msg = await command.getCommand("imagine");
}
test2();
