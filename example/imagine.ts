import "dotenv/config";
import { Midjourney } from "../src";
/**
 *
 * a simple example of how to use the imagine command
 * ```
 * npx tsx example/imagine.ts
 * ```
 */
async function main() {
  const client = new Midjourney({
    ServerId: <string>process.env.SERVER_ID,
    ChannelId: <string>process.env.CHANNEL_ID,
    SalaiToken: <string>process.env.SALAI_TOKEN,
    Debug: true,
    Ws: false,
  });

  const msg = await client.Imagine(
    "Red hamster",
    (uri: string, progress: string) => {
      console.log("loading", uri, "progress", progress);
    }
  );
  console.log(JSON.stringify(msg));
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
