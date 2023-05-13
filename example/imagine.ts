import "dotenv/config";
import { Midjourney } from "../src";
/**
 *
 * a simple example of how to use the imagine command
 * ```
 * npx tsx example/imagine.ts
 * ```
 */
async function main() {
  const client = new Midjourney(
    <string>process.env.SERVER_ID,
    <string>process.env.CHANNEL_ID,
    <string>process.env.SALAI_TOKEN,
    true
  );
  client.Limit = 50;
  client.maxWait = 200;
  const msg = await client.Imagine(
    "A little white elephant",
    (uri: string, progress: string) => {
      console.log("loading", uri, "progress", progress);
    }
  );
  console.log({ msg });
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
