import "dotenv/config";
import { Midjourney } from "../src";
/**
 *
 * a simple example of how to use the options with ws command
 * ```
 * npx tsx example/options.ts
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
  const Imagine = await client.Imagine("a cool cat, blue ears, yellow hat");
  console.log(Imagine);
  if (!Imagine) {
    console.log("no message");
    return;
  }
  const Upscale = await client.Upscale({
    index: 2,
    msgId: <string>Imagine.id,
    hash: <string>Imagine.hash,
    flags: Imagine.flags,
    loading: (uri: string, progress: string) => {
      console.log("loading", uri, "progress", progress);
    },
  });
  const zoomout = Upscale?.options?.find((o) => o.label === "Zoom Out 2x");
  if (!zoomout) {
    console.log("no zoomout");
    return;
  }
  const zoomout2x = client.Custom({
    msgId: <string>Imagine.id,
    flags: Imagine.flags,
    customId: zoomout.custom,
    loading: (uri: string, progress: string) => {
      console.log("loading", uri, "progress", progress);
    },
  });
  console.log("zoomout2x", zoomout2x);

  client.Close();
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
