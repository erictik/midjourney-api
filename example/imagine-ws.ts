import "dotenv/config";
import { Midjourney } from "../src";
/**
 *
 * a simple example of using the imagine api with ws
 * ```
 * npx tsx example/imagine-ws.ts
 * ```
 */
async function main() {
  const client = new Midjourney({
    ServerId: <string>process.env.SERVER_ID,
    ChannelId: <string>process.env.CHANNEL_ID,
    SalaiToken: <string>process.env.SALAI_TOKEN,
    HuggingFaceToken: <string>process.env.HUGGINGFACE_TOKEN,
    Debug: true,
    Ws: true,
  });
  await client.init();
  const msg = await client.Imagine(
    "the queen of the underworld, race: vampire, appearance: delicate features with detailed portrayal, super exquisite facial features, silver long hair reaching ankles, silver pupils, fair skin with a hint of melancholy in the eyes, beautiful and noble, clothing: wearing a blood-red rose on the hair, skirt with layers of lace, sitting in a (pose), captured in ultra-high resolution, film-like realism, 8k for the best visual quality, super clear and finely drawn. --ar 9:16 --v 5",
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
