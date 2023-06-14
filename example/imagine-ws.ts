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
    "Red hamster smoking a cigaret, https://media.discordapp.net/attachments/1108515696385720410/1118385339732590682/DanielH_A_giant_hamster_monster._Friendly_in_a_business_suit_si_d4be1836-a4e1-41a8-b1d7-99eebc521220.png?width=1878&height=1878 ",
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
  client.Close();
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
