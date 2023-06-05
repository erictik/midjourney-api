import "dotenv/config";
import { Midjourney } from "../src";
/**
 *
 * a simple example of using the info api
 * ```
 * npx tsx example/imagine-info.ts
 * ```
 */
async function main() {
  const client = new Midjourney({
    SalaiToken: <string>process.env.SALAI_TOKEN,
    Debug: true,
    Ws: true,
  });
  await client.init();
  const msg = await client.Info();
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
