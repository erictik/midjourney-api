import "dotenv/config";
import { Midjourney } from "../src";
/**
 *
 * a simple example of how to use the imagine command
 * ```
 * npx tsx test/test.ts
 * ```
 */
async function main() {
  const client = new Midjourney(
    <string>process.env.SERVER_ID,
    <string>process.env.CHANNEL_ID,
    <string>process.env.SALAI_TOKEN,
    true
  );
  const msg = await client.RetrieveMessages(10);
  console.log(JSON.stringify(msg));
}
// main().catch((err) => {
//   console.error(err);
//   process.exit(1);
// });
function test2() {
  const item = {
    content:
      "**a cool cat, blue ears, blue hat --seed 9113 --v 5** - Image #2 <@1017020769332637730>",
  };
  const options = "Upscaled";
  const index = 2;
  // if (options === "Upscaled" && !item.content.includes(` - Image #${index}`)) {
  //   console.log("123123");
  // }
  if (
    item.content.includes(options) ||
    (options === "Upscaled" && item.content.includes(` - Image #${index}`))
  ) {
    console.log("has options");
  } else {
    console.log("no options");
    return;
  }
  console.log("no options");
}
test2();
