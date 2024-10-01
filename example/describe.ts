import "dotenv/config";
import { Midjourney } from "../src";
/**
 *
 * a simple example of using the describe api
 * ```
 * npx tsx example/describe.ts
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
  const Describe = await client.Describe(
    "https://cdn.discordapp.com/attachments/1107965981839605792/1119977411631652914/Soga_a_cool_cat_blue_ears_yellow_hat_02afd1ed-17eb-4a61-9101-7a99b105e4cc.png"
  );
  console.log(Describe);
  if (!Describe) {
    console.log("failed to describe");
  }
}
main().catch((err) => {
  console.log("finished");
  console.error(err);
  process.exit(1);
});
