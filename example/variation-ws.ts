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
  await client.init(); //init auto enable remix
  const prompt =  "the queen of the underworld, race"
  const Imagine = await client.Imagine(prompt);
  console.log({ Imagine });
  if (!Imagine) {
    console.log("no message");
    return;
  }
  const Variation = await client.Variation({
    index: 2,
    msgId: <string>Imagine.id,
    hash: <string>Imagine.hash,
    flags: Imagine.flags,
    content:prompt,
    loading: (uri: string, progress: string) => {
      console.log("Variation2.loading", uri, "progress", progress);
    },
  });
  console.log("Variation", Variation);
  // await client
  //   .Variation({
  //     index: 2,
  //     msgId: <string>Imagine.id,
  //     hash: <string>Imagine.hash,
  //     flags: Imagine.flags,
  //     loading: (uri: string, progress: string) => {
  //       console.log("Variation2.loading", uri, "progress", progress);
  //     },
  //   })
  //   .then((msg2) => {
  //     console.log({ msg2 });
  //   });
  // client
  //   .Variation({
  //     index: 3,
  //     msgId: <string>Imagine.id,
  //     hash: <string>Imagine.hash,
  //     flags: Imagine.flags,
  //     loading: (uri: string, progress: string) => {
  //       console.log("Variation3.loading", uri, "progress", progress);
  //     },
  //   })
  //   .then((msg3) => {
  //     console.log({ msg3 });
  //   });
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
