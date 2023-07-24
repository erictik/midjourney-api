import "dotenv/config";
import { Midjourney } from "../src";
/**
 *
 * a simple example of how to use the (custom pan) options with ws command
 * keep remix turned off in your settings for this to work
 * ```
 * npx tsx example/custompan.ts
 * ```
 */
async function main() {
  const client = new Midjourney({
    ServerId: <string>process.env.SERVER_ID,
    ChannelId: <string>process.env.CHANNEL_ID,
    SalaiToken: <string>process.env.SALAI_TOKEN,
    Debug: true,
    Ws: true, //enable ws is required for custom pan
  });
  await client.init();
  const prompt =
    "Christmas dinner with spaghetti with family in a cozy house, we see interior details , simple blue&white illustration";
  //imagine
  const Imagine = await client.Imagine(
    prompt,
    (uri: string, progress: string) => {
      console.log("loading", uri, "progress", progress);
    }
  );
  console.log(Imagine);
  if (!Imagine) {
    console.log("no message");
    return;
  }
  //U1 U2 U3 U4 V1 V2 V3 V4  "Vary (Strong)" ...
  const V1CustomID = Imagine.options?.find((o) => o.label === "V1")?.custom;
  if (!V1CustomID) {
    console.log("no V1");
    return;
  }
  // Varition V1
  const Varition = await client.Custom({
    msgId: <string>Imagine.id,
    flags: Imagine.flags,
    customId: V1CustomID,
    loading: (uri: string, progress: string) => {
      console.log("loading", uri, "progress", progress);
    },
  });
  console.log(Varition);
  const U1CustomID = Imagine.options?.find((o) => o.label === "U1")?.custom;
  if (!U1CustomID) {
    console.log("no U1");
    return;
  }
  // Upscale U1
  const Upscale = await client.Custom({
    msgId: <string>Imagine.id,
    flags: Imagine.flags,
    customId: U1CustomID,
    loading: (uri: string, progress: string) => {
      console.log("loading", uri, "progress", progress);
    },
  });
  if (!Upscale) {
    console.log("no Upscale");
    return;
  }
  console.log(Upscale);
  const panright = Upscale?.options?.find((o) => o.label === "➡️"); // keep remix turned off in your settings for this to work
  if (!panright) {
    console.log("no panright");
    return;
  }
  // Custom Pan
  const CustomPanRight = await client.Custom({
    msgId: <string>Upscale.id,
    flags: Upscale.flags,
    content: `${prompt} --pan_right 2`,
    customId: panright.custom,
    loading: (uri: string, progress: string) => {
      console.log("loading", uri, "progress", progress);
    },
  });
  console.log("Custom Pan", CustomPanRight);
  client.Close();
}
main()
  .then(() => {
    console.log("done");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
