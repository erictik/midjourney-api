import "dotenv/config";
import { Midjourney, NijiBot } from "../src";
/**
 *
 * a simple example of using the imagine api via DM Niji Bot
 * ```
 * npx tsx example/imagine-niji.ts
 * ```
 */
async function main() {
  const client = new Midjourney({
    SalaiToken: <string>process.env.SALAI_TOKEN,
    BotId: NijiBot, // NijiBot 
    ChannelId: "1125452970276954204",
    Debug: true,
    Ws: true,
  });
  await client.Connect();
  const info = await client.Info();
  console.log(info);
  const msg = await client.Imagine(
    "A little white dog",
    (uri: string, progress: string) => {
      console.log("loading", uri, "progress", progress);
    }
  );
  console.log( msg );
  client.Close();
}
main()
  .then(() => {
    // console.log("finished");
    // process.exit(0);
  })
  .catch((err) => {
    console.log("finished");
    console.error(err);
    process.exit(1);
  });
