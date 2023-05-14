import "dotenv/config";
import { Midjourney, MidjourneyMessage } from "../src";
/**
 *
 * a simple example of how to use the imagine command
 * ```
 * npx tsx example/message.ts
 * ```
 */
async function main() {
  const client = new MidjourneyMessage({
    ChannelId: <string>process.env.CHANNEL_ID,
    SalaiToken: <string>process.env.SALAI_TOKEN,
  });
  const msg = await client.RetrieveMessages();
  console.log({ msg });
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
