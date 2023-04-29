require("dotenv").config();
const { Midjourney } = require("../libs");
/**
 *
 * a simple example of how to use the imagine command
 * ```
 * npx tsx example/imagine.ts
 * ```
 */
async function main() {
  const client = new Midjourney(
    process.env.SERVER_ID,
    process.env.CHANNEL_ID,
    process.env.SALAI_TOKEN,
    true
  );
  const msg = await client.Imagine("A little pink elephant", (uri) => {
    console.log("loading", uri);
  });
  console.log({ msg });
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
