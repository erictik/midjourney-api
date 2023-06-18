import "dotenv/config";
import { Midjourney } from "../src";
/**
 *
 * a simple example of how to use the Variation with ws command
 * ```
 * npx tsx example/variation-ws.ts
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
  const Imagine = await client.Imagine(
    "the queen of the underworld, race: vampire, appearance: delicate features with detailed portrayal, super exquisite facial features, silver long hair reaching ankles, silver pupils, fair skin with a hint of melancholy in the eyes, beautiful and noble, clothing: wearing a blood-red rose on the hair, skirt with layers of lace, sitting in a (pose), captured in ultra-high resolution, film-like realism, 8k for the best visual quality, super clear and finely drawn. --ar 9:16 --v 5"
  );
  console.log({ Imagine });
  if (!Imagine) {
    console.log("no message");
    return;
  }

  client
    .Variation({
      index: 2,
      msgId: <string>Imagine.id,
      hash: <string>Imagine.hash,
      flags: Imagine.flags,
      loading: (uri: string, progress: string) => {
        console.log("Variation2.loading", uri, "progress", progress);
      },
    })
    .then((msg2) => {
      console.log({ msg2 });
    });
  client
    .Variation({
      index: 3,
      msgId: <string>Imagine.id,
      hash: <string>Imagine.hash,
      flags: Imagine.flags,
      loading: (uri: string, progress: string) => {
        console.log("Variation3.loading", uri, "progress", progress);
      },
    })
    .then((msg3) => {
      console.log({ msg3 });
    });
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
