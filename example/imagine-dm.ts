import "dotenv/config";
import { Midjourney } from "../src";
/**
 *
 * a simple example of using the imagine api via DM Midjourney Bot
 * ```
 * npx tsx example/imagine-dm.ts
 * ```
 */
async function main() {
  const client = new Midjourney({
    SalaiToken: <string>process.env.SALAI_TOKEN,
    Debug: true,
    Ws: true,
  });
  await client.Connect();
  const msg = await client.Imagine(
    "A little white dog",
    (uri: string, progress: string) => {
      console.log("loading", uri, "progress", progress);
    }
  );
  console.log({ msg });
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
