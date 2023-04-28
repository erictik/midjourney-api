import "dotenv/config";
import { Midjourney } from "../src";
/**
 *
 * a simple example of how to use the Variation command
 * ```
 * npx tsx example/variation.ts
 * ```
 */
async function main() {
  const client = new Midjourney(
    <string>process.env.SERVER_ID,
    <string>process.env.CHANNEL_ID,
    <string>process.env.SALAI_TOKEN,
    true
  );
  const msg = await client.Imagine("a dog, blue ears, and a red nose");
  console.log({ msg });
  if (!msg) {
    console.log("no message");
    return;
  }
  const msg2 = await client.Variation(
    msg.content,
    2,
    msg.id,
    msg.hash,
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
