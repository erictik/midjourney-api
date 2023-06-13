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
  const Imagine = await client.Imagine(
    "A little white elephant",
    (uri: string, progress: string) => {
      console.log("Imagine.loading", uri, "progress", progress);
    }
  );
  console.log({ Imagine });
  if (!Imagine) {
    return;
  }
  const Variation = await client.Variation(
    Imagine.content,
    2,
    <string>Imagine.id,
    <string>Imagine.hash,
    (uri: string, progress: string) => {
      console.log("Variation.loading", uri, "progress", progress);
    }
  );

  console.log({ Variation });
  if (!Variation) {
    return;
  }
  const Upscale = await client.Upscale(
    Variation.content,
    2,
    <string>Variation.id,
    <string>Variation.hash,
    (uri: string, progress: string) => {
      console.log("Upscale.loading", uri, "progress", progress);
    }
  );
  console.log({ Upscale });
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
