import "dotenv/config";
import { Midjourney } from "../src";
/**
 *
 * a simple example of how to use the Upscale with ws command
 * ```
 * npx tsx example/upscale-ws.ts
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
  await client.init();
  const msg = await client.Imagine("a cool cat, blue ears, yellow hat");
  console.log({ msg });
  if (!msg) {
    console.log("no message");
    return;
  }
  const msg2 = await client.Upscale(
    msg.content,
    2,
    <string>msg.id,
    <string>msg.hash,
    (uri: string, progress: string) => {
      console.log("loading", uri, "progress", progress);
    }
  );
  console.log({ msg2 });
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
