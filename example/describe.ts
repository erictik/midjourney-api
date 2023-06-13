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
  await client.init();
  const msg = await client.Describe(
    "https://img.ohdat.io/midjourney-image/1b74cab8-70c9-474e-bfbb-093e9a3cfd5c/0_1.png"
  );
  console.log({ msg });
}
main().catch((err) => {
  console.log("finished");
  console.error(err);
  process.exit(1);
});
