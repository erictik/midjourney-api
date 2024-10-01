import "dotenv/config";
import { Midjourney } from "../src";
/**
 *
 * a simple example of using the relax api
 * ```
 * npx tsx example/relax.ts
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
  await client.Relax();
  const msg = await client.Info();
  console.log({ msg });
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
