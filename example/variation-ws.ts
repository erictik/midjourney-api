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
  client
    .Variation(
      msg.content,
      2,
      <string>msg.id,
      <string>msg.hash,
      (uri: string) => {
        console.log("loading2", uri);
      }
    )
    .then((msg2) => {
      console.log({ msg2 });
    });
  client
    .Variation(
      msg.content,
      3,
      <string>msg.id,
      <string>msg.hash,
      (uri: string) => {
        console.log("loading3", uri);
      }
    )
    .then((msg3) => {
      console.log({ msg3 });
    });
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
