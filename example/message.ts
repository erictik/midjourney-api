import "dotenv/config";
import { WsMessage } from "../src";
/**
 *
 * a simple example of how to use the imagine command
 * ```
 * npx tsx example/message.ts
 * ```
 */
async function main() {
  const client = new WsMessage({
    ChannelId: <string>process.env.CHANNEL_ID,
    SalaiToken: <string>process.env.SALAI_TOKEN,
    Debug: true,
  });
  console.log("client");
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
