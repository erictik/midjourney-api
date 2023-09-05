import "dotenv/config";
import fs from 'fs';
import { Midjourney } from "../src";
/**
 *
 * a simple example of how to use the (custom pan) options with ws command
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
    "Blonde Boy plays with Golden Retreiever in dream-like grassy field ::3 happy :: blonde :: golden retriever :: green nature :: simple yellow and orange illustration";
  const remixPrompt =
    "dream-like grassy field ::3 happy :: green nature :: simple yellow and orange illustration";
  
  /* comment out imagine and upscale if using load from file */
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

  // Upscale U1
  const U1CustomID = Imagine.options?.find((o) => o.label === "U1")?.custom;
  if (!U1CustomID) {
    console.log("no U1");
    return;
  }
  const Upscale = await client.Custom({
    msgId: <string>Imagine.id,
    flags: Imagine.flags,
    customId: U1CustomID,
    loading: (uri: string, progress: string) => {
      console.log("loading", uri, "progress", progress);
    },
  });

  /* comment out save and load if using imagine and upscale
  // save Upscale post-imagine so image doesnt have to be generated every time testing on custom pan is run
  fs.writeFileSync('savedUpscale.json', JSON.stringify(Upscale, null, 2));
  
  // load from file
  const jsonString = fs.readFileSync('savedUpscale.json', 'utf-8');
  const Upscale = JSON.parse(jsonString);
  */

  if(!Upscale){
    console.log("no Upscale");
    return;
  }
  console.log("UPSCALE:", Upscale);

  // Custom Pan
  const pan = Upscale?.options?.find((o) => o.label === "➡️");
  if (!pan) {
    console.log("no pan");
    return;
  }
  const CustomPan = await client.Custom({
    msgId: <string>Upscale.id,
    flags: Upscale.flags,
    content: `${remixPrompt}`,
    customId: pan.custom,
    loading: (uri: string, progress: string) => {
      console.log("loading", uri, "progress", progress);
    },
  });
  console.log("Custom Pan", CustomPan);
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
