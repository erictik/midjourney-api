import "dotenv/config";
import { Midjourney } from "../src";
/**
 *
 * a simple example of using the prefer remix api
 * ```
 * npx tsx example/prefer-remix.ts
 * ```
 */
async function main() {
  const client = new Midjourney({
    ServerId: <string>process.env.SERVER_ID,
    ChannelId: <string>process.env.CHANNEL_ID,
    SalaiToken: <string>process.env.SALAI_TOKEN,
    Debug: true,
    Ws: true, //enable ws is required for prefer remix
  });
  await client.Connect();
  const msg = await client.SwitchRemix();
  console.log(msg);
  client.Close();
}
main()
  .then(() => {
    console.log("finished");
    process.exit(0);
  })
  .catch((err) => {
    console.log("finished");
    console.error(err);
    process.exit(1);
  });
