import "dotenv/config";
import { Midjourney } from "../src";
/**
 *
 * a simple example of using the shorten api
 * ```
 * npx tsx example/shorten.ts
 * ```
 */
async function main() {
  const client = new Midjourney({
    ServerId: <string>process.env.SERVER_ID,
    ChannelId: <string>process.env.CHANNEL_ID,
    SalaiToken: <string>process.env.SALAI_TOKEN,
    Debug: true,
    Ws: true,
  });
  await client.Connect();
  const Shorten = await client.Shorten(
    "Peeking out from the bushes, masterpiece, octane rendering, focus, realistic photography, colorful background, detailed, intricate details, rich colors, realistic style"
  );
  console.log(Shorten);
  client.Close();
}
main().catch((err) => {
  console.log("finished");
  console.error(err);
  process.exit(1);
});
