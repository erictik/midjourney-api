import "dotenv/config";
import { Midjourney } from "../src";
/**
 *
 * a simple example of how to use the Variation with ws command
 * ```
 * npx tsx example/variation-ws.ts
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
  const msg = await client.Imagine("a dog, blue ears, and a red nose");
  console.log({ msg });
  if (!msg) {
    console.log("no message");
    return;
  }
  const msg2 = await client.Variation(
    msg.content,
    2,
    <string>msg.id,
    <string>msg.hash,
    (uri: string) => {
      console.log("loading", uri);
    }
  );
  console.log({ msg2 });
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
